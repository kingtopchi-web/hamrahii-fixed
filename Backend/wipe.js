import { configDotenv } from "dotenv";
import { connectDatabase } from "./config/connectDb.js";
import parcelModel from "./models/parcel.model.js";
import parcelRequestModel from "./models/parcelRequest.model.js";

configDotenv();

const wipeData = async () => {
  try {
    await connectDatabase();
    console.log("Connected to database...");

    const deletedParcels = await parcelModel.deleteMany({});
    console.log(`Deleted ${deletedParcels.deletedCount} parcels.`);

    const deletedRequests = await parcelRequestModel.deleteMany({});
    console.log(`Deleted ${deletedRequests.deletedCount} parcel requests.`);

    console.log("Wipe completed successfully.");
    process.exit(0);
  } catch (error) {
    console.error("Failed to wipe data:", error);
    process.exit(1);
  }
};

wipeData();
