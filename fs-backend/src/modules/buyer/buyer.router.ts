import express from "express";
import { BuyerController } from "./buyer.controller";
import { SecurityMiddleware } from "../security/security.middleware";

export class BuyerRouter {
  private router: express.Router = express.Router();
  private controller: BuyerController = new BuyerController();

  public getRouter(): express.Router {
    // this.router.get("/:id", this.controller.getBuyer);
    this.router.get(
      "/me",
      SecurityMiddleware.validateUser,
      SecurityMiddleware.hasRole("buyer"),
      this.controller.getBuyerProfile
    );

    this.router.get(
      "/favorites",
      SecurityMiddleware.validateUser,
      SecurityMiddleware.hasRole("buyer"),
      this.controller.getFavoriteIds
    );

    this.router.put(
      "/favorites",
      SecurityMiddleware.validateUser,
      SecurityMiddleware.hasRole("buyer"),
      this.controller.updateFavoriteIds
    );

    this.router.put(
      "/preferences", 
      SecurityMiddleware.validateUser,
      SecurityMiddleware.hasRole("buyer"),
      this.controller.updatePreferences 
    );

    return this.router;
  }
}
