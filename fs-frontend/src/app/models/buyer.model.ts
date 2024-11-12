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
	_id: ObjectId;
	user: ObjectId; // ObjectId of the user associated with the buyer
	favorites: ObjectId[]; // Array of ObjectIds for favorite pets
}

export const emptyBuyer: BuyerModel = {
    _id: new ObjectId(),
	user: new ObjectId(), // Initialize with a placeholder ObjectId
	favorites: [] // Empty array for favorites
};
