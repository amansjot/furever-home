/* This file contains the models for the sellers module */
/* SellerModel
	* @interface: SellerModel
	* @remarks: A model for a seller
	* 			  _id: a string that represents the seller's unique identifier
	* 			  user: a string that represents the user ID associated with the seller
	* 			  orgName: a string representing the organization name
	* 			  sellerType: a string that represents the type of seller (e.g., owner, breeder, shelter)
	* 			  sellerLocation: a string representing the location of the seller
	* 			  sellerContact: a string for the seller's contact number
	* 			  pets: an array of InventoryItemModel representing the pets managed by this seller
	* 			  sellerPhoto: a string for the URL or filename of the seller's photo
*/
import { InventoryItemModel } from './items.model';

export interface SellerModel {
	_id?: string; // Optional: Represents the MongoDB object ID of the seller
	user: string; // Represents the MongoDB object ID of the associated user
	orgName: string; // Organization name
	sellerType: string; // Type of seller, e.g., owner, breeder, shelter
	sellerLocation: string; // Location of the seller
	sellerContact: string; // Contact number of the seller
	pets: InventoryItemModel[]; // Array of pets associated with the seller
	sellerPhoto: string; // URL or filename of the seller's photo
}

// Example of an empty/default Seller object
export const emptySeller: SellerModel = {
	user: '',
	orgName: '',
	sellerType: '',
	sellerLocation: '',
	sellerContact: '',
	pets: [],
	sellerPhoto: ''
};
