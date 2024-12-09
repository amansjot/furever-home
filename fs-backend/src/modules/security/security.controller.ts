import express from "express";
import { UserLoginModel } from "./security.models";
import { MongoDBService } from "../database/mongodb.service";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { SecuritySettings } from "./security.settings";
import nodemailer from "nodemailer"; // Adding this for email sending
import crypto from "crypto"; // Adding this for generating tokens

export class SecurityController {
  private mongoDBService: MongoDBService = new MongoDBService(
    process.env.mongoConnectionString ||
      "mongodb+srv://singh:Aman@petadoption.nfugs.mongodb.net/"
  );
  private settings: SecuritySettings = new SecuritySettings();

  /* Forgot Password */
  public postForgotPassword = async (
    req: express.Request,
    res: express.Response
  ): Promise<void> => {
    const { email } = req.body;

    if (!email) {
      res.status(400).send({ error: "Email is required" });
      return;
    }

    try {
      // Connect to the database
      await this.mongoDBService.connect();

      // Check if the user exists in the database
      const user = await this.mongoDBService.findOne<UserLoginModel>(
        this.settings.database,
        this.settings.usersCollection,
        { username: email }
      );

      if (!user) {
        res.status(404).send({ error: "User not found" });
        return;
      }

      // Generate a password reset token and expiry
      const resetToken = crypto.randomBytes(32).toString("hex");
      const resetTokenExpiry = Date.now() + 3600000; // 1 hour from now

      // Update the user's reset token and expiry in the database
      const updateResult = await this.mongoDBService.updateOne(
        this.settings.database,
        this.settings.usersCollection,
        { username: email },
        { $set: { resetPasswordToken: resetToken, resetPasswordExpires: resetTokenExpiry } }
      );

      if (!updateResult) {
        throw new Error("Failed to update user with reset token");
      }

      // Construct the password reset link
      const resetUrl = `${req.protocol}://${req.get("host")}/reset-password?token=${resetToken}`;

      // Send the reset email
      const transporter = nodemailer.createTransport({
        service: "Gmail", // Use Gmail email provider
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASSWORD,
        },
      });

      const mailOptions = {
        from: "no-reply@petapp.com",
        to: email,
        subject: "PetApp Password Reset Request",
        html: `
          <p>You have requested to reset your password.</p>
          <p>Click the link below to reset your password:</p>
          <a href="${resetUrl}">${resetUrl}</a>
          <p>If you did not request this, please ignore this email.</p>
          <p>Thanks,</p>
          <p>Your PetApp Team</p>
        `,
      };

      await transporter.sendMail(mailOptions);

      res.status(200).send({ message: "Password reset email sent." });
    } catch (error) {
      console.error(error);
      res.status(500).send({ error: "Internal server error" });
    } finally {
      this.mongoDBService.close();
    }
  };

  /* Generate JWT Token */
  private makeToken(user: UserLoginModel): string {
    return jwt.sign(user, process.env.secret || "secret");
  }

  /* Encrypt Password */
  private encryptPassword(password: string): Promise<string> {
    return new Promise((resolve, reject) => {
      bcrypt.genSalt(10, (err, salt) => {
        if (err) reject(err);
        bcrypt.hash(password, salt, (err, hash) => {
          if (err) reject(err);
          resolve(hash);
        });
      });
    });
  }

  public getAuthorize = async (
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ): Promise<void> => {
    //renew the token.
    res.send({ token: this.makeToken(req.body.user) });
  };

  public getHasRole = async (
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ): Promise<void> => {
    //check if the user has the role
    if (req.body.user.roles.indexOf(req.params.role) > -1) {
      res.send({ hasRole: true });
    } else {
      res.send({ hasRole: false });
    }
  };

  /* postLogin(req: express.Request, res: express.Response): Promise<void>
    @param {express.Request} req: The request object
            expects username and password in body of request
    @param {express.Response} res: The response object
    @returns {Promise<void>}:
    @remarks: Handles the login request
    @async
*/
  public postLogin = async (
    req: express.Request,
    res: express.Response
  ): Promise<void> => {
    //check body for username and password
    return new Promise(async (resolve, reject) => {
      const user: UserLoginModel = {
        username: req.body.username,
        password: req.body.password,
        roles: this.settings.defaultRoles,
      };
      if (
        user.username == null ||
        user.password == null ||
        user.username.trim().length == 0 ||
        user.password.trim().length == 0
      ) {
        res.status(400).send({ error: "Username and password are required" });
      } else {
        try {
          let result = await this.mongoDBService.connect();
          if (!result) {
            res.status(500).send({ error: "Database connection failed" });
            return;
          }
          let dbUser: UserLoginModel | null = await this.mongoDBService.findOne(
            this.settings.database,
            this.settings.usersCollection,
            { username: user.username }
          );
          if (!dbUser) {
            throw { error: "User not found" };
          }
          bcrypt.compare(user.password, dbUser.password, (err, result) => {
            if (err) {
              res.send({ error: "Password comparison failed" });
            } else if (result) {
              dbUser.password = "****";
              res.send({ token: this.makeToken(dbUser) });
            } else {
              res.send({ error: "Password does not match" });
            }
          });
        } catch (err) {
          console.error(err);
          res.status(500).send(err);
        } finally {
          resolve();
        }
      }
    });
  };

  /* User Registration */
  public postRegister = async (
    req: express.Request,
    res: express.Response
): Promise<void> => {
    const { username, password, role, firstName, profilePic, lastName, location, sellerType, orgName, contact } = req.body;

    const user: UserLoginModel = {
      username,
      password,
      roles: [role ? role.toLowerCase() : "buyer"],
    };

    if (!username || !password) {
      res.status(400).send({ error: "Username and password are required" });
      return;
    }

    try {
      await this.mongoDBService.connect();

      const existingUser = await this.mongoDBService.findOne<UserLoginModel>(
        this.settings.database,
        this.settings.usersCollection,
        { username }
      );

      if (existingUser) {
        res.status(409).send({ error: "User already exists" });
        return;
      }

      user.password = await this.encryptPassword(password);

      const userInsertResult = await this.mongoDBService.insertOne(
        this.settings.database,
        this.settings.usersCollection,
        { 
          firstName,
          lastName,
          profilePic,
          location,
          username,
          password: user.password,
          roles: user.roles
        }
      );

      if (!userInsertResult) {
        throw new Error("Database insert failed");
      }

      const userId = userInsertResult.insertedId;

      if (role.toLowerCase() === "buyer") {
        await this.mongoDBService.insertOne(
          this.settings.database,
          this.settings.buyersCollection,
          { user: userId, favorites: [] }
        );
      } else if (role.toLowerCase() === "seller") {
        await this.mongoDBService.insertOne(
          this.settings.database,
          this.settings.sellersCollection,
          { user: userId, orgName, sellerType, sellerLocation: location, sellerContact: contact, pets: [], sellerPhoto: "" }
        );
      }

      const dbUser = await this.mongoDBService.findOne<UserLoginModel>(
        this.settings.database,
        this.settings.usersCollection,
        { username }
      );

      if (!dbUser) {
        throw new Error("Database retrieval failed after insert");
      }

      dbUser.password = "****";
      res.send({ token: this.makeToken(dbUser) });  // Return token on successful registration
    } catch (err) {
      console.error(err);
      res.status(500).send({ error: "Registration failed" });
    }
  };
}
