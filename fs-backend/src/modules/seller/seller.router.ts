import express from "express";
import { SellerController } from "./seller.controller";
import { SecurityMiddleware } from "../security/security.middleware";

export class SellerRouter {
    private router: express.Router = express.Router();
    private controller: SellerController = new SellerController();

    public getRouter(): express.Router {
        // this.router.get("/:id", this.controller.getSeller);
        this.router.get("/me", SecurityMiddleware.validateUser, this.controller.getSellerProfile);
        return this.router;
    }
}
