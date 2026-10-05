import mongoose from "mongoose";

const dlSchema = new mongoose.Schema({
    blood_group: {
        type: String,
    },
    citizenship: {
        type: String,
    },
    dob: {
        type: String,
    },
    doe: {
        type: String,
    },
    doi: {
        type: String,
    },
    initial_doi: {
        type: String,
    },
    father_or_husband_name: {
        type: String,
    },
    gender: {
        type: String,
    },
    license_number: {
        type: String,
        index: true,
        trim: true,
    },
    name: {
        type: String,
    },
    ola_code: {
        type: String,
    },
    permanent_address: {
        type: String,
    },
    permanent_zip: {
        type: String,
    },
    temporary_address: {
        type: String,
    },
    temporary_zip: {
        type: String,
    },
    state: {
        type: String,
    },
    transport_doe: {
        type: String,
    },
    vehicle_classes: [String],
})

export default mongoose.model("dl" , dlSchema)