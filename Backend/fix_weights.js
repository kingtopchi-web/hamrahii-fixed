import mongoose from "mongoose";
import vehicleTypeModel from "./models/vehicleType.model.js";
import dotenv from "dotenv";

dotenv.config({ path: "./.env" });

async function fixWeights() {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to DB");

    const vehicles = await vehicleTypeModel.find();
    for (const v of vehicles) {
        const type = v.type.toLowerCase();
        let correctWeight = 5;
        if (type.includes('car')) correctWeight = 50;
        else if (type.includes('auto')) correctWeight = 80;
        else if (type.includes('bike')) correctWeight = 10;

        // If it was exactly 5 (the bad default) or missing, update it
        if (!v.maxParcelWeight || v.maxParcelWeight === 5) {
            v.maxParcelWeight = correctWeight;
            await v.save();
            console.log(`Updated ${v.type} to ${correctWeight} KG`);
        }
    }
    console.log("Done");
    process.exit(0);
}

fixWeights();
