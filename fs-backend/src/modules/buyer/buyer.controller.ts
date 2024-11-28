import express from "express";
import { MongoDBService, ObjectId } from "../database/mongodb.service";
import { BuyerModel } from "./buyer.models";
import { InventoryItemModel } from "../inventory/inventory.models";

export class BuyerController {
  private mongoDBService: MongoDBService = new MongoDBService(
    process.env.mongoConnectionString ||
      "mongodb+srv://singh:Aman@petadoption.nfugs.mongodb.net/"
  );

  // Existing getBuyer method
  getBuyer = async (
    req: express.Request,
    res: express.Response
  ): Promise<void> => {
    try {
      const result = await this.mongoDBService.connect();
      if (!result) {
        res.status(500).send({ error: "Database connection failed" });
        return;
      }

      const buyer = await this.mongoDBService.findOne<BuyerModel>(
        "pet-adoption",
        "buyers",
        { _id: new ObjectId(req.params.id) }
      );
      if (!buyer) {
        res.status(404).send({ error: "Buyer not found" });
        return;
      }

      res.send(buyer);
    } catch (error) {
      res.status(500).send({ error });
    }
  };

  // Method to get the buyer profile based on authenticated user's userId
  getBuyerProfile = async (
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

      const buyer = await this.mongoDBService.findOne<BuyerModel>(
        "pet-adoption",
        "buyers",
        { user: new ObjectId(userId) }
      );
      if (!buyer) {
        res.status(404).send({ error: "Buyer profile not found" });
        return;
      }

      res.send(buyer);
    } catch (error) {
      res.status(500).send({ error });
    }
  };

  // Method to get the buyer's favorite pet IDs based on authenticated user's userId
  getFavoriteIds = async (
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

      // Find the buyer document for the authenticated user and retrieve only the `favorites` field
      const buyer = await this.mongoDBService.findOne<BuyerModel>(
        "pet-adoption",
        "buyers",
        { user: new ObjectId(userId) },
        { projection: { favorites: 1 } } // Only retrieve the `favorites` field
      );

      if (!buyer || !buyer.favorites) {
        res.status(404).send({ error: "Buyer profile or favorites not found" });
        return;
      }

      // Send only the array of favorite IDs
      res.send(buyer.favorites);
    } catch (error) {
      console.error("Error fetching favorite IDs:", error);
      res.status(500).send({ error });
    }
  };

  // Method to update the buyer's favorite pet IDs based on authenticated user's userId
  updateFavoriteIds = async (
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

      console.log(req.body.favorites);

      // Extract the new favorites array from the request body
      const newFavorites = req.body.favorites;
      if (
        !Array.isArray(newFavorites) ||
        !newFavorites.every((id) => typeof id === "string")
      ) {
        res
          .status(400)
          .send({
            error: "Invalid format for favorites. Must be an array of strings.",
          });
        return;
      }

      // Ensure all favorite IDs are unique
      const uniqueFavorites = Array.from(new Set(newFavorites)).map(
        (id) => new ObjectId(id)
      );

      // Update the buyer's `favorites` field in the database
      const updateResult = await this.mongoDBService.updateOne(
        "pet-adoption",
        "buyers",
        { user: new ObjectId(userId) },
        { $set: { favorites: uniqueFavorites } }
      );

      if (updateResult) {
        res.send({ success: true, message: "Favorites updated successfully." });
      } else {
        res.status(500).send({ error: "Failed to update favorites." });
      }
    } catch (error) {
      console.error("Error updating favorite IDs:", error);
      res.status(500).send({ error });
    }
  };
}
