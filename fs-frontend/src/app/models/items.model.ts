/* This file contains the models for the inventory module */
/* InventoryItemModel
	* @interface: InventoryItemModel
	* @remarks: A model for the inventory item
	* 			  partno: a string that represents the part number
	* 			  name: a string that represents the name
	* 			  description: a string that represents the description
	* 			  quantity: a number that represents the quantity
	* 			  price: a number that represents the price
	* 			  _id: a string that represents the id
*/
export interface InventoryItemModel{
	name: string;
	status: string; // rescued, adopted, bred
	pictures: string[]; // Array of image filenames
	description: string;
	animal: string; // dog, cat, bird, fish, etc.
	breed: string; // breed or species information
	birthdate: Date | null; // age in years
	quantity: number;
	price: number;
	benefits: string[]; // Array of benefits
	sex: string; // male or female
	location: string;
	isFavorite?: boolean; // track favorite status 
	_id: string;
	similarityScore?: number;
}
export const emptyItem: InventoryItemModel = {
    name: '',
	status: '', // rescued, adopted, bred
	pictures: [''], // Array of image filenames
	description: '',
	animal: '', // dog, cat, bird, fish, etc.
	breed: '', // breed or species information
	birthdate: null, // age in years
	quantity: 0,
	price: 0,
	benefits: [''], // Array of benefits
	sex: '', // male or female
	location: '',
	isFavorite: false, // Set default favorite status to false
	_id: ''
}