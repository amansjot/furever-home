import express from "express";
import { MongoDBService, ObjectId } from "../database/mongodb.service";
import { InventorySettings } from "./inventory.settings";
import { InventoryItemModel } from "./inventory.models";
import { SellerModel } from "../seller/seller.models";

/* InventoryController
 * @class: InventoryController
 * @remarks: A class that contains the controller functions for the inventory module
 * 			  getInventory: a function that handles the get inventory request
 * 			  getItem: a function that handles the get item request
 */
export class InventoryController {
  private mongoDBService: MongoDBService = new MongoDBService(
    process.env.mongoConnectionString ||
      "mongodb+srv://singh:Aman@petadoption.nfugs.mongodb.net/"
  );
  private settings = new InventorySettings();

  /* getInventoryCount(req: express.Request, res: express.Response): Promise<void>
		@param {express.Request} req: The request object
		@param {express.Response} res: The response object
		@returns {Promise<void>}:
		@remarks: Handles the get inventory count request
		@async
	*/
  getInventoryCount = async (
    req: express.Request,
    res: express.Response
  ): Promise<void> => {
    try {
      const result = await this.mongoDBService.connect();
      if (!result) {
        res.status(500).send({ error: "Database connection failed" });
        return;
      }

      // Build the query based on filters from query parameters
      const filters: any = {};

      // Assuming filter parameters are passed as query strings in lowercase
      if (req.query.animal && req.query.animal !== "any") {
        filters.typeOfPet = req.query.animal.toString().toLowerCase();
      }
      if (req.query.sex && req.query.sex !== "any") {
        filters.sex = req.query.sex.toString().toLowerCase();
      }
      if (req.query.age && req.query.age !== "any") {
        const ageFilter = req.query.age.toString().toLowerCase();
        if (ageFilter === "very young") filters.age = { $lt: 1 };
        else if (ageFilter === "young") filters.age = { $gte: 1, $lte: 2 };
        else if (ageFilter === "adult") filters.age = { $gte: 3, $lte: 8 };
        else if (ageFilter === "senior") filters.age = { $gt: 8 };
      }
      if (req.query.price && req.query.price !== "any") {
        const priceFilter = req.query.price.toString().toLowerCase();
        if (priceFilter === "low") filters.price = { $lt: 500 };
        else if (priceFilter === "medium")
          filters.price = { $gte: 500, $lte: 1000 };
        else if (priceFilter === "high") filters.price = { $gt: 1000 };
      }
      if (req.query.location && req.query.location !== "any") {
        filters.location = req.query.location.toString();
      }

      // Use the filters object in the MongoDB count query
      const count = await this.mongoDBService.count(
        this.settings.database,
        this.settings.collection,
        filters
      );

      res.send({ count: count });
    } catch (error) {
      console.error("Error fetching inventory count:", error);
      res.status(500).send({ error: error });
    }
  };

  /* getInventory(req: express.Request, res: express.Response): Promise<void>
		@param {express.Request} req: The request object
		@param {express.Response} res: The response object
		@returns {Promise<void>}:
		@remarks: Handles the get inventory request.  If the request has query parameters, start and end, it will return the records between those two
		Otherwise it will return all records
		@async
	*/
  getInventory = async (
    req: express.Request,
    res: express.Response
  ): Promise<void> => {
    let items: InventoryItemModel[] = [];
    try {
      let result = await this.mongoDBService.connect();
      if (!result) {
        res.status(500).send({ error: "Database connection failed" });
        return;
      }
      if (req.query.start && req.query.end) {
        items = await this.mongoDBService.find<InventoryItemModel>(
          this.settings.database,
          this.settings.collection,
          {}
        );
      } else {
        items = await this.mongoDBService.find<InventoryItemModel>(
          this.settings.database,
          this.settings.collection,
          {}
        );
      }
      res.send(items);
    } catch (error) {
      res.status(500).send({ error: error });
    }
  };
  /* getItem(req: express.Request, res: express.Response): Promise<void>
		@param {express.Request} req: The request object
			expects the partnumber of the item to be in the params array of the request object as id
		@param {express.Response} res: The response object
		@returns {Promise<void>}:
		@remarks: Handles the get item request
		@async
	*/
  getItem = async (
    req: express.Request,
    res: express.Response
  ): Promise<void> => {
    try {
      let result = await this.mongoDBService.connect();
      if (!result) {
        res.status(500).send({ error: "Database connection failed" });
        return; // Return immediately after sending the response
      }

      let items = await this.mongoDBService.findOne<InventoryItemModel>(
        this.settings.database,
        this.settings.collection,
        { _id: new ObjectId(req.params.id) }
      );

      if (!items) {
        res.status(404).send({ error: "Item not found" }); // Use status + send or json
        return;
      }

      res.status(200).json(items); // Ensure this is the last response in this block
    } catch (error) {
      console.error("Error fetching item:", error);
      res.status(500).send({ error: "Internal server error" });
    }
  };

