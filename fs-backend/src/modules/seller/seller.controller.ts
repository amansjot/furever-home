import express from "express";
import { MongoDBService } from "../database/mongodb.service";
import { SellerModel } from "./seller.models";
import { InventoryItemModel } from "../inventory/inventory.models";
import { ObjectId } from "mongodb";
import { Request, Response } from "express";

export class SellerController {
  private mongoDBService: MongoDBService = new MongoDBService(
    process.env.mongoConnectionString ||
      "mongodb+srv://singh:Aman@petadoption.nfugs.mongodb.net/"
  );

  // Existing getSeller method
  getSeller = async (
    req: express.Request,
    res: express.Response
  ): Promise<void> => {
    try {
      const result = await this.mongoDBService.connect();
      if (!result) {
        res.status(500).send({ error: "Database connection failed" });
        return;
      }

      const seller = await this.mongoDBService.findOne<SellerModel>(
        "pet-adoption",
        "sellers",
        { _id: new ObjectId(req.params.id) }
      );
      if (!seller) {
        res.status(404).send({ error: "Seller not found" });
        return;
      }

      res.send(seller);
    } catch (error) {
      res.status(500).send({ error });
    }
  };

  // Method to get the seller profile based on authenticated user's userId
  getSellerProfile = async (
    req: express.Request,
    res: express.Response
  ): Promise<void> => {
    try {
      const result = await this.mongoDBService.connect();
      if (!result) {
        res.status(500).send({ error: "Database connection failed" });
        return;
      }

      const userId = req.body.user._id; // Retrieved from middleware
      if (!userId) {
        res.status(400).send({ error: "User ID not found in request" });
        return;
      }

      const seller = await this.mongoDBService.findOne<SellerModel>(
        "pet-adoption",
        "sellers",
        { user: new ObjectId(userId) }
      );
      if (!seller) {
        res.status(404).send({ error: "Seller profile not found" });
        return;
      }

      res.send(seller);
    } catch (error) {
      res.status(500).send({ error });
    }
  };

  // Existing getPetDetails method
  getPetDetails = async (
    req: express.Request,
    res: express.Response
  ): Promise<void> => {
    try {
      const result = await this.mongoDBService.connect();
      if (!result) {
        res.status(500).send({ error: "Database connection failed" });
        return;
      }

      const pet = await this.mongoDBService.findOne<InventoryItemModel>(
        "pet-adoption",
        "pets",
        { _id: new ObjectId(req.params.petId) }
      );
      if (!pet) {
        res.status(404).send({ error: "Pet not found" });
        return;
      }

      res.send(pet);
    } catch (error) {
      res.status(500).send({ error });
    }
  };

  // Method to get seller contact details by pet ID
  getSellerByPetId = async (
    req: express.Request,
    res: express.Response
  ): Promise<void> => {
    try {
      const result = await this.mongoDBService.connect();
      if (!result) {
        res.status(500).send({ error: "Database connection failed" });
        return;
      }

      const petId = req.params.petId;
      if (!petId) {
        res.status(400).send({ error: "Pet ID is required" });
        return;
      }

      // Convert petId to an ObjectId
      const objectIdPetId = new ObjectId(petId);

      // Query the database
      const seller = await this.mongoDBService.findOne<SellerModel>(
        "pet-adoption",
        "sellers",
        {
          pets: objectIdPetId, // Match directly against the ObjectId
        }
      );

      if (!seller) {
        res.status(404).send({ error: "Seller not found" });
        return;
      }

      res.send(seller);
    } catch (error) {
      console.error("Error fetching seller contact:", error);
      res.status(500).send({ error: "Internal server error" });
    }
  };

  public addRequestToSeller = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    try {
      const { sellerId } = req.params; // Get seller ID from the route parameter
      const { userId, petId } = req.body; // Get user ID from the request body

      console.log(sellerId);
      console.log(userId);
      console.log(petId);

      // Validate IDs
      if (
        !ObjectId.isValid(sellerId) ||
        !ObjectId.isValid(userId) ||
        !ObjectId.isValid(petId)
      ) {
        res.status(400).send({ error: "Invalid sellerId, userId, or petId" });
        return;
      }

      // Connect to MongoDB
      const result = await this.mongoDBService.connect();
      if (!result) {
        res.status(500).send({ error: "Database connection failed" });
        return;
      }

      // Update the seller document to add the userId to the `requests` array (avoid duplicates)
      const updateResult = await this.mongoDBService.updateOne(
        "pet-adoption", // Database name
        "sellers", // Collection name
        {
          _id: new ObjectId(sellerId),
          requests: {
            $not: {
              $elemMatch: {
                userId: new ObjectId(userId),
                petId: new ObjectId(petId),
              },
            },
          },
        },
        {
          $push: {
            requests: {
              userId: new ObjectId(userId),
              petId: new ObjectId(petId),
              timestamp: new Date(),
              status: "pending",
            },
          },
        }
      );

      if (!updateResult || updateResult.modifiedCount === 0) {
        res.status(404).send({ error: "Seller not found or no changes made" });
        return;
      }

      res.status(200).send({ message: "Request added successfully" });
    } catch (error) {
      console.error("Error adding request to seller:", error);
      res.status(500).send({ error: "Internal server error" });
    }
  };

  // Function to deny a request by removing it from the 'requests' array in the seller document
  // Function to deny a request by removing it from the 'requests' array in the seller document
  closeRequest = async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = req.query.userId as string; // Explicitly cast to string
      const petId = req.query.petId as string; // Explicitly cast to string
      const sellerId = req.params.sellerId; // Seller ID passed as a URL parameter

      if (!userId || !petId) {
        res
          .status(400)
          .send({ error: "userId and petId are required in the request" });
        return;
      }

      // Find the seller and pull the matching request from the 'requests' array
      const updateResult = await this.mongoDBService.updateOne(
        "pet-adoption", // Database name
        "sellers", // Collection name
        { user: new ObjectId(sellerId) }, // Match the seller by sellerId
        {
          $pull: {
            requests: {
              userId: new ObjectId(userId), // Convert to ObjectId
              petId: new ObjectId(petId), // Convert to ObjectId
            },
          },
        }
      );

      if (updateResult.modifiedCount === 0) {
        res.status(404).send({ error: "Request not found or already removed" });
        return;
      }

      res
        .status(200)
        .send({ success: true, message: "Request successfully denied" });
    } catch (error) {
      console.error("Error denying request:", error);
      res.status(500).send({ error: "Internal Server Error" });
    }
  };
}
