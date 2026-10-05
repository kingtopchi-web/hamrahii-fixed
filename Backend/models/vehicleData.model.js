import mongoose from "mongoose";

const vehicleSchema = new mongoose.Schema({
    rc_number: {
        type: String,
        required: true,
        index: true
    },
    fit_up_to: {
        type: String,
    },
    registration_date: {
        type: String,
    },
    owner_name: {
        type: String,
    },
    father_name: {
        type: String,
    },
    present_address: {
        type: String,
    },
    permanent_address: {
        type: String,
    },
    mobile_number: {
        type: String,
    },
    vehicle_category: {
        type: String,
    },
    vehicle_chasi_number: {
        type: String,
    },
    vehicle_engine_number: {
        type: String,
    },
    maker_description: {
        type: String,
    },
    maker_model: {
        type: String,
    },
    body_type: {
        type: String,
    },
    fuel_type: {
        type: String,
    },
    color: {
        type: String,
    },
    norms_type: {
        type: String,
    },
    financer: {
        type: String,
    },
    financed: {
        type: Boolean,
        default: false
    },
    insurance_company: {
        type: String,
    },
    insurance_policy_number: {
        type: String,
    },
    insurance_upto: {
        type: String,
    },
    manufacturing_date: {
        type: String,
    },
    manufacturing_date_formatted: {
        type: String,
    },
    registered_at: {
        type: String,
    },
    latest_by: {
        type: String,
    },
    less_info: {
        type: String,
    },
    tax_upto: {
        type: String,
    },
    tax_paid_upto: {
        type: String,
    },
    cubic_capacity: {
        type: String,
    },
    vehicle_gross_weight: {
        type: String,
    },
    no_cylinders: {
        type: String,
    },
    seat_capacity: {
        type: String,
    },
    sleeper_capacity: {
        type: String,
    },
    standing_capacity: {
        type: String,
    },
    wheelbase: {
        type: String,
    },
    unladen_weight: {
        type: String,
    },
    vehicle_category_description: {
        type: String,
    },
    pucc_number: {
        type: String,
    },
    pucc_upto: {
        type: String,
    },
    permit_number: {
        type: String,
    },
    permit_issue_date: {
        type: String,
    },
    permit_valid_from: {
        type: String,
    },
    permit_valid_upto: {
        type: String,
    },
    permit_type: {
        type: String,
    },
    national_permit_number: {
        type: String,
    },
    national_permit_upto: {
        type: String,
    },
    national_permit_issued_by: {
        type: String,
    },
    non_use_status: {
        type: String,
    },
    non_use_from: {
        type: String,
    },
    non_use_to: {
        type: String,
    },
    blacklist_status: {
        type: String,
    },
    noc_details: {
        type: String,
    },
    owner_number: {
        type: String,
    },
    rc_status: {
        type: String,
    },
    masked_name: {
        type: String,
    },
})

export default mongoose.model("VehicleData", vehicleSchema)