  /* postAddItem(req: express.Request, res: express.Response): Promise<void>
		@param {express.Request} req: The request object
			expects the id of the item to be in the params array of the request object
		@param {express.Response} res: The response object
		@returns {Promise<void>}:
		@remarks: Handles the add item request
		@async
	*/
  postAddItem = async (
    req: express.Request,
    res: express.Response
  ): Promise<void> => {
    try {
      // Step 1: Connect to the database
      const result = await this.mongoDBService.connect();
      if (!result) {
        res.status(500).send({ error: "Database connection failed" });
        return;
      }

      // Step 2: Create the pet document
      let item: InventoryItemModel = {
        name: req.body.name, // Pet's name
        status: req.body.status, // Pet's adoption status
        pictures: req.body.pictures, // Array of picture URLs
        animal: req.body.animal, // Animal type (e.g., dog, cat, etc.)
        breed: req.body.breed, // Breed of the animal
        price: req.body.price, // Price of the pet
        sex: req.body.sex, // Sex of the animal (male/female)
        location: req.body.location, // Location of the pet
        description: req.body.description, // Description of the pet
        benefits: req.body.benefits, // Array of benefits (e.g., Vet Records, Potty Training, etc.)
        birthdate: req.body.birthdate, // Pet's birth date (YYYY-MM-DD format)
      };

      // Step 3: Insert the pet document into the Pets collection
      const insertedItem = await this.mongoDBService.insertOne(
        this.settings.database,
        this.settings.collection,
        item
      );

      if (!insertedItem || !insertedItem.insertedId) {
        res.status(500).send({ error: "Failed to add item" });
        return;
      }

      // Step 4: Update the seller's document with the new pet ID
      const sellerId = req.body.sellerId;
      const updateResult = await this.mongoDBService.updateOne(
        this.settings.database,
        "sellers",
        { user: new ObjectId(sellerId) }, // Query to find the seller by "user" field
        { $push: { pets: insertedItem.insertedId } } // Add the new pet's ID to the "pets" array
      );

      if (!updateResult.modifiedCount) {
        res.status(500).send({
          error: "Pet added, but failed to update the seller's document",
        });
        return;
      }

      // Step 5: Send a success response
      res.send({ success: true, petId: insertedItem.insertedId });
    } catch (error: any) {
      res.status(500).send({ error: error.message });
    }
  };

  /* putUpdateItem(req: express.Request, res: express.Response): Promise<void>
		@param {express.Request} req: The request object
		expects the partno of the item to be in the params array of the request object as id
		@param {express.Response} res: The response object
		@returns {Promise<void>}:
		@remarks: Handles the update item request
		@async
	*/
  putUpdateItem = async (
    req: express.Request,
    res: express.Response
  ): Promise<void> => {
    try {
      const result = await this.mongoDBService.connect();
      if (!result) {
        res.status(500).send({ error: "Database connection failed" });
        return;
      }
      let item: InventoryItemModel = {
        name: req.body.name, // Pet's name
        status: req.body.status, // Pet's adoption status
        pictures: req.body.pictures, // Array of picture URLs
        animal: req.body.animal, // Animal type (e.g., dog, cat, etc.)
        breed: req.body.breed, // Breed of the animal
        price: req.body.price, // Price of the pet
        sex: req.body.sex, // Sex of the animal (male/female)
        location: req.body.location, // Location of the pet
        description: req.body.description, // Description of the pet
        benefits: req.body.benefits, // Array of benefits (e.g., Vet Records, Potty Training, etc.)
        birthdate: req.body.birthdate, // Pet's birth date (YYYY-MM-DD format)
      };
      let command = { $set: item };
      const success = await this.mongoDBService.updateOne(
        this.settings.database,
        this.settings.collection,
        { _id: new ObjectId(req.params.id) },
        command
      );
      if (success) res.send({ success: true });
      else res.status(500).send({ error: "Failed to update item" });
    } catch (error) {
      res.status(500).send({ error: error });
    }
  };

