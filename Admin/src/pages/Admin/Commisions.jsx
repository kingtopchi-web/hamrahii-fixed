import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import Axios from "../../services/axios";
import { api } from "../../services/api";

const Commisions = () => {
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);

    const [commissionData, setCommissionData] = useState({
        _id: null,
        isCommision: false,
        type: "Percentage",
        value: 0,
        parcelRequestExpiry: 5,
    });

    const handleFetchCommision = async () => {
        try {
            setLoading(true);

            const res = await Axios.get(api.commision.get);

            console.log(res?.data, "commission response");

            if (res?.data?.success) {
                // No commission found
                if (res?.data?.message === "No commision found") {
                    setCommissionData({
                        _id: null,
                        isCommision: false,
                        type: "Percentage",
                        value: 0,
                        parcelRequestExpiry: 5,
                    });
                    return;
                }

                const data = res?.data?.commision;

                setCommissionData({
                    _id: data?._id,
                    isCommision: data?.isCommision ?? false,
                    type: data?.type ?? "Percentage",
                    value: data?.value ?? 0,
                    parcelRequestExpiry: data?.parcelRequestExpiry ?? 5,
                });
            }
        } catch (error) {
            console.log(error);
            toast.error("Failed to fetch commission");
        } finally {
            setLoading(false);
        }
    };

    const handleSaveCommission = async () => {
        try {
            if (commissionData.isCommision && Number(commissionData.value) < 0) {
                return toast.warning("Commission value cannot be negative");
            }

            setSaving(true);

            const payload = {
                isCommision: commissionData.isCommision,
                type: commissionData.type,
                value: Number(commissionData.value),
                parcelRequestExpiry: commissionData.parcelRequestExpiry,
            };

            console.log("Save Payload:", payload);

            const res = await Axios.post(api.commision.update, payload)

            toast.success("Settings saved successfully");
        } catch (error) {
            console.log(error);
            toast.error("Failed to save commission");
        } finally {
            setSaving(false);
        }
    };

    useEffect(() => {
        handleFetchCommision();
    }, []);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-[300px]">
                <p className="text-[#64748B]">Loading commission settings...</p>
            </div>
        );
    }

    return (
        <div className="p-6">
            <div className="max-w-xl mx-auto bg-[#FFFFFF] rounded-xl p-6">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-2xl font-semibold text-[#0F172A]">
                        Global Settings & Expiry
                    </h1>
                    <p className="text-sm text-[#64748B] mt-1">
                        Configure platform commission rules and parcel expiry limits.
                    </p>
                </div>

                {/* Enable Commission */}
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h3 className="font-medium text-[#0F172A]">
                            Enable Commission
                        </h3>
                        <p className="text-sm text-[#64748B]">
                            Turn commission calculation on or off.
                        </p>
                    </div>

                    <button
                        onClick={() =>
                            setCommissionData((prev) => ({
                                ...prev,
                                isCommision: !prev.isCommision,
                            }))
                        }
                        className={`relative w-12 h-7 rounded-full transition ${commissionData.isCommision
                                ? "bg-[#DC2626]"
                                : "bg-gray-300"
                            }`}
                    >
                        <span
                            className={`absolute top-1 h-5 w-5 rounded-full bg-[#FFFFFF] transition ${commissionData.isCommision
                                    ? "left-6"
                                    : "left-1"
                                }`}
                        />
                    </button>
                </div>

                {/* Type */}
                <div className="mb-6">
                    <label className="block text-sm font-medium text-[#0F172A] mb-2">
                        Commission Type
                    </label>

                    <select
                        value={commissionData.type}
                        disabled={!commissionData.isCommision}
                        onChange={(e) =>
                            setCommissionData((prev) => ({
                                ...prev,
                                type: e.target.value,
                            }))
                        }
                        className="w-full rounded-lg border border-[#E2E8F0] px-4 py-3 outline-none focus:border-red-500 disabled:bg-[#F8FAFC] disabled:text-[#94A3B8]"
                    >
                        <option value="Percentage">Percentage</option>
                        <option value="fixed">Fixed</option>
                    </select>
                </div>

                {/* Value */}
                <div className="mb-8">
                    <label className="block text-sm font-medium text-[#0F172A] mb-2">
                        Commission Value
                    </label>

                    <input
                        type="number"
                        min="0"
                        disabled={!commissionData.isCommision}
                        value={commissionData.value}
                        onChange={(e) =>
                            setCommissionData((prev) => ({
                                ...prev,
                                value: e.target.value,
                            }))
                        }
                        placeholder="Enter commission value"
                        className="w-full rounded-lg border border-[#E2E8F0] px-4 py-3 outline-none focus:border-red-500 disabled:bg-[#F8FAFC] disabled:text-[#94A3B8]"
                    />
                </div>

                {/* Current Status */}
                <div className="mb-8">
                    <p className="text-sm text-[#64748B] mb-1">
                        Current Commission
                    </p>

                    <p className="text-2xl font-semibold text-[#DC2626]">
                        {!commissionData.isCommision
                            ? "Disabled"
                            : commissionData.type === "Percentage"
                                ? `${commissionData.value}%`
                                : `₹${commissionData.value}`}
                    </p>
                </div>

                {/* Parcel Request Expiry */}
                <div className="mb-8 border-t border-[#E2E8F0] pt-8">
                    <h1 className="text-2xl font-semibold text-[#0F172A] mb-1">
                        Manage Expiry Time
                    </h1>
                    <p className="text-sm text-[#64748B] mb-6">
                        Configure the exact time limit (in minutes) for how long a parcel request stays active for riders.
                    </p>

                    <label className="block text-sm font-medium text-[#0F172A] mb-2">
                        Parcel Request Expiry (Minutes)
                    </label>

                    <input
                        type="number"
                        min="1"
                        value={commissionData.parcelRequestExpiry}
                        onChange={(e) =>
                            setCommissionData((prev) => ({
                                ...prev,
                                parcelRequestExpiry: Number(e.target.value),
                            }))
                        }
                        placeholder="e.g. 5"
                        className="w-full rounded-lg border border-[#E2E8F0] px-4 py-3 outline-none focus:border-red-500"
                    />
                </div>

                {/* Save */}
                <button
                    onClick={handleSaveCommission}
                    disabled={saving}
                    className={`w-full rounded-lg py-3 font-medium text-white transition ${saving
                            ? "bg-gray-400 cursor-not-allowed"
                            : "bg-[#DC2626] hover:bg-red-700"
                        }`}
                >
                    {saving ? "Saving..." : "Save Changes"}
                </button>
            </div>
        </div>
    );
};

export default Commisions;