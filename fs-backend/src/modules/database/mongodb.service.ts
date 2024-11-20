import { MongoClient, UpdateResult } from "mongodb";
export { ObjectId } from "mongodb";

export class MongoDBService {
  client: MongoClient;
  constructor(private connectionString: string) {
    this.client = new MongoClient(this.connectionString);
  }

  public async connect(): Promise<boolean> {
    try {
      console.log("Connecting to MongoDB");
      await this.client.connect();
      return true;
    } catch (err) {
      console.error("Error connecting to MongoDB:", err);
      return false;
    }
  }

  public async insertOne(
    database: string,
    collection: string,
    document: any
  ): Promise<{ insertedId: any } | null> {
    try {
      const result = await this.client
        .db(database)
        .collection(collection)
        .insertOne(document);
      return { insertedId: result.insertedId };
    } catch (err) {
      console.error("Error inserting document into " + collection + ":", err);
      return null;
    }
  }

  public async findOne<T>(
    database: string,
    collection: string,
    query: any,
    options?: any // Optional options parameter to allow for projections
  ): Promise<T | null> {
    try {
      const result = await this.client
        .db(database)
        .collection(collection)
        .findOne(query, options); // Pass the options to findOne
      return result as T;
    } catch (err) {
      console.error("Error finding document in " + collection + ":", err);
      return null;
    }
  }

  public async count(
    database: string,
    collection: string,
    query: any
  ): Promise<number> {
    try {
      const result = await this.client
        .db(database)
        .collection(collection)
        .countDocuments(query);
      return result;
    } catch (err) {
      console.error("Error counting documents in " + collection + ":", err);
      return 0;
    }
  }

  public async find<T>(
    database: string,
    collection: string,
    query: any,
    start: number = 0,
    end: number = 0
  ): Promise<T[]> {
    try {
      let result = [];
      if (start >= 0 && end > start) {
        result = await this.client
          .db(database)
          .collection(collection)
          .find(query)
          .skip(start)
          .limit(end - start + 1)
          .toArray();
      } else {
        result = await this.client
          .db(database)
          .collection(collection)
          .find(query)
          .toArray();
      }
      return result as T[];
    } catch (err) {
      console.error("Error finding documents in " + collection + ":", err);
      return [];
    }
  }

  public async updateOne(
    database: string,
    collection: string,
    query: any,
    update: any
  ): Promise<UpdateResult> {
    try {
      const result = await this.client
        .db(database)
        .collection(collection)
        .updateOne(query, update);
      return result; // Return the full UpdateResult
    } catch (err) {
      console.error("Error updating document in " + collection + ":", err);
      throw err; // Throw the error to be handled by the caller
    }
  }

  // New method for updating multiple documents
  public async updateMany(
    database: string,
    collection: string,
    query: any,
    update: any
  ): Promise<boolean> {
    try {
      await this.client
        .db(database)
        .collection(collection)
        .updateMany(query, update);
      return true;
    } catch (err) {
      console.error(
        "Error updating multiple documents in " + collection + ":",
        err
      );
      return false;
    }
  }

  public async deleteOne(
    database: string,
    collection: string,
    query: any
  ): Promise<boolean> {
    try {
      await this.client.db(database).collection(collection).deleteOne(query);
      return true;
    } catch (err) {
      console.error("Error deleting document in " + collection + ":", err);
      return false;
    }
  }

  public async close(): Promise<void> {
    await this.client.close();
    console.log("Closed connection to MongoDB");
  }

  public async findOneAndUpdate<T>(
    database: string,
    collection: string,
    query: any,
    update: any
  ): Promise<T | null> {
    try {
      const result = await this.client
        .db(database)
        .collection(collection)
        .findOneAndUpdate(query, update, {});
      if (!result) {
        console.error(
          "Error finding and updating document in " +
            collection +
            ": document not found"
        );
        return null;
      }
      return result.value as T;
    } catch (err) {
      console.error(
        "Error finding and updating document in " + collection + ":",
        err
      );
      return null;
    }
  }
}
