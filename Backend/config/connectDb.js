import mongoose from "mongoose";
import userModel from "../models/user.model.js";
import rideModel from "../models/ride.model.js";

export const syncHistoricalRideCreationFees = async () => {
  try {
    const users = await userModel.find({ "wallet.transactions.source": "ride_creation" });
    for (const user of users) {
      const txs = user?.wallet?.transactions?.filter(t => t.source === "ride_creation" && t.type === "debit") || [];
      for (const tx of txs) {
        const txTime = new Date(tx.createdAt);
        await rideModel.updateOne(
          {
            driver: user._id,
            createdAt: {
              $gte: new Date(txTime.getTime() - 60000),
              $lte: new Date(txTime.getTime() + 60000)
            },
            $or: [
              { creationFee: { $exists: false } },
              { creationFee: 0 }
            ]
          },
          {
            $set: {
              creationFee: tx.amount,
              platformFee: tx.amount,
              commission: tx.amount
            }
          }
        );
      }
    }
  } catch (error) {
    // silent catch
  }
};

export const connectDatabase = async () => {
  try {
    mongoose.connect(process.env.MONGO_URI)
      .then(() => {
        console.log("database connected succesfully");
        syncHistoricalRideCreationFees();
      });
  } catch (error) {
    console.log(error?.message || error);
  }
};