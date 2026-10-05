import mongoose from "mongoose";
import { configDotenv } from "dotenv";
import vehicleTypeModel from "./models/vehicleType.model.js";

configDotenv();

const MONGO_URI = "mongodb://hamrahiUser:Humrahii999@148.135.136.177:27017/hamrahi?authSource=hamrahi";

async function seedVehicles() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("Connected to MongoDB.");

    // 1. Delete the "Car" vehicle type (and anything else to be safe, or just "Car")
    // Let's find "Car" and deactivate or delete. The user said "REMOVE: Car".
    const deleted = await vehicleTypeModel.deleteMany({ type: { $regex: /car/i } });
    console.log(`Deleted ${deleted.deletedCount} 'Car' vehicle types.`);

    // 2. Add new vehicles
    const vehiclesToInsert = [
      {
        type: "E Loader",
        image: "https://tiimg.tistatic.com/fp/3/009/378/yatri-e-loader-591.jpg",
        description: "Best for small and quick deliveries (up to 500 KG)",
        maxParcelWeight: 500,
        status: "ACTIVE",
        pricing: { slabs: [], currency: "INR" },
        parcelPricing: { baseFare: 50, includedKm: 1, perKm: 10 }
      },
      {
        type: "3 Wheeler Loader",
        image: "https://res.cloudinary.com/dpk5fuhkd/image/upload/v1790573115/zaoexukdwrlhqmmrx3wo.png",
        description: "Ideal for medium goods (up to 750 KG)",
        maxParcelWeight: 750,
        status: "ACTIVE",
        pricing: { slabs: [], currency: "INR" },
        parcelPricing: { baseFare: 80, includedKm: 1, perKm: 15 }
      },
      {
        type: "Tata Ace",
        image: "https://smalltrucks.tatamotors.com/assets/smalltrucks/files/2026-09/ACE%20EV%201000%20-%20Side_0.png?VersionId=DgsofaAHHiLKBVNApi7kISp4K_CjJuiB",
        description: "Perfect for heavy and bulky items (up to 1000 KG)",
        maxParcelWeight: 1000,
        status: "ACTIVE",
        pricing: { slabs: [], currency: "INR" },
        parcelPricing: { baseFare: 150, includedKm: 1, perKm: 20 }
      },
      {
        type: "truck",
        image: "https://res.cloudinary.com/dpk5fuhkd/image/upload/v1790573368/ek5ebjlonrtohjh2xg9v.png",
        description: "Parcel Delivery Vehicle",
        maxParcelWeight: 2000,
        status: "ACTIVE",
        pricing: { slabs: [], currency: "INR" },
        parcelPricing: { baseFare: 250, includedKm: 1, perKm: 20 }
      }
    ];

    for (const v of vehiclesToInsert) {
      // Upsert to prevent duplicates if script runs multiple times
      await vehicleTypeModel.findOneAndUpdate(
        { type: { $regex: new RegExp(`^${v.type}$`, "i") } },
        { $set: v },
        { upsert: true, new: true }
      );
    }

    console.log("Vehicles seeded successfully.");
    process.exit(0);
  } catch (error) {
    console.error("Error seeding vehicles:", error);
    process.exit(1);
  }
}

seedVehicles();
