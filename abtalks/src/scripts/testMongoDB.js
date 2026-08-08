import { connectDB, closeDB } from "../config/mongodb.js";

async function testMongoDB() {
  try {
    const db = await connectDB();

    const collections = await db
      .listCollections()
      .toArray();

    console.log("MongoDB connection test successful.");

    console.log("Database:");
    console.log(db.databaseName);

    console.log("\nCollections:");
    console.log(
      collections.map((collection) => collection.name)
    );

  } catch (error) {
    console.error("MongoDB connection failed:");
    console.error(error.message);

  } finally {
    await closeDB();
  }
}

testMongoDB();