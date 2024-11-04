/* This file contains the models for the seller module */
/* SellerModel
	* @interface: SellerModel
	* @remarks: A model for the seller
	* 			  orgName: a string representing the organization name of the seller
	* 			  sellerType: a string representing the type of seller (e.g., "owner")
	* 			  sellerLocation: a string representing the location of the seller
	* 			  sellerContact: a string representing the contact information of the seller
	* 			  pets: an array of strings representing the IDs of pets associated with the seller
	* 			  sellerPhoto: a string representing the URL of the seller's profile photo
	* 			  user: a string representing the ID of the user associated with the seller
	* 			  _id: a string representing the ID of the seller
*/
export interface SellerModel {
	_id?: string;
	user: string; // ID of the user associated with the seller
	orgName: string;
	sellerType: string; // e.g., "owner"
	sellerLocation: string;
	sellerContact: string; // Contact number
	pets: string[]; // Array of pet IDs
	sellerPhoto: string; // Profile photo URL or filename
}

export const emptySeller: SellerModel = {
	user: '',
	orgName: '',
	sellerType: '',
	sellerLocation: '',
	sellerContact: '',
	pets: [],
	sellerPhoto: ''
};
