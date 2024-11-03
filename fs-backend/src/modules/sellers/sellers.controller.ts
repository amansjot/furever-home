import express from "express";
import { MongoDBService, ObjectId } from "../database/mongodb.service";
import { SellersSettings } from "./sellers.settings";
import { SellersItemModel } from "./sellers.models";

/* SellersController
 * @class: SellersController
 * @remarks: A class that contains the controller functions for the sellers module
 * 			  getSellers: a function that handles the get sellers request
 * 			  getItem: a function that handles the get seller request
 */
export class SellersController {
  private mongoDBService: MongoDBService = new MongoDBService(
    process.env.mongoConnectionString ||
      "mongodb+srv://singh:Aman@petadoption.nfugs.mongodb.net/"
  );
  private settings = new SellersSettings();

  /* getSellersCount(req: express.Request, res: express.Response): Promise<void>
		@param {express.Request} req: The request object
		@param {express.Response} res: The response object
		@returns {Promise<void>}:
		@remarks: Handles the get sellers count request
		@async
	*/
  getSellersCount = async (
    req: express.Request,
    res: express.Response
  ): Promise<void> => {
    try {
      let result = await this.mongoDBService.connect();
      if (!result) {
        res.status(500).send({ error: "Database connection failed" });
        return;
      }
      let count = await this.mongoDBService.count(
        this.settings.database,
        this.settings.collection,
        {}
      );
      res.send({ count: count });
    } catch (error) {
      res.status(500).send({ error: error });
    }
  };
  /* getSellers(req: express.Request, res: express.Response): Promise<void>
		@param {express.Request} req: The request object
		@param {express.Response} res: The response object
		@returns {Promise<void>}:
		@remarks: Handles the get sellers request.  If the request has query parameters, start and end, it will return the records between those two
		Otherwise it will return all records
		@async
	*/
  getSellers = async (
    req: express.Request,
    res: express.Response
  ): Promise<void> => {
    let sellers: SellersItemModel[] = [];
    try {
      let result = await this.mongoDBService.connect();
      if (!result) {
        res.status(500).send({ error: "Database connection failed" });
        return;
      }
      if (req.query.start && req.query.end) {
        sellers = await this.mongoDBService.find<SellersItemModel>(
          this.settings.database,
          this.settings.collection,
          {}
        );
      } else {
        sellers = await this.mongoDBService.find<SellersItemModel>(
          this.settings.database,
          this.settings.collection,
          {}
        );
      }
      res.send(sellers);
    } catch (error) {
      res.status(500).send({ error: error });
    }
  };

  /* getSellerByUserId(req: express.Request, res: express.Response): Promise<void>
       @param {express.Request} req: The request object
       @param {express.Response} res: The response object
       @returns {Promise<void>}
       @remarks: Handles the get seller by user ID request
       @async
    */
	   getSellerByUserId = async (req: express.Request, res: express.Response): Promise<void> => {
		const userId = req.body.user._id; // Accessing _id from decoded user payload
		if (!userId) {
			res.status(400).send({ error: "User ID missing" });
			return;
		}
	
		try {
			// Query based on user ID
			const seller = await this.mongoDBService.findOne<SellersItemModel>(
				this.settings.database,
				this.settings.collection,
				{ user: new ObjectId(userId) } // Assumes user field in DB stores the user ID
			);
	
			if (!seller) {
				res.status(404).send({ error: "Seller not found" });
				return;
			}
	
			res.send(seller);
		} catch (error) {
			console.error("Database query error:", error);
			res.status(500).send({ error: "Database query error" });
		}
	};
	
}
