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
export interface InventoryItemModel {
  _id?: string; // Optional unique identifier
  name: string; // Pet's name
  status: string; // rescued, adopted, bred
  pictures: string[]; // Array of image URLs
  description: string; // Pet's description
  animal: string; // Animal type (dog, cat, bird, etc.)
  breed: string; // Breed or species information
  birthdate: string; // Birthdate in YYYY-MM-DD format
  price: number; // Price of the pet
  sex: string; // male or female
  location: string; // Location of the pet
  benefits: string[]; // Array of benefits
  isFavorite?: boolean; // Optional field for marking favorite status
}
