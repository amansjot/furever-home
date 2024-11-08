import express from "express";
import { MongoDBService, ObjectId } from "../database/mongodb.service";
import { UserModel } from "./users.model";

export class UserController {
  private mongoDBService: MongoDBService = new MongoDBService(
    process.env.mongoConnectionString ||
      "mongodb+srv://singh:Aman@petadoption.nfugs.mongodb.net/"
  );

  // Existing getUser method
  getUser = async (
    req: express.Request,
    res: express.Response
  ): Promise<void> => {
    try {
      const result = await this.mongoDBService.connect();
      if (!result) {
        res.status(500).send({ error: "Database connection failed" });
        return;
      }

      const user = await this.mongoDBService.findOne<UserModel>(
        "pet-adoption",
        "users",
        { _id: new ObjectId(req.params.id) }
      );
      if (!user) {
        res.status(404).send({ error: "User not found" });
        return;
      }

      res.send(user);
    } catch (error) {
      res.status(500).send({ error });
    } finally {
      this.mongoDBService.close();
    }
  };

  // Method to get the user profile based on authenticated user's userId
  getUserProfile = async (
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

      const user = await this.mongoDBService.findOne<UserModel>(
        "pet-adoption",
        "users",
        { _id: new ObjectId(userId) }
      );
      if (!user) {
        res.status(404).send({ error: "User profile not found" });
        return;
      }

      res.send(user);
    } catch (error) {
      res.status(500).send({ error });
    } finally {
      this.mongoDBService.close();
    }
  };
}