  updateItemStatus = async (
    req: express.Request,
    res: express.Response
  ): Promise<void> => {
    try {
      const result = await this.mongoDBService.connect();
      if (!result) {
        res.status(500).send({ error: "Database connection failed" });
        return;
      }

      const itemId = req.params.id;
      const newStatus = req.body.status;

      if (!itemId || !newStatus) {
        res
          .status(400)
          .send({ error: "Invalid request. Item ID and status are required." });
        return;
      }

      const updateResult = await this.mongoDBService.updateOne(
        this.settings.database,
        this.settings.collection,
        { _id: new ObjectId(itemId) },
        { $set: { status: newStatus } } // Explicitly set only the status field
      );

      if (updateResult.modifiedCount === 0) {
        res.status(404).send({ error: "Item not found or status unchanged" });
        return;
      }

      res.status(200).send({ success: true, updatedStatus: newStatus });
    } catch (error) {
      console.error("Error updating item status:", error);
      res.status(500).send({ error: "Internal Server Error" });
    }
  };

  /* deleteItem(req: express.Request, res: express.Response): Promise<void>
			@param {express.Request} req: The request object
			expects the partno of the item to be in the params array of the request object as id
		@param {express.Response} res: The response object
		@returns {Promise<void>}:
		@remarks: Handles the delete item request and archives the item
		@async
	*/
  deleteItem = async (
    req: express.Request,
    res: express.Response
  ): Promise<void> => {
    try {
      // Connect to the database
      const result = await this.mongoDBService.connect();
      if (!result) {
        res.status(500).send({ error: "Database connection failed" });
        return;
      }

      // Get the authenticated user
      const user = req.body.user;
      const itemId = req.params.id;

      // Find the item to delete
      const item = await this.mongoDBService.findOne<InventoryItemModel>(
        this.settings.database,
        this.settings.collection,
        { _id: new ObjectId(itemId) }
      );

      if (!item) {
        res.status(404).send({ error: "Item not found" });
        return;
      }

      // Check if user is an admin
      if (user.roles.includes("admin")) {
        // Allow deletion without further checks
        return await this.archiveAndDeleteItem(res, item);
      }

      // If user is a seller, check if they own the item
      if (user.roles.includes("seller")) {
        // Fetch the seller's document to verify ownership of the item
        const seller = await this.mongoDBService.findOne<SellerModel>(
          this.settings.database,
          "sellers",
          { _id: new ObjectId(user._id) }
        );

        // Check if seller exists and has this item in their "pets" array
        if (!seller || !seller.pets.includes(itemId)) {
          res
            .status(403)
            .send({ error: "Forbidden: You do not own this item." });
          return;
        }

        // If seller owns the item, proceed with deletion
        return await this.archiveAndDeleteItem(res, item);
      }

      // If neither condition is met, deny access
      res.status(403).send({
        error: "Forbidden: You do not have permission to delete this item.",
      });
    } catch (error) {
      console.error(error);
      res.status(500).send({ error: error });
    }
  };

  // Helper function to archive and delete the item
  private archiveAndDeleteItem = async (
    res: express.Response,
    item: InventoryItemModel
  ) => {
    try {
      // Archive the item
      const archivedItem = { ...item };
      delete archivedItem._id;

      const archiveResult = await this.mongoDBService.insertOne(
        this.settings.database,
        this.settings.archiveCollection,
        archivedItem
      );

      if (!archiveResult || !archiveResult.insertedId) {
        res.status(500).send({ error: "Failed to archive item" });
        return;
      }

      // Delete the item from the main collection
      const deleteResult = await this.mongoDBService.deleteOne(
        this.settings.database,
        this.settings.collection,
        { _id: item._id }
      );

      if (!deleteResult) {
        res.status(500).send({ error: "Failed to delete item" });
        return;
      }

      // Remove the item ID from `pets` array in `sellers` collection
      await this.mongoDBService.updateMany(
        this.settings.database,
        "sellers", // Collection name for sellers
        { pets: item._id },
        { $pull: { pets: item._id } }
      );

      // Remove the item ID from `favorites` array in `buyers` collection
      await this.mongoDBService.updateMany(
        this.settings.database,
        "buyers", // Collection name for buyers
        { favorites: item._id },
        { $pull: { favorites: item._id } }
      );

      // Success response
      res.send({ success: true });
    } catch (error) {
      console.error("Error archiving or deleting item:", error);
      res.status(500).send({ error: "Internal Server Error" });
    }
  };
}
