import express from "express";
import { MongoDBService, ObjectId } from "../database/mongodb.service";
import { BuyerModel } from "./buyer.models";
import { InventoryItemModel } from "../inventory/inventory.models";
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

export class BuyerController {
  private _mongoDBService: MongoDBService | null = null;
  
  // Use a getter to lazily initialize the MongoDBService
  private get mongoDBService(): MongoDBService {
    if (!this._mongoDBService) {
      const connectionString = process.env.MONGO_CONNECTION_STRING;
      if (!connectionString) {
        throw new Error("MONGO_CONNECTION_STRING environment variable is not set");
      }
      this._mongoDBService = new MongoDBService(connectionString);
    }
    return this._mongoDBService;
  }

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
        // Return an empty array instead of a 404 error for new users
        res.send([]);
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

      // Check if the buyer profile exists
      const buyerExists = await this.mongoDBService.findOne(
        "pet-adoption",
        "buyers",
        { user: new ObjectId(userId) }
      );

      let updateResult;
      
      if (!buyerExists) {
        // Create a new buyer profile if one doesn't exist
        updateResult = await this.mongoDBService.insertOne(
          "pet-adoption",
          "buyers",
          {
            user: new ObjectId(userId),
            favorites: uniqueFavorites,
            preferences: {}
          }
        );
      } else {
        // Update the existing buyer's favorites
        updateResult = await this.mongoDBService.updateOne(
          "pet-adoption",
          "buyers",
          { user: new ObjectId(userId) },
          { $set: { favorites: uniqueFavorites } }
        );
      }

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


  // Method to update the buyer's preferences
  updatePreferences = async (
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

      // Extract the preferences object from the request body
      const preferences = req.body.preferences;
      if (!preferences || typeof preferences !== "object") {
        res.status(400).send({ error: "Invalid preferences format. Must be an object." });
        return;
      }

      // Update the buyer's `preferences` field in the database
      const updateResult = await this.mongoDBService.updateOne(
        "pet-adoption",
        "buyers",
        { user: new ObjectId(userId) },
        { $set: { preferences } }
      );

      if (updateResult) {
        res.send({ success: true, message: "Preferences updated successfully." });
      } else {
        res.status(500).send({ error: "Failed to update preferences." });
      }
    } catch (error) {
      console.error("Error updating preferences:", error);
      res.status(500).send({ error });
    } finally {
      this.mongoDBService.close();
    }
  };
}
