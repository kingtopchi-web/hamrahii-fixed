import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { Trash2, Edit, Plus } from "lucide-react";
import Axios from "../../services/axios";

import { useNavigate } from "react-router-dom";

const ParcelSlabs = () => {
  const navigate = useNavigate();
  const [vehicles, setVehicles] = useState([]);
  const [weightSlabs, setWeightSlabs] = useState([]);
  const [loading, setLoading] = useState(false);

  // Edit Vehicle Modal
  const [showVehicleModal, setShowVehicleModal] = useState(false);
  const [vehicleForm, setVehicleForm] = useState({
    vehicleTypeId: "",
    type: "",
    baseFare: 0,
    includedKm: 0,
    perKm: 0,
    maxParcelWeight: 0,
    status: "ACTIVE"
  });

  // Edit Weight Slab Modal
  const [showWeightModal, setShowWeightModal] = useState(false);
  const [isEditingWeight, setIsEditingWeight] = useState(false);
  const [weightForm, setWeightForm] = useState({
    _id: "",
    fromWeight: "",
    toWeight: "",
    extraCharge: "",
    status: "ACTIVE"
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const adminId = localStorage.getItem("adminId");
      const [vehRes, weightRes] = await Promise.all([
        Axios.post("/vehicleType/get-vehicle-type", { adminId }),
        Axios.get("/admin/parcel-slabs")
      ]);
      if (vehRes.data.success) {
        setVehicles(vehRes.data.vehicleTypes || vehRes.data.vehicle || []);
      }
      if (weightRes.data.success) {
        setWeightSlabs(weightRes.data.slabs);
      }
    } catch (error) {
      toast.error("Failed to fetch parcel pricing data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // --- Vehicle Handlers ---
  const openEditVehicle = (veh) => {
    setVehicleForm({
      vehicleTypeId: veh._id,
      type: veh.type,
      baseFare: veh.parcelPricing?.baseFare || 0,
      includedKm: veh.parcelPricing?.includedKm || 0,
      perKm: veh.parcelPricing?.perKm || 0,
      maxParcelWeight: veh.maxParcelWeight || 0,
      status: veh.status || "ACTIVE"
    });
    setShowVehicleModal(true);
  };

  const handleVehicleChange = (e) => {
    const { name, value } = e.target;
    setVehicleForm(prev => ({ ...prev, [name]: value }));
  };

  const saveVehiclePricing = async (e) => {
    e.preventDefault();
    try {
      const { data } = await Axios.post("/vehicleType/update-parcel-pricing", vehicleForm);
      if (data.success) {
        toast.success("Vehicle pricing updated successfully");
        setShowVehicleModal(false);
        fetchData();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update vehicle pricing");
    }
  };

  // --- Weight Slab Handlers ---
  const openAddWeight = () => {
    setIsEditingWeight(false);
    setWeightForm({
      _id: "",
      fromWeight: "",
      toWeight: "",
      extraCharge: "",
      status: "ACTIVE"
    });
    setShowWeightModal(true);
  };

  const openEditWeight = (slab) => {
    setIsEditingWeight(true);
    setWeightForm({
      _id: slab._id,
      fromWeight: slab.fromWeight,
      toWeight: slab.toWeight,
      extraCharge: slab.extraCharge,
      status: slab.status
    });
    setShowWeightModal(true);
  };

  const handleWeightChange = (e) => {
    const { name, value } = e.target;
    setWeightForm(prev => ({ ...prev, [name]: value }));
  };

  const saveWeightSlab = async (e) => {
    e.preventDefault();
    try {
      const url = isEditingWeight 
        ? `/admin/parcel-slabs/${weightForm._id}`
        : `/admin/parcel-slabs`;
      
      const method = isEditingWeight ? Axios.put : Axios.post;
      
      const { data } = await method(url, weightForm);

      if (data.success) {
        toast.success(isEditingWeight ? "Weight slab updated!" : "Weight slab added!");
        setShowWeightModal(false);
        fetchData();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to save weight slab");
    }
  };

  const deleteWeightSlab = async (id) => {
    if (!window.confirm("Are you sure you want to delete this weight slab?")) return;
    try {
      const { data } = await Axios.delete(`/admin/parcel-slabs/${id}`);
      if (data.success) {
        toast.success("Weight slab deleted");
        fetchData();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to delete weight slab");
    }
  };

  if (loading) return <div className="p-8 text-center">Loading Pricing...</div>;

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-10">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Parcel Pricing System</h1>

      {/* Vehicle Pricing Section */}
      <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-gray-800">Vehicle Pricing</h2>
          <button 
            onClick={() => {
              setVehicleForm({
                vehicleTypeId: "",
                type: "",
                baseFare: 0,
                includedKm: 0,
                perKm: 0,
                maxParcelWeight: 0,
                status: "ACTIVE"
              });
              setShowVehicleModal(true);
            }} 
            className="bg-black hover:bg-gray-800 text-white px-4 py-2 rounded-xl text-sm font-medium flex items-center gap-2"
          >
            <Plus className="w-4 h-4" /> Add Slab
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-y border-gray-200">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">Vehicle</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">Base Fare</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">Included KM</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">Extra/KM</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">Max Weight</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">Status</th>
                <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {vehicles.map((v) => (
                <tr key={v._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm font-medium text-gray-900 capitalize">{v.type}</td>
                  <td className="px-6 py-4 text-sm text-gray-700">₹{v.parcelPricing?.baseFare || 0}</td>
                  <td className="px-6 py-4 text-sm text-gray-700">{v.parcelPricing?.includedKm || 0} KM</td>
                  <td className="px-6 py-4 text-sm text-gray-700">₹{v.parcelPricing?.perKm || 0}</td>
                  <td className="px-6 py-4 text-sm text-gray-700">{v.maxParcelWeight || 0} KG</td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${v.status === "ACTIVE" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                      {v.status || "ACTIVE"}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button onClick={() => openEditVehicle(v)} className="text-blue-600 hover:text-blue-800">
                      <Edit className="w-5 h-5 inline" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Weight Slabs Section */}
      <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-gray-800">Weight Slabs</h2>
          <button onClick={openAddWeight} className="bg-black hover:bg-gray-800 text-white px-4 py-2 rounded-xl text-sm font-medium flex items-center gap-2">
            <Plus className="w-4 h-4" /> Add Weight Slab
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-y border-gray-200">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">Weight Range</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">Extra Charge</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">Status</th>
                <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {weightSlabs.map((slab) => (
                <tr key={slab._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">{slab.fromWeight} KG – {slab.toWeight} KG</td>
                  <td className="px-6 py-4 text-sm text-gray-700">₹{slab.extraCharge}</td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${slab.status === "ACTIVE" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                      {slab.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right flex justify-end gap-3">
                    <button onClick={() => openEditWeight(slab)} className="text-blue-600 hover:text-blue-800"><Edit className="w-5 h-5" /></button>
                    <button onClick={() => deleteWeightSlab(slab._id)} className="text-red-600 hover:text-red-800"><Trash2 className="w-5 h-5" /></button>
                  </td>
                </tr>
              ))}
              {weightSlabs.length === 0 && (
                <tr>
                  <td colSpan="4" className="text-center py-8 text-gray-500">No weight slabs configured</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* Vehicle Modal */}
      {showVehicleModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl w-full max-w-md p-6">
            <h3 className="text-xl font-bold mb-4">{vehicleForm.vehicleTypeId ? `Edit ${vehicleForm.type} Pricing` : 'Add New Vehicle Pricing'}</h3>
            <form onSubmit={saveVehiclePricing} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Vehicle Name (e.g. Scooty, Truck)</label>
                <input type="text" name="type" value={vehicleForm.type} onChange={handleVehicleChange} required className="w-full p-2 border rounded-lg" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Base Fare (₹)</label>
                  <input type="number" name="baseFare" value={vehicleForm.baseFare} onChange={handleVehicleChange} required min="0" className="w-full p-2 border rounded-lg" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Included KM</label>
                  <input type="number" name="includedKm" value={vehicleForm.includedKm} onChange={handleVehicleChange} required min="0" step="0.1" className="w-full p-2 border rounded-lg" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Extra Charge / KM (₹)</label>
                  <input type="number" name="perKm" value={vehicleForm.perKm} onChange={handleVehicleChange} required min="0" className="w-full p-2 border rounded-lg" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Max Weight (KG)</label>
                  <input type="number" name="maxParcelWeight" value={vehicleForm.maxParcelWeight} onChange={handleVehicleChange} required min="1" className="w-full p-2 border rounded-lg" />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <select name="status" value={vehicleForm.status} onChange={handleVehicleChange} className="w-full p-2 border rounded-lg bg-white">
                    <option value="ACTIVE">Active</option>
                    <option value="INACTIVE">Inactive</option>
                  </select>
                </div>
              </div>
              <div className="flex justify-end gap-3 mt-6">
                <button type="button" onClick={() => setShowVehicleModal(false)} className="px-4 py-2 border rounded-xl hover:bg-gray-50 text-sm font-medium">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-[#E10600] text-white rounded-xl hover:bg-red-700 text-sm font-medium">Save Pricing</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Weight Modal */}
      {showWeightModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl w-full max-w-md p-6">
            <h3 className="text-xl font-bold mb-4">{isEditingWeight ? "Edit" : "Add"} Weight Slab</h3>
            <form onSubmit={saveWeightSlab} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">From Weight (KG)</label>
                  <input type="number" name="fromWeight" value={weightForm.fromWeight} onChange={handleWeightChange} required min="0" className="w-full p-2 border rounded-lg" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">To Weight (KG)</label>
                  <input type="number" name="toWeight" value={weightForm.toWeight} onChange={handleWeightChange} required min="0.1" step="0.1" className="w-full p-2 border rounded-lg" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Extra Charge (₹)</label>
                  <input type="number" name="extraCharge" value={weightForm.extraCharge} onChange={handleWeightChange} required min="0" className="w-full p-2 border rounded-lg" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <select name="status" value={weightForm.status} onChange={handleWeightChange} className="w-full p-2 border rounded-lg bg-white">
                    <option value="ACTIVE">Active</option>
                    <option value="INACTIVE">Inactive</option>
                  </select>
                </div>
              </div>
              <div className="flex justify-end gap-3 mt-6">
                <button type="button" onClick={() => setShowWeightModal(false)} className="px-4 py-2 border rounded-xl hover:bg-gray-50 text-sm font-medium">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-[#E10600] text-white rounded-xl hover:bg-red-700 text-sm font-medium">Save Slab</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default ParcelSlabs;
