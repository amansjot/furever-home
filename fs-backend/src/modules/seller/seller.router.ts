import express from "express";
import { SellerController } from "./seller.controller";

export class SellerRouter {
    private router: express.Router = express.Router();
    private controller: SellerController = new SellerController();

    public getRouter(): express.Router {
        this.router.get("/:id", this.controller.getSeller);
        return this.router;
    }
}
