import express from "express";
import { SellersController } from "./sellers.controller";
import { SecurityMiddleware } from "../security/security.middleware";

export class SellersRouter {
  private router: express.Router = express.Router();
  private controller: SellersController = new SellersController();

  constructor() {
    this.configureRoutes();
  }

  private configureRoutes(): void {
    // Define the route to get seller info based on logged-in user
    this.router.get(
      "/me",
      [SecurityMiddleware.validateUser, SecurityMiddleware.hasRole("seller")],
      this.controller.getSellerByUserId
    );
  }

  public getRouter(): express.Router {
    return this.router;
  }
}

// Exporting an instance of SellersRouter to use directly in your main application
const sellersRouter = new SellersRouter();
export default sellersRouter.getRouter();
