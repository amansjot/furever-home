import express from "express";
import { MongoDBService, ObjectId } from "../database/mongodb.service";
import { UserModel } from "./users.model";

export class UserController {
  private mongoDBService: MongoDBService = new MongoDBService(
    process.env.mongoConnectionString ||
      "mongodb+srv://singh:Aman@petadoption.nfugs.mongodb.net/"
  );

  getAllUsers = async (
    req: express.Request,
    res: express.Response
  ): Promise<void> => {
    let items: UserModel[] = [];
    try {
      let result = await this.mongoDBService.connect();
      if (!result) {
        res.status(500).send({ error: "Database connection failed" });
        return;
      }
      items = await this.mongoDBService.find<UserModel>(
        "pet-adoption",
        "users",
        {}
      );
      res.send(items);
    } catch (error) {
      res.status(500).send({ error: error });
    }
  };

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
    }
  };

  /* postAddUser(req: express.Request, res: express.Response): Promise<void>
    @param {express.Request} req: The request object, expects user details in the request body
    @param {express.Response} res: The response object
    @returns {Promise<void>}: 
    @remarks: Handles the add user request
    @async
  */
  postAddUser = async (
    req: express.Request,
    res: express.Response
  ): Promise<void> => {
    try {
      const result = await this.mongoDBService.connect();
      if (!result) {
        res.status(500).send({ error: "Database connection failed" });
        return;
      }

      // Create a new user object based on request data
      let user: UserModel = {
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        location: req.body.location,
        username: req.body.username,
        profilePic: req.body.profilePic,
        password: req.body.password, // Ideally, this should be hashed before saving
        roles: req.body.roles || [], // Default to an empty array if roles are not provided
      };

      // Insert the new user document into the "users" collection
      const success = await this.mongoDBService.insertOne(
        "pet-adoption",
        "users",
        user
      );

      if (success) {
        res.send({ success: true, userId: success.insertedId });
      } else {
        res.status(500).send({ error: "Failed to add user" });
      }
    } catch (error) {
      console.error("Error adding user:", error);
      res.status(500).send({ error: "Internal Server Error" });
    }
  };

  updateUser = async (
    req: express.Request,
    res: express.Response
  ): Promise<void> => {
    try {
      const result = await this.mongoDBService.connect();
      if (!result) {
        res.status(500).send({ error: "Database connection failed" });
        return;
      }

      // Retrieve the authenticated user's ID from the middleware
      const authenticatedUserId = req.body.user && req.body.user._id;
      if (!authenticatedUserId) {
        res.status(403).send({ error: "Unauthorized" });
        return;
      }

      // Ensure that the ID in the request matches the authenticated user ID
      const userId = req.params.id;
      console.log(userId);
      console.log(authenticatedUserId);
      if (userId !== authenticatedUserId) {
        res.status(403).send({
          error: "Unauthorized: You cannot update information for another user",
        });
        return;
      }

      // Build the update object from the request body, excluding sensitive fields like roles
      const updatedData: Partial<UserModel> = {
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        location: req.body.location,
        username: req.body.username,
        password: req.body.password, // Ideally, hash this password before storing
        profilePic: req.body.profilePic,
      };

      // Perform the update operation
      const updateResult = await this.mongoDBService.updateOne(
        "pet-adoption",
        "users",
        { _id: new ObjectId(userId) },
        { $set: updatedData }
      );

      if (updateResult) {
        res.send({
          success: true,
          message: "User profile updated successfully",
        });
      } else {
        res.status(500).send({ error: "Failed to update user profile" });
      }
    } catch (error) {
      console.error("Error updating user profile:", error);
      res.status(500).send({ error: "Internal Server Error" });
    }
  };
}
