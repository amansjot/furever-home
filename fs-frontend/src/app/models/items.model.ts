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
	age: number; // age in years
	quantity: number;
	price: number;
	documentation: string[]; // Array of filenames for documentation
	sex: string; // male or female
	image: string; // main image URL
	location: string;
	isFavorite?: boolean; // track favorite status 
	_id: string;
}
export const emptyItem: InventoryItemModel = {
    name: '',
	status: '', // rescued, adopted, bred
	pictures: [''], // Array of image filenames
	description: '',
	animal: '', // dog, cat, bird, fish, etc.
	breed: '', // breed or species information
	age: 0, // age in years
	quantity: 0,
	price: 0,
	documentation: [''], // Array of filenames for documentation
	sex: '', // male or female
	image: '', // main image URL
	location: '',
	isFavorite: false, // Set default favorite status to false
	_id: ''
}