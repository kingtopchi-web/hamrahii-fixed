import React from 'react'
import { useState } from 'react'
import { toast } from 'react-toastify'
import Axios from '../../services/axios'
import { api } from '../../services/endpoints'
import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

const Bookings = () => {
    const navigate = useNavigate()
    const [newBookings, setNewBookings] = useState([])
    const [loading, setLoading] = useState(false)

    const handleGetBookings = async () => {
        try {
            setLoading(true)
            const res = await Axios.get(api.ride.getNewBookings)
            console.log(res, "this is response")
            if (res?.data?.success) {
                setNewBookings(res.data.bookings)
            }
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        handleGetBookings()
    }, [])

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        })
    }

    const handleViewDetails = (ride) => {
        navigate(
            `/my-profile/show-offered-rides-details/${ride?._id}$$$${ride.from?.city}-to-${ride.to.city}`,
        );
    };


    const formatTime = (timeString) => {
        return new Date(timeString).toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
        })
    }

    const getStatusBadgeColor = (status) => {
        switch (status?.toLowerCase()) {
            case 'requested':
                return 'bg-amber-100 text-amber-800 border-amber-200'
            case 'confirmed':
                return 'bg-emerald-100 text-emerald-800 border-emerald-200'
            case 'cancelled':
                return 'bg-rose-100 text-rose-800 border-rose-200'
            case 'completed':
                return 'bg-blue-100 text-blue-800 border-blue-200'
            default:
                return 'bg-gray-100 text-gray-800 border-gray-200'
        }
    }

    const getInitials = (firstName, lastName) => {
        return `${firstName?.charAt(0) || ''}${lastName?.charAt(0) || ''}`.toUpperCase()
    }

    if (loading) {
        return (
            <div className="flex justify-center items-center h-96">
                <div className="relative">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
                    <p className="mt-4 text-gray-500 font-medium">Loading bookings...</p>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
            <div className="max-w-7xl mx-auto">
                {/* Header Section */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
                        My Bookings
                    </h1>
                    <p className="text-gray-500 mt-2">
                        {newBookings.length} {newBookings.length === 1 ? 'booking' : 'bookings'} found
                    </p>
                </div>

                {newBookings.length === 0 ? (
                    <div className="text-center py-16 bg-white rounded-2xl shadow-sm">
                        <div className="text-6xl mb-4">🚗</div>
                        <h3 className="text-xl font-semibold text-gray-700 mb-2">No bookings yet</h3>
                        <p className="text-gray-500">Your upcoming rides will appear here</p>
                    </div>
                ) : (
                    <div className="grid gap-6">
                        {newBookings.map((booking) => {
                            const passenger = booking.passengers?.[0] || booking
                            const user = passenger.user || booking.user
                            const profilePhoto = user?.profilePhotos?.[0]

                            return (
                                <div
                                    key={booking._id}
                                    className="group bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100 hover:border-indigo-200"
                                >
                                    <div className="p-6">
                                        {/* Header with Route and Status */}
                                        <div className="flex flex-wrap justify-between items-start gap-4 mb-6">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-3 mb-2">
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-3 h-3 rounded-full bg-indigo-500"></div>
                                                        <span className="font-semibold text-gray-700">{booking.from?.city}</span>
                                                    </div>
                                                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3"></path>
                                                    </svg>
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
                                                        <span className="font-semibold text-gray-700">{booking.to?.city}</span>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-4 text-sm text-gray-500">
                                                    <div className="flex items-center gap-1">
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                                                        </svg>
                                                        <span>{formatDate(booking.departureDate || booking.departureTime)}</span>
                                                    </div>
                                                    <div className="flex items-center gap-1">
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                                                        </svg>
                                                        <span>{formatTime(booking.departureTime)}</span>
                                                    </div>
                                                </div>
                                            </div>
                                            <span className={`px-4 py-1.5 rounded-full text-sm font-semibold border ${getStatusBadgeColor(booking.status)}`}>
                                                {booking.status || 'N/A'}
                                            </span>
                                        </div>

                                        {/* User Profile Section */}
                                        {(user || passenger.user) && (
                                            <div className="flex items-start gap-4 p-4 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl mb-6">
                                                {/* Profile Picture */}
                                                {profilePhoto?.url ? (
                                                    <img
                                                        src={import.meta.env.VITE_ASSETS_URL + profilePhoto.url}
                                                        alt={`${user?.firstName} ${user?.lastName}`}
                                                        className="w-14 h-14 rounded-full object-cover border-2 border-white shadow-md"
                                                    />
                                                ) : (
                                                    <div className="w-14 h-14 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-xl shadow-md">
                                                        {getInitials(user?.firstName, user?.lastName)}
                                                    </div>
                                                )}

                                                <div className="flex-1">
                                                    <div className="flex items-center justify-between flex-wrap gap-2 mb-2">
                                                        <h3 className="font-semibold text-gray-800 text-lg">
                                                            {user?.firstName} {user?.lastName}
                                                        </h3>
                                                        {user?.phone && (
                                                            <span className="text-sm text-gray-500 bg-white px-3 py-1 rounded-full">
                                                                📞 {user.phone}
                                                            </span>
                                                        )}
                                                    </div>

                                                    {/* Bio */}
                                                    {user?.bio && (
                                                        <div className="mt-2">
                                                            <div className="flex items-start gap-2">
                                                                <svg className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h7"></path>
                                                                </svg>
                                                                <p className="text-sm text-gray-600 line-clamp-2">
                                                                    {user.bio}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        )}

                                        {/* Journey Details */}
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                                            <div className="bg-gray-50 rounded-lg p-3">
                                                <p className="text-xs font-semibold text-gray-500 uppercase mb-1">Pickup Location</p>
                                                <p className="text-sm text-gray-700">{booking.from?.address || booking.from?.city}</p>
                                            </div>
                                            <div className="bg-gray-50 rounded-lg p-3">
                                                <p className="text-xs font-semibold text-gray-500 uppercase mb-1">Drop Location</p>
                                                <p className="text-sm text-gray-700">{booking.to?.address || booking.to?.city}</p>
                                            </div>
                                        </div>

                                        {/* Passenger Details & Seats */}
                                        <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-gray-100">
                                            <div className="flex items-center gap-3">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center">
                                                        <svg className="w-4 h-4 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                                                        </svg>
                                                    </div>
                                                    <div>
                                                        <p className="text-xs text-gray-500">Passengers</p>
                                                        <p className="text-sm font-semibold text-gray-700">
                                                            {booking.passengers?.length || 1} passenger(s)
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center">
                                                        <svg className="w-4 h-4 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"></path>
                                                        </svg>
                                                    </div>
                                                    <div>
                                                        <p className="text-xs text-gray-500">Seats</p>
                                                        <p className="text-sm font-semibold text-gray-700">
                                                            {booking.seatsBooked || booking.passengers?.[0]?.seatsBooked || 1} seat(s)
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Action Button */}
                                            <button onClick={(e) => handleViewDetails(booking)} className="px-4 py-2 text-sm font-medium text-indigo-600 hover:text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors duration-200">
                                                View Details
                                            </button>
                                        </div>

                                        {/* Additional Passengers if more than 1 */}
                                        {booking.passengers && booking.passengers.length > 1 && (
                                            <div className="mt-4 pt-3 border-t border-gray-100">
                                                <details className="text-sm">
                                                    <summary className="text-indigo-600 cursor-pointer font-medium hover:text-indigo-700">
                                                        + {booking.passengers.length - 1} more passenger(s)
                                                    </summary>
                                                    <div className="mt-2 space-y-2">
                                                        {booking.passengers.slice(1).map((passenger, idx) => (
                                                            <div key={idx} className="bg-gray-50 rounded p-2 text-sm">
                                                                <span className="font-medium">
                                                                    {passenger.user?.firstName} {passenger.user?.lastName}
                                                                </span>
                                                                {passenger.user?.phone && (
                                                                    <span className="text-gray-500 ml-2">({passenger.user.phone})</span>
                                                                )}
                                                            </div>
                                                        ))}
                                                    </div>
                                                </details>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                )}
            </div>
        </div>
    )
}

export default Bookings