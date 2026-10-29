import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import Axios from '../../services/axios';
import { api } from '../../services/endpoints';
import { useNavigate, Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { 
  Car, MapPin, Calendar, Clock, User, Phone, 
  CheckCircle, Clock4, XCircle, ArrowRight, 
  History, Loader2, AlertCircle, ShieldCheck
} from 'lucide-react';
import ShowBookingDetails from '../ShowBookingDetails';

const Bookings = () => {
    const navigate = useNavigate();
    const currentUser = useSelector((state) => state.user);
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [cancelLoading, setCancelLoading] = useState({});
    const [selectedBooking, setSelectedBooking] = useState(null);

    const handleGetBookings = async () => {
        try {
            setLoading(true);
            const res = await Axios.get(api.user.getRidesBookingHistory, {
                params: {
                    type: "upcoming",
                    limit: 50
                }
            });
            if (res?.data?.success) {
                const data = Array.isArray(res.data.data) 
                    ? res.data.data 
                    : res.data.data?.bookings || res.data.bookings || [];
                setBookings(data);
            } else {
                setBookings([]);
            }
        } catch (error) {
            console.error("Error fetching bookings:", error);
            toast.error("Failed to load your bookings");
            setBookings([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        handleGetBookings();
    }, []);

    const formatDate = (dateString) => {
        if (!dateString) return 'Date not specified';
        try {
            return new Date(dateString).toLocaleDateString('en-IN', {
                weekday: 'short',
                year: 'numeric',
                month: 'short',
                day: 'numeric'
            });
        } catch {
            return dateString;
        }
    };

    const formatTime = (timeString) => {
        if (!timeString) return 'Time not specified';
        try {
            if (timeString.includes('T')) {
                return new Date(timeString).toLocaleTimeString('en-IN', {
                    hour: '2-digit',
                    minute: '2-digit',
                    hour12: true
                });
            }
            return timeString;
        } catch {
            return timeString;
        }
    };

    const handleViewDetails = (booking) => {
        setSelectedBooking(booking);
    };

    const handleCancelBooking = async (rideId) => {
        if (!window.confirm("Are you sure you want to cancel this booking? Note: Cancellation is only allowed up to 2 hours before departure time.")) return;
        try {
            setCancelLoading((prev) => ({ ...prev, [rideId]: true }));
            const res = await Axios.post(api.ride.cancelBooking, { rideId });
            if (res.data?.success) {
                toast.success(res.data.message || "Booking cancelled successfully");
                handleGetBookings();
            }
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to cancel booking");
        } finally {
            setCancelLoading((prev) => ({ ...prev, [rideId]: false }));
        }
    };

    return (
        <div className="min-h-screen bg-gray-50/60 p-4 md:p-8">
            <div className="max-w-6xl mx-auto">
                {/* Header Section */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                    <div>
                        <h1 className="text-2xl md:text-3xl font-black text-gray-900 tracking-tight">
                            My Bookings
                        </h1>
                        <p className="text-gray-500 text-sm mt-1">
                            Rides you have booked as a passenger
                        </p>
                    </div>

                    <Link
                        to="/my-profile/booking-history"
                        className="inline-flex items-center gap-2 px-4 py-2 bg-[var(--bg-surface)] hover:bg-gray-100 text-gray-700 font-semibold rounded-xl border border-gray-200 text-xs shadow-sm transition"
                    >
                        <History size={16} className="text-gray-500" />
                        <span>View Past Booking History</span>
                    </Link>
                </div>

                {loading ? (
                    <div className="flex flex-col justify-center items-center h-80 bg-[var(--bg-surface)] rounded-2xl border border-gray-200 shadow-sm">
                        <Loader2 className="w-8 h-8 animate-spin text-indigo-600 mb-3" />
                        <p className="text-gray-500 text-sm font-medium">Loading your booked rides...</p>
                    </div>
                ) : bookings.length === 0 ? (
                    <div className="text-center py-16 bg-[var(--bg-surface)] rounded-2xl shadow-sm border border-gray-200">
                        <div className="w-16 h-16 mx-auto bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600 mb-4">
                            <Car size={32} />
                        </div>
                        <h3 className="text-lg font-bold text-gray-800 mb-1">No active bookings found</h3>
                        <p className="text-gray-500 text-sm max-w-sm mx-auto mb-6">
                            You don't have any upcoming rides. Search and book available rides on your route!
                        </p>
                        <button
                            onClick={() => navigate("/rides")}
                            className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs transition shadow-sm cursor-pointer"
                        >
                            Find & Book a Ride
                        </button>
                    </div>
                ) : (
                    <div className="grid gap-5">
                        {bookings.map((booking) => {
                            const currentUserId = currentUser?._id || localStorage.getItem("userId");
                            const myPassenger = Array.isArray(booking.passengers)
                                ? booking.passengers.find(
                                      (p) => (p.user?._id || p.user)?.toString() === currentUserId?.toString()
                                  ) || booking.passengers[0]
                                : null;

                            const passengerStatus = (myPassenger?.status || booking.status || "requested").toLowerCase();
                            const isAccepted = passengerStatus === "accepted" || passengerStatus === "confirmed";
                            const isCancelled = passengerStatus === "cancelled";

                            const driver = booking.driver;
                            const driverName = driver ? `${driver.firstName || ''} ${driver.lastName || ''}`.trim() : "Driver";
                            const car = booking.car || booking.carDetails || {};
                            const carModel = car.model || "Vehicle";
                            const carBrand = car.brand || "";
                            const seatsBooked = myPassenger?.seatsBooked || 1;
                            const totalFare = (booking.pricePerSeat || 0) * seatsBooked;

                            return (
                                <div
                                    key={booking._id}
                                    className="bg-[var(--bg-surface)] rounded-2xl shadow-sm hover:shadow-md transition-all duration-200 border border-gray-200 overflow-hidden"
                                >
                                    <div className="p-5 md:p-6">
                                        {/* Top Route & Status Bar */}
                                        <div className="flex flex-wrap justify-between items-start gap-4 mb-5 pb-4 border-b border-gray-100">
                                            <div className="flex-1 min-w-[240px]">
                                                <div className="flex items-center gap-2 text-base font-bold text-gray-900 mb-1.5">
                                                    <span className="truncate max-w-[150px] sm:max-w-[200px]">
                                                        {booking.from?.city || "Origin"}
                                                    </span>
                                                    <ArrowRight size={16} className="text-gray-400 flex-shrink-0" />
                                                    <span className="truncate max-w-[150px] sm:max-w-[200px]">
                                                        {booking.to?.city || "Destination"}
                                                    </span>
                                                </div>

                                                <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500 font-medium">
                                                    <span className="flex items-center gap-1">
                                                        <Calendar size={13} className="text-gray-400" />
                                                        {formatDate(booking.departureDate)}
                                                    </span>
                                                    <span className="flex items-center gap-1">
                                                        <Clock size={13} className="text-gray-400" />
                                                        {formatTime(booking.departureTime)}
                                                    </span>
                                                </div>
                                            </div>

                                            {/* Status Badge */}
                                            <div>
                                                {isAccepted ? (
                                                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                                        <CheckCircle size={14} />
                                                        <span>Booking Confirmed</span>
                                                    </span>
                                                ) : isCancelled ? (
                                                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200">
                                                        <XCircle size={14} />
                                                        <span>Cancelled</span>
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200">
                                                        <Clock4 size={14} />
                                                        <span>Waiting Driver Approval</span>
                                                    </span>
                                                )}
                                            </div>
                                        </div>

                                        {/* Driver & Ride Details Row */}
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5">
                                            {/* Driver Card */}
                                            <div className="flex items-center gap-3.5 p-3.5 bg-gray-50/80 rounded-xl border border-gray-100">
                                                <div className="w-12 h-12 rounded-full bg-indigo-100 text-indigo-700 font-black text-lg flex items-center justify-center flex-shrink-0 border border-white shadow-sm">
                                                    {driverName.charAt(0) || "D"}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-xs text-gray-500 font-medium">Driver</p>
                                                    <p className="font-bold text-gray-900 text-sm truncate">{driverName}</p>
                                                    <p className="text-xs text-gray-500 truncate">
                                                        {carBrand} {carModel}
                                                    </p>
                                                </div>
                                                {isAccepted && driver?.phone && (
                                                    <a
                                                        href={`tel:${driver.phone}`}
                                                        className="p-2.5 bg-emerald-100 hover:bg-emerald-200 text-emerald-800 rounded-xl transition flex-shrink-0"
                                                        title="Call Driver"
                                                    >
                                                        <Phone size={16} />
                                                    </a>
                                                )}
                                            </div>

                                            {/* Booking Fare & Seats Info */}
                                            <div className="flex items-center justify-between p-3.5 bg-gray-50/80 rounded-xl border border-gray-100">
                                                <div>
                                                    <p className="text-xs text-gray-500 font-medium">Seats Booked</p>
                                                    <p className="text-sm font-bold text-gray-900">
                                                        {seatsBooked} seat{seatsBooked > 1 ? 's' : ''}
                                                    </p>
                                                    <p className="text-xs text-gray-500">
                                                        ₹{booking.pricePerSeat || 0} / seat
                                                    </p>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-xs text-gray-500 font-medium">Total Fare</p>
                                                    <p className="text-lg font-black text-emerald-600">
                                                        ₹{totalFare}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Actions Footer */}
                                        <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-gray-100">
                                            <div className="text-xs text-gray-500">
                                                {isAccepted ? (
                                                    <span className="text-emerald-700 font-medium flex items-center gap-1">
                                                        <ShieldCheck size={14} /> Ready for ride. Contact driver for pickup coordination.
                                                    </span>
                                                ) : isCancelled ? (
                                                    <span className="text-gray-400">This booking was cancelled.</span>
                                                ) : (
                                                    <span className="text-amber-700 font-medium">Driver will confirm or decline your request.</span>
                                                )}
                                            </div>

                                            <div className="flex items-center gap-2">
                                                {!isCancelled && passengerStatus !== "completed" && (
                                                    <button
                                                        onClick={() => handleCancelBooking(booking._id)}
                                                        disabled={cancelLoading[booking._id]}
                                                        className="px-4 py-2 text-xs font-bold text-rose-700 hover:text-rose-800 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-xl transition cursor-pointer disabled:opacity-50"
                                                    >
                                                        {cancelLoading[booking._id] ? "Cancelling..." : "Cancel Booking"}
                                                    </button>
                                                )}

                                                <button
                                                    onClick={() => handleViewDetails(booking)}
                                                    className="px-4 py-2 text-xs font-bold text-indigo-700 hover:text-indigo-800 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 rounded-xl transition cursor-pointer"
                                                >
                                                    View Details
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* View Booking Details Modal */}
            {selectedBooking && (
                <ShowBookingDetails
                    showBookingDetail={selectedBooking}
                    setShowBookingDetail={(val) => {
                        setSelectedBooking(val);
                        if (!val) {
                            handleGetBookings();
                        }
                    }}
                />
            )}
        </div>
    );
};

export default Bookings;
