import express from "express";
import { SellerController } from "./seller.controller";
import { SecurityMiddleware } from "../security/security.middleware";

export class SellerRouter {
  private router: express.Router = express.Router();
  private controller: SellerController = new SellerController();

  public getRouter(): express.Router {
    // this.router.get("/:id", this.controller.getSeller);
    this.router.get(
      "/me",
      SecurityMiddleware.validateUser,
      SecurityMiddleware.hasRole("seller"),
      this.controller.getSellerProfile
    );
      
    this.router.get(
        "/:userId",
        SecurityMiddleware.validateUser,
        this.controller.getSellerProfile
      );

    // Route to get seller contact info by pet ID
    this.router.get(
      "/ofpet/:petId",
      SecurityMiddleware.validateUser, // Optional: Restrict to authenticated users
      this.controller.getSellerByPetId
    );

    this.router.patch(
      "/:sellerId/requests",
      SecurityMiddleware.validateUser, // Ensure user is authenticated
      this.controller.addRequestToSeller
    );

    this.router.delete(
      "/:sellerId/requests",
      SecurityMiddleware.validateUser, // Ensure user is authenticated
      SecurityMiddleware.hasRole("seller"), // Ensure only sellers can deny requests
      this.controller.closeRequest
    );

    return this.router;
  }
}
