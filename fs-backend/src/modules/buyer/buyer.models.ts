import { ObjectId } from "mongodb";

export interface BuyerModel {
    _id: string;
    user: ObjectId;
    favorites: ObjectId[];
}
