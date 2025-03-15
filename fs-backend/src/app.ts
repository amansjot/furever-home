import express from "express";
import { ApiRouter } from "./router";
import { MongoDBService } from "./modules/database/mongodb.service";
import * as dotenv from "dotenv";
import path from "path";

// Load environment variables from .env file
const envPath = path.resolve(process.cwd(), '.env');
dotenv.config({ path: envPath });

class Application {
  public app: express.Application;
  public port: number;
  private mongoDBService: MongoDBService;

  constructor() {
    this.app = express();
    this.port = process.env.SERVER_PORT ? +process.env.SERVER_PORT : 3000;
    
    // Ensure we have a valid MongoDB connection string
    const mongoConnectionString = process.env.MONGO_CONNECTION_STRING || 
      "mongodb+srv://KyleMalice:Kyle123@petadoption.nfugs.mongodb.net/?retryWrites=true&w=majority&appName=PetAdoption";
    
    this.mongoDBService = new MongoDBService(mongoConnectionString);
    
    // Increase payload size limits for JSON and URL-encoded data
    this.app.use(express.json({ limit: "10mb" })); // Adjust the limit as needed
    this.app.use(express.urlencoded({ extended: true, limit: "10mb" })); // Adjust the limit as needed
    this.initCors();
  }

  // Starts the server and connects to MongoDB
  public async start(): Promise<void> {
    try {
      // Connect to MongoDB
      const dbConnected = await this.mongoDBService.connect();
      if (!dbConnected) {
        process.exit(1);
      }

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
        "PUT, GET, POST, DELETE, PATCH, OPTIONS" // Include PATCH
      );
      res.header(
        "Access-Control-Allow-Headers",
        "Origin, X-Requested-With, Content-Type, Accept, Authorization, Access-Control-Allow-Credentials"
      );
      res.header("Access-Control-Allow-Credentials", "true");
      if (req.method === "OPTIONS") {
        // End preflight requests early
        return res.status(200).end();
      }
      next();
    });
  }

  // Sets up routes for the express server
  public buildRoutes(): void {
    this.app.use("/api", new ApiRouter().getRouter());

    // Global error handler
    this.app.use(
      (
        err: any,
        req: express.Request,
        res: express.Response,
        next: express.NextFunction
      ) => {
        console.error("Unhandled error:", err);
        res.status(err.status || 500).send({
          error: err.message || "Internal Server Error",
        });
      }
    );
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
