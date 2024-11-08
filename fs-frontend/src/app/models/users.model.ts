/* This file contains the models for the user module */
/* UserModel
	* @interface: UserModel
	* @remarks: A model for the user
	* 			  firstName: a string representing the first name of the user
	* 			  lastName: a string representing the last name of the user
	* 			  location: a string representing the location of the user
	* 			  username: a string representing the email or username of the user
	* 			  password: a hashed string representing the password of the user
	* 			  roles: an array of strings representing the roles of the user (e.g., "buyer", "admin")
	* 			  _id: a string representing the ID of the user
*/

export interface UserModel {
	_id?: string; // User ID, optional because it may not be set until the user is saved in the database
	firstName: string;
	lastName: string;
	location: string;
	username: string; // Email or username
	password: string; // Hashed password
	roles: string[]; // Array of user roles (e.g., ["buyer", "admin"])
}

// An empty object to use as a default value or template
export const emptyUser: UserModel = {
	firstName: '',
	lastName: '',
	location: '',
	username: '',
	password: '',
	roles: []
};
