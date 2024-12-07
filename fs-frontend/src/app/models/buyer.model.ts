import { ObjectId } from "mongodb";

/* This file contains the models for the buyer module */
/* BuyerModel
	* @interface: BuyerModel
	* @remarks: A model for the buyer
	* 			  user: an ObjectId representing the ID of the user associated with the buyer
	* 			  favorites: an array of ObjectIds representing the IDs of favorite pets
	* 			  _id: an ObjectId representing the ID of the buyer
*/
export interface BuyerModel {
	_id: string;
	user: ObjectId; 
	favorites: string[]; 
	preferences: { 
		petType: string;
		petSize: string;
		petPersonality: string[];
		petAge: string;
		petSex: string;
		petLifestyle: string[];
		petLocation: string;
	};
	recommendedPets: string[];
}

export const emptyBuyer: BuyerModel = {
    _id: "",
	user: new ObjectId(),
	favorites: [],
	preferences: {
		petType: "",
		petSize: "",
		petPersonality: [""],
		petAge: "",
		petSex: "",
		petLifestyle: [""],
		petLocation: ""
	},
	recommendedPets: []
};
