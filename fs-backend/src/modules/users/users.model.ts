export interface UserModel {
	_id?: string; // User ID, optional because it may not be set until the user is saved in the database
	firstName: string;
	lastName: string;
	location: string;
	profilePic: string;
	username: string; // Email or username
	password: string; // Hashed password
	roles: string[]; // Array of user roles (e.g., ["buyer", "admin"])
}