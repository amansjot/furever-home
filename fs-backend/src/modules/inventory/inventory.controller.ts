import express from "express";
import { MongoDBService, ObjectId } from "../database/mongodb.service";
import { InventorySettings } from "./inventory.settings";
import { InventoryItemModel } from "./inventory.models";

/* InventoryController
	* @class: InventoryController
	* @remarks: A class that contains the controller functions for the inventory module
	* 			  getInventory: a function that handles the get inventory request
	* 			  getItem: a function that handles the get item request
	*/
export class InventoryController {

	private mongoDBService: MongoDBService = new MongoDBService(process.env.mongoConnectionString || "mongodb+srv://singh:Aman@petadoption.nfugs.mongodb.net/");
	private settings = new InventorySettings();

	/* getInventoryCount(req: express.Request, res: express.Response): Promise<void>
		@param {express.Request} req: The request object
		@param {express.Response} res: The response object
		@returns {Promise<void>}:
		@remarks: Handles the get inventory count request
		@async
	*/
	getInventoryCount = async (req: express.Request, res: express.Response): Promise<void> => {
		try {
			let result = await this.mongoDBService.connect();
			if (!result) {
				res.status(500).send({ error: "Database connection failed" });
				return;
			}
			let count = await this.mongoDBService.count(this.settings.database, this.settings.collection, {});
			res.send({ count: count });
		} catch (error) {
			res.status(500).send({ error: error });
		}
	}
	/* getInventory(req: express.Request, res: express.Response): Promise<void>
		@param {express.Request} req: The request object
		@param {express.Response} res: The response object
		@returns {Promise<void>}:
		@remarks: Handles the get inventory request.  If the request has query parameters, start and end, it will return the records between those two
		Otherwise it will return all records
		@async
	*/
	getInventory = async (req: express.Request, res: express.Response): Promise<void> => {
		let items: InventoryItemModel[] = [];
		try {
			let result = await this.mongoDBService.connect();
			if (!result) {
				res.status(500).send({ error: "Database connection failed" });
				return;
			}
		if (req.query.start && req.query.end) {
				items = await this.mongoDBService.find<InventoryItemModel>(this.settings.database, this.settings.collection, {}, parseInt(req.query.start as string), parseInt(req.query.end as string));
			} else {
				items = await this.mongoDBService.find<InventoryItemModel>(this.settings.database, this.settings.collection, {});
			}
			res.send(items);
		} catch (error) {
			res.status(500).send({ error: error });
		}
	}
	/* getItem(req: express.Request, res: express.Response): Promise<void>
		@param {express.Request} req: The request object
			expects the partnumber of the item to be in the params array of the request object as id
		@param {express.Response} res: The response object
		@returns {Promise<void>}:
		@remarks: Handles the get item request
		@async
	*/
	getItem = async (req: express.Request, res: express.Response): Promise<void> => {
		try {
			let result = await this.mongoDBService.connect();
			if (!result) {
				res.status(500).send({ error: "Database connection failed" });
				return;
			}
			let items = await this.mongoDBService.findOne<InventoryItemModel>(this.settings.database, this.settings.collection, { partno: req.params.id });
			if (!items) {
				res.send(404).send({ error: "Item not found" });
				return;
			}
			res.send(items);
		} catch (error) {
			res.status(500).send({ error: error });
		}
	}

	/* postAddItem(req: express.Request, res: express.Response): Promise<void>
		@param {express.Request} req: The request object
			expects the id of the item to be in the params array of the request object
		@param {express.Response} res: The response object
		@returns {Promise<void>}:
		@remarks: Handles the add item request
		@async
	*/
	postAddItem = async (req: express.Request, res: express.Response): Promise<void> => {
		try {
			const result = await this.mongoDBService.connect();
			if (!result) {
				res.status(500).send({ error: "Database connection failed" });
				return;
			}
			let item: InventoryItemModel = {
				name: req.body.name,
				status: req.body.status,
				pictures: req.body.pictures,
				description: req.body.description,
				typeOfPet: req.body.typeOfPet,
				speciesBreed: req.body.speciesBreed,
				age: req.body.age,
				quantity: req.body.quantity,
				price: req.body.price,
				documentation: req.body.documentation,
				sex: req.body.sex,
				image: req.body.image
			};
			const success = await this.mongoDBService.insertOne(this.settings.database, this.settings.collection, item);
			if (success)
				res.send({ success: true });
			else
				res.status(500).send({ error: "Failed to add item" });

		} catch (error) {
			res.status(500).send({ error: error });
		}
	}

	/* putUpdateItem(req: express.Request, res: express.Response): Promise<void>
		@param {express.Request} req: The request object
		expects the partno of the item to be in the params array of the request object as id
		@param {express.Response} res: The response object
		@returns {Promise<void>}:
		@remarks: Handles the update item request
		@async
	*/
	putUpdateItem = async (req: express.Request, res: express.Response): Promise<void> => {
		try {
			const result = await this.mongoDBService.connect();
			if (!result) {
				res.status(500).send({ error: "Database connection failed" });
				return;
			}
			let item: InventoryItemModel = {
				name: req.body.name,
				status: req.body.status,
				pictures: req.body.pictures,
				description: req.body.description,
				typeOfPet: req.body.typeOfPet,
				speciesBreed: req.body.speciesBreed,
				age: req.body.age,
				quantity: req.body.quantity,
				price: req.body.price,
				documentation: req.body.documentation,
				sex: req.body.sex,
				image: req.body.image
			};
			let command = { $set: item };
			const success = await this.mongoDBService.updateOne(this.settings.database, this.settings.collection, { partno: req.params.id }, command);
			if (success)
				res.send({ success: true });
			else
				res.status(500).send({ error: "Failed to update item" });

		} catch (error) {
			res.status(500).send({ error: error });
		}
	}

	/* deleteItem(req: express.Request, res: express.Response): Promise<void>
			@param {express.Request} req: The request object
			expects the partno of the item to be in the params array of the request object as id
		@param {express.Response} res: The response object
		@returns {Promise<void>}:
		@remarks: Handles the delete item request and archives the item
		@async
	*/
	deleteItem = async (req: express.Request, res: express.Response): Promise<void> => {
		try {
			const result = await this.mongoDBService.connect();
			if (!result) {
				res.status(500).send({ error: "Database connection failed" });
				return;
			}
			const item = await this.mongoDBService.findOne<InventoryItemModel>(this.settings.database, this.settings.collection, { partno: req.params.id });
			if (!item) {
				res.status(404).send({ error: "Item not found" });
				return;
			}
			item._id = undefined;
			let success = await this.mongoDBService.insertOne(this.settings.database, this.settings.archiveCollection, item);
			if (!success) {
				console.log("Failed to archive item");
				return;
			}
			success = await this.mongoDBService.deleteOne(this.settings.database, this.settings.collection, { partno: req.params.id });
			if (!success) {
				res.status(500).send({ error: "Failed to delete item" });
				return;
			}
		} catch (error) {
			res.status(500).send({ error: error });
		}
		res.send({ success: true });
	}
}