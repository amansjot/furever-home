import express from "express";
import { MongoDBService, ObjectId } from "../database/mongodb.service";
import { SellerModel } from "./seller.models";
import { InventoryItemModel } from "../inventory/inventory.models";

export class SellerController {
    private mongoDBService: MongoDBService = new MongoDBService(process.env.mongoConnectionString || "mongodb+srv://singh:Aman@petadoption.nfugs.mongodb.net/");

    // Existing getSeller method
    getSeller = async (req: express.Request, res: express.Response): Promise<void> => {
        try {
            const result = await this.mongoDBService.connect();
            if (!result) {
                res.status(500).send({ error: "Database connection failed" });
                return;
            }

            const seller = await this.mongoDBService.findOne<SellerModel>("pet-adoption", "sellers", { _id: new ObjectId(req.params.id) });
            if (!seller) {
                res.status(404).send({ error: "Seller not found" });
                return;
            }

            res.send(seller);
        } catch (error) {
            res.status(500).send({ error });
        } finally {
            this.mongoDBService.close();
        }
    }

    // Method to get the seller profile based on authenticated user's userId
    getSellerProfile = async (req: express.Request, res: express.Response): Promise<void> => {
        try {
            const result = await this.mongoDBService.connect();
            if (!result) {
                res.status(500).send({ error: "Database connection failed" });
                return;
            }

            const userId = req.body.user._id; // Retrieved from middleware
            if (!userId) {
                res.status(400).send({ error: "User ID not found in request" });
                return;
            }

            const seller = await this.mongoDBService.findOne<SellerModel>("pet-adoption", "sellers", { user: new ObjectId(userId) });
            if (!seller) {
                res.status(404).send({ error: "Seller profile not found" });
                return;
            }

            res.send(seller);
        } catch (error) {
            res.status(500).send({ error });
        } finally {
            this.mongoDBService.close();
        }
    }

    // Existing getPetDetails method
    getPetDetails = async (req: express.Request, res: express.Response): Promise<void> => {
        try {
            const result = await this.mongoDBService.connect();
            if (!result) {
                res.status(500).send({ error: "Database connection failed" });
                return;
            }

            const pet = await this.mongoDBService.findOne<InventoryItemModel>("pet-adoption", "pets", { _id: new ObjectId(req.params.petId) });
            if (!pet) {
                res.status(404).send({ error: "Pet not found" });
                return;
            }

            res.send(pet);
        } catch (error) {
            res.status(500).send({ error });
        } finally {
            this.mongoDBService.close();
        }
    }
}
