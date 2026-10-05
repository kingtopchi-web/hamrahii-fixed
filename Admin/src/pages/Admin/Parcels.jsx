import React, { useState, useEffect } from 'react';
import { Package, Search, Filter, Loader2, MapPin, IndianRupee, User, Car } from 'lucide-react';
import Axios from '../../services/axios';
import { api } from '../../services/api';
import { toast } from 'react-toastify';
import { motion } from 'framer-motion';

const Parcels = () => {
  const [parcels, setParcels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [expandedRows, setExpandedRows] = useState({});
  const toggleRow = (id) => setExpandedRows(prev => ({ ...prev, [id]: !prev[id] }));

  const fetchParcels = async () => {
    try {
      setLoading(true);
      const res = await Axios.get(api.admin.getAllParcels);
      if (res.data.success) {
        setParcels(res.data.data);
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to fetch parcels");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchParcels();
  }, []);

  const getStatusColor = (status) => {
    switch (status) {
      case 'REQUESTED': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'ACCEPTED': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'PICKED_UP': return 'bg-indigo-100 text-indigo-800 border-indigo-200';
      case 'IN_TRANSIT': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'DELIVERED': return 'bg-green-100 text-green-800 border-green-200';
      case 'COMPLETED': return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'CANCELLED': 
      case 'REJECTED': return 'bg-red-100 text-red-800 border-[#FCA5A5]';
      default: return 'bg-[#F8FAFC] text-[#0F172A] border-[#E2E8F0]';
    }
  };

  const filteredParcels = parcels.filter((parcel) => 
    parcel._id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    parcel.sender?.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    parcel.pickup?.city?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    parcel.dropoff?.city?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#0F172A] flex items-center gap-2">
            <Package className="w-6 h-6 text-[#3B82F6]" />
            Parcel Deliveries
          </h1>
          <p className="text-[#64748B] text-sm mt-1">Manage and track all parcel requests across the platform</p>
        </div>
        
        <div className="flex gap-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#94A3B8] w-4 h-4" />
            <input 
              type="text" 
              placeholder="Search by ID, User, or City..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-[#E2E8F0] rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-sm"
            />
          </div>
          <button onClick={fetchParcels} className="p-2 border border-[#E2E8F0] rounded-xl hover:bg-[#F8FAFC] text-[#475569] bg-[#FFFFFF] shadow-sm transition-all">
            <Filter className="w-4 h-4" />
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center h-64 bg-[#FFFFFF] rounded-2xl border border-[#E2E8F0] shadow-sm">
          <Loader2 className="w-8 h-8 text-[#3B82F6] animate-spin mb-4" />
          <p className="text-[#64748B] font-medium">Loading parcels...</p>
        </div>
      ) : (
        <div className="bg-[#FFFFFF] border border-[#E2E8F0] rounded-2xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-[#F8FAFC]/80 text-[#475569] font-medium border-b border-[#E2E8F0]">
                <tr>
                  <th className="px-6 py-4">Tracking ID / Status</th>
                  <th className="px-6 py-4">Sender & Receiver</th>
                  <th className="px-6 py-4">Route</th>
                  <th className="px-6 py-4">Assigned Driver</th>
                  <th className="px-6 py-4 text-right">Financials</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredParcels.map((parcel, index) => (
                  <React.Fragment key={parcel._id}>
                  <motion.tr 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="hover:bg-[#F8FAFC]/50 transition-colors cursor-pointer"
                    onClick={() => toggleRow(parcel._id)}
                  >
                    <td className="px-6 py-4">
                      <div className="font-mono text-xs text-[#64748B] mb-1">#{parcel._id.substring(18)}</div>
                      <span className={`px-2.5 py-1 rounded-md text-[11px] font-bold border ${getStatusColor(parcel.status)}`}>
                        {parcel.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 mb-1">
                        <User className="w-3.5 h-3.5 text-[#94A3B8]" />
                        <span className="font-medium text-[#0F172A]">{parcel.sender?.firstName || 'User'}</span>
                      </div>
                      <div className="text-xs text-[#64748B] pl-5">To: {parcel.receiverDetails?.name}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1.5 text-[#0F172A]">
                        <span className="font-medium">{parcel.pickup?.city}</span>
                        <span className="text-[#94A3B8] text-xs">→</span>
                        <span className="font-medium">{parcel.dropoff?.city}</span>
                      </div>
                      <div className="text-xs text-[#64748B] mt-1">{parcel.weight}kg • {parcel.itemType || parcel.parcelType}</div>
                    </td>
                    <td className="px-6 py-4">
                      {parcel.driver ? (
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-xs font-bold">
                            {parcel.driver.firstName?.[0] || 'D'}
                          </div>
                          <div>
                            <p className="font-medium text-[#0F172A] text-sm">{parcel.driver.firstName}</p>
                            <p className="text-xs text-[#64748B]">{parcel.driver.phone}</p>
                          </div>
                        </div>
                      ) : (
                        <span className="text-[#94A3B8] italic text-xs">Unassigned</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="font-bold text-[#0F172A] flex items-center justify-end gap-1">
                        <IndianRupee className="w-3.5 h-3.5" />
                        {parcel.amount || 0}
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        {parcel.paymentMethod === 'COD' ? 'COD' : 'ONLINE'} • <span className={parcel.paymentStatus === 'PAID' ? 'text-emerald-600 font-bold' : 'text-amber-600 font-bold'}>{parcel.paymentStatus?.replace('_', ' ') || 'PENDING'}</span>
                      </div>
                    </td>
                  </motion.tr>
                  {expandedRows[parcel._id] && (
                    <tr className="bg-gray-50 border-b border-gray-100">
                      <td colSpan="5" className="px-6 py-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                          <div>
                            <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Pricing Snapshot</h4>
                            <div className="space-y-1.5 text-sm">
                              {parcel.fareDetails ? (
                                <>
                                  <div className="flex justify-between"><span className="text-gray-600">Vehicle Type</span><span className="font-medium">{parcel.fareDetails.vehicleType}</span></div>
                                  <div className="flex justify-between"><span className="text-gray-600">Base Fare (up to {parcel.fareDetails.includedKm}km)</span><span className="font-medium">₹{Number(parcel.fareDetails.baseFare || 0).toFixed(2)}</span></div>
                                  <div className="flex justify-between"><span className="text-gray-600">Total Distance</span><span className="font-medium">{Number(parcel.fareDetails.distanceKm || 0).toFixed(2)} KM</span></div>
                                  <div className="flex justify-between"><span className="text-gray-600">Extra Distance ({Number(parcel.fareDetails.extraDistanceKm || 0).toFixed(2)}km × ₹{parcel.fareDetails.extraKmRate})</span><span className="font-medium">₹{Number(parcel.fareDetails.distanceCharge || 0).toFixed(2)}</span></div>
                                  <div className="flex justify-between"><span className="text-gray-600">Weight Charge ({parcel.fareDetails.parcelWeight} kg)</span><span className="font-medium">₹{Number(parcel.fareDetails.weightCharge || 0).toFixed(2)}</span></div>
                                  <div className="flex justify-between border-t border-gray-200 pt-1 mt-1"><span className="font-bold">Final Fare</span><span className="font-bold">₹{Number(parcel.fareDetails.finalFare || 0).toFixed(2)}</span></div>
                                </>
                              ) : (
                                <div className="text-gray-500 italic">No detailed pricing snapshot available for this booking.</div>
                              )}
                            </div>
                          </div>
                          <div>
                            <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Addresses</h4>
                            <div className="space-y-3 text-sm">
                              <div>
                                <span className="text-gray-600 block text-xs">Pickup</span>
                                <span className="font-medium">{parcel.pickup?.address}</span>
                              </div>
                              <div>
                                <span className="text-gray-600 block text-xs">Drop-off</span>
                                <span className="font-medium">{parcel.dropoff?.address}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                  </React.Fragment>
                ))}
                
                {filteredParcels.length === 0 && (
                  <tr>
                    <td colSpan="5" className="px-6 py-12 text-center text-[#64748B]">
                      <div className="flex flex-col items-center justify-center">
                        <Package className="w-10 h-10 text-gray-300 mb-3" />
                        <p className="text-base font-medium text-[#0F172A]">No parcels found</p>
                        <p className="text-sm">We couldn't find any parcel records matching your search.</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default Parcels;
