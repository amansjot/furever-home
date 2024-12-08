import express from "express";
import { UserController } from "./users.controller";
import { SecurityMiddleware } from "../security/security.middleware";

export class UserRouter {
  private router: express.Router = express.Router();
  private controller: UserController = new UserController();

  public getRouter(): express.Router {
    this.router.get(
      "/",
      SecurityMiddleware.validateUser,
      SecurityMiddleware.hasRole("admin"),
      this.controller.getAllUsers
    );
    this.router.get(
      "/me",
      SecurityMiddleware.validateUser,
      this.controller.getUserProfile
    );
    this.router.get(
      "/:id",
      SecurityMiddleware.validateUser,
      this.controller.getUser
    );
    this.router.post(
      "/",
      [SecurityMiddleware.validateUser, SecurityMiddleware.hasRole("admin")],
      this.controller.postAddUser
    );
    this.router.put(
      "/:id",
      SecurityMiddleware.validateUser,
      this.controller.updateUser
    );

    return this.router;
  }
}
