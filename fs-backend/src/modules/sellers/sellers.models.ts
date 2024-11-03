/* This file contains the models for the sellers module */
/* SellersItemModel
	* @interface: SellersItemModel
	* @remarks: A model for the sellers
	* 			  partno: a string that represents the part number
	* 			  name: a string that represents the name
	* 			  description: a string that represents the description
	* 			  quantity: a number that represents the quantity
	* 			  price: a number that represents the price
	* 			  _id: a string that represents the id
*/
export interface SellersItemModel {
	name: string;
	status: string; // rescued, adopted, bred
	pictures: string[]; // Array of image filenames
	description: string;
	typeOfPet: string; // dog, cat, bird, fish, etc.
	speciesBreed: string; // breed or species information
	age: number; // age in years or months
	quantity: number;
	price: number;
	documentation: string[]; // Array of filenames for documentation
	sex: string; // male or female
	image: string; // main image URL
	location: string;
	_id?: string;
}
