import parcelWeightSlabModel from "../models/parcelWeightSlab.model.js";

// Create Slab
export const createParcelSlab = async (req, res) => {
  try {
    const { fromWeight, toWeight, extraCharge, status } = req.body;
    
    // Check for overlap
    const overlap = await parcelWeightSlabModel.findOne({
      status: "ACTIVE",
      $or: [
        {
          fromWeight: { $lt: toWeight },
          toWeight: { $gt: fromWeight }
        }
      ]
    });

    if (overlap && status === "ACTIVE") {
      return res.status(400).json({ success: false, message: "An active slab overlaps with this weight configuration." });
    }

    const newSlab = await parcelWeightSlabModel.create({
      fromWeight, 
      toWeight, 
      extraCharge, 
      status
    });
    res.status(201).json({ success: true, slab: newSlab });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get all Slabs
export const getParcelSlabs = async (req, res) => {
  try {
    const slabs = await parcelWeightSlabModel.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, slabs });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update Slab
export const updateParcelSlab = async (req, res) => {
  try {
    const { id } = req.params;
    const { fromWeight, toWeight, extraCharge, status } = req.body;

    if (status === "ACTIVE") {
      const overlap = await parcelWeightSlabModel.findOne({
        _id: { $ne: id },
        status: "ACTIVE",
        $or: [
          {
            fromWeight: { $lt: toWeight },
            toWeight: { $gt: fromWeight }
          }
        ]
      });

      if (overlap) {
        return res.status(400).json({ success: false, message: "An active slab overlaps with this weight configuration." });
      }
    }

    const updatedSlab = await parcelWeightSlabModel.findByIdAndUpdate(
      id, 
      { fromWeight, toWeight, extraCharge, status }, 
      { new: true }
    );
    if (!updatedSlab) return res.status(404).json({ success: false, message: "Slab not found" });
    
    res.status(200).json({ success: true, slab: updatedSlab });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Delete Slab
export const deleteParcelSlab = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedSlab = await parcelWeightSlabModel.findByIdAndDelete(id);
    if (!deletedSlab) return res.status(404).json({ success: false, message: "Slab not found" });
    
    res.status(200).json({ success: true, message: "Slab deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
