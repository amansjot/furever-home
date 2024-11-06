import express from "express";
import { ApiRouter } from "./router";
import { MongoDBService } from "./modules/database/mongodb.service";

class Application {
  public app: express.Application;
  public port: number;
  private mongoDBService: MongoDBService;

  constructor() {
    this.app = express();
    this.port = process.env.serverPort ? +process.env.serverPort : 3000;
    this.mongoDBService = new MongoDBService(
      process.env.mongoConnectionString ||
        "mongodb+srv://singh:Aman@petadoption.nfugs.mongodb.net/"
    );
    this.app.use(express.urlencoded({ extended: false }));
    this.app.use(express.json());
    this.initCors();
  }

  // Starts the server and connects to MongoDB
  public async start(): Promise<void> {
    try {
      // Connect to MongoDB
      const dbConnected = await this.mongoDBService.connect();
      if (!dbConnected) {
        console.error("Failed to connect to MongoDB. Exiting...");
        process.exit(1);
      }
      console.log("Connected to MongoDB");

      // Build routes and start the server
      this.buildRoutes();
      this.app.listen(this.port, () =>
        console.log("Server listening on port " + this.port + "!")
      );

      // Gracefully close MongoDB connection on shutdown
      process.on("SIGINT", this.close.bind(this));
      process.on("SIGTERM", this.close.bind(this));
    } catch (error) {
      console.error("Error starting application:", error);
      process.exit(1);
    }
  }

  // Sets up CORS to allow cross-origin support from any host
  public initCors(): void {
    this.app.use((req: express.Request, res: express.Response, next: any) => {
      res.header("Access-Control-Allow-Origin", "*");
      res.header(
        "Access-Control-Allow-Methods",
        "PUT, GET, POST, DELETE, OPTIONS"
      );
      res.header(
        "Access-Control-Allow-Headers",
        "Origin, X-Requested-With, Content-Type, Accept, Authorization, Access-Control-Allow-Credentials"
      );
      res.header("Access-Control-Allow-Credentials", "true");
      next();
    });
  }

  // Sets up routes for the express server
  public buildRoutes(): void {
    this.app.use("/api", new ApiRouter().getRouter());
  }

  // Closes the MongoDB connection and shuts down the server
  private async close(): Promise<void> {
    console.log("Closing MongoDB connection...");
    await this.mongoDBService.close();
    console.log("MongoDB connection closed. Shutting down server.");
    process.exit(0);
  }
}

new Application().start();
