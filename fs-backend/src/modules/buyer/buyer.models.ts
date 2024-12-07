import { ObjectId } from "mongodb";

export interface BuyerModel {
    _id: string;
    user: ObjectId;
    favorites: ObjectId[];
    preferences: { 
        petType: string;
        petSize: string;
        petPersonality: string[];
        petAge: string;
        petSex: string;
        petLifestyle: string[];
        petLocation: string;
    };
    recommendedPets: ObjectId[];
}
