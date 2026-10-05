import React, { useState, useEffect } from 'react'
import { 
  X, 
  Calendar, 
  Clock, 
  Users, 
  Car,
  CheckCircle,
  AlertCircle,
  Loader2,
  ChevronRight,
  ChevronLeft,
  Shield,
  CreditCard,
  Lock,
  Sparkles,
  Package,
  DollarSign,
  TrendingUp,
  BadgeCheck,
  MapPin,
  Navigation,
  User,
  Route,
  Zap,
  Star,
  Target,
  IndianRupee
} from 'lucide-react'
import Axios from '../services/axios'
import { api } from '../services/endpoints'
import { toast } from 'react-toastify'

const ShowBooking = ({ setShowBooking, rideDetails , selectedSeats}) => {
  const [loading, setLoading] = useState(false)
  const [step, setStep] = useState(1)
  const [seats, setSeats] = useState(selectedSeats || 1)
  const [estimatedFare, setEstimatedFare] = useState(0)
  
  useEffect(() => {
    if (rideDetails.pricePerSeat) {
      const baseFare = rideDetails.pricePerSeat * seats
      setEstimatedFare(Math.round(baseFare))
    }
  }, [seats, rideDetails.pricePerSeat])

  const handleNextStep = () => {
    if (step === 1) {
      if (seats < 1) {
        toast.error('Please select at least 1 seat')
        return
      }
      if (seats > rideDetails.availableSeats) {
        toast.error(`Only ${rideDetails.availableSeats} seats available`)
        return
      }
    }
    setStep(prev => prev + 1)
  }

  const handlePrevStep = () => {
    setStep(prev => prev - 1)
  }

  const handleBookRide = async (e) => {
    e.preventDefault()

    setLoading(true)
    try {
      const bookingData = {
        rideId: rideDetails._id,
        seatsBooked: seats
      }

      const response = await Axios.post(api.ride.requestRide, bookingData)
      
      if (response.data.success) {
        toast.success('🎉 Ride request sent successfully!')
        setShowBooking(false)
      } else {
        toast.error(response.data.message || 'Failed to request ride')
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to request ride')
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-IN', {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    })
  }

  const formatTime = (timeString) => {
    const time = new Date(timeString)
    return time.toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const renderStep1 = () => (
    <div className='p-4 md:p-6 space-y-6'>
      {/* Journey Card */}
      <div className='bg-gradient-to-br from-slate-900 to-slate-800 rounded-xl p-5 text-white'>
        <div className='flex items-center justify-between mb-4'>
          <div>
            <h3 className='text-lg font-bold'>Journey Details</h3>
            <p className='text-slate-300 text-sm mt-1'>
              {formatDate(rideDetails.departureTime)} • {formatTime(rideDetails.departureTime)}
            </p>
          </div>
          <div className='bg-white/10 backdrop-blur-sm px-3 py-1 rounded-full text-xs'>
            <span className='font-bold'>{rideDetails.availableSeats}</span>
            <span className='text-slate-300 ml-1'>seats left</span>
          </div>
        </div>
        
        {/* Route Display */}
        <div className='relative'>
          <div className='flex items-start gap-3 mb-6'>
            <div className='flex-shrink-0 w-8 h-8 bg-red-500 rounded-full flex items-center justify-center shadow'>
              <MapPin className='w-4 h-4 text-white' />
            </div>
            <div className='flex-1'>
              <p className='text-xs text-slate-300 mb-1'>Pickup</p>
              <p className='font-semibold text-sm'>{rideDetails.from?.city || 'Unknown'}</p>
              <p className='text-slate-400 text-xs truncate'>{rideDetails.from?.address || 'Address not specified'}</p>
            </div>
          </div>
          
          <div className='absolute left-4 top-8 bottom-8 w-0.5 bg-gradient-to-b from-red-500 to-blue-500'></div>
          
          <div className='flex items-start gap-3'>
            <div className='flex-shrink-0 w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center shadow'>
              <MapPin className='w-4 h-4 text-white' />
            </div>
            <div className='flex-1'>
              <p className='text-xs text-slate-300 mb-1'>Drop</p>
              <p className='font-semibold text-sm'>{rideDetails.to?.city || 'Unknown'}</p>
              <p className='text-slate-400 text-xs truncate'>{rideDetails.to?.address || 'Address not specified'}</p>
            </div>
          </div>
        </div>
        
        {/* Vehicle & Driver Info */}
        <div className='mt-5 pt-4 border-t border-white/10'>
          <div className='grid grid-cols-2 gap-3'>
            {rideDetails.vehicle && (
              <div className='flex items-center gap-2'>
                <Car className='w-4 h-4 text-slate-300' />
                <div>
                  <p className='text-xs text-slate-300'>Vehicle</p>
                  <p className='text-sm font-medium'>{rideDetails.vehicle.model}</p>
                </div>
              </div>
            )}
            <div className='flex items-center gap-2'>
              <User className='w-4 h-4 text-slate-300' />
              <div>
                <p className='text-xs text-slate-300'>Driver</p>
                <p className='text-sm font-medium'>
                  {rideDetails.driver?.firstName} {rideDetails.driver?.lastName}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Seat Selection Card */}

      {rideDetails?.isFullSharing ? null : <div className='bg-white rounded-xl border border-slate-200 p-5'>
        <div className='flex items-center justify-between mb-4'>
          <div>
            <h3 className='text-lg font-bold text-slate-900'>Select Seats</h3>
            <p className='text-slate-600 text-sm'>How many seats do you need?</p>
          </div>
          <div className='flex items-center gap-1 px-3 py-1 bg-slate-100 rounded-full'>
            <Package className='w-3 h-3 text-slate-600' />
            <span className='text-sm font-medium text-slate-900'>{rideDetails.availableSeats} left</span>
          </div>
        </div>
        
        <div className='space-y-4'>
          {/* Seat Counter */}
          <div className='flex flex-col sm:flex-row sm:items-center justify-between gap-4'>
            <div className='space-y-1'>
              <p className='text-sm font-medium text-slate-900'>Number of Seats</p>
              <p className='text-xs text-slate-500'>Each seat is booked individually</p>
            </div>
            <div className='flex items-center gap-3'>
              <button
                type='button'
                onClick={() => setSeats(prev => Math.max(1, prev - 1))}
                className='w-10 h-10 flex items-center justify-center border border-slate-300 rounded-lg hover:border-red-500 hover:bg-red-50 transition-all disabled:opacity-50'
                disabled={seats <= 1}
              >
                <span className='text-xl font-bold text-slate-700'>-</span>
              </button>
              <div className='text-center min-w-[60px]'>
                <div className='text-3xl font-bold text-slate-900'>{seats}</div>
                <p className='text-xs text-slate-500'>Seats</p>
              </div>
              <button
                type='button'
                onClick={() => setSeats(prev => Math.min(rideDetails.availableSeats, prev + 1))}
                className='w-10 h-10 flex items-center justify-center border border-slate-300 rounded-lg hover:border-red-500 hover:bg-red-50 transition-all disabled:opacity-50'
                disabled={seats >= rideDetails.availableSeats}
              >
                <span className='text-xl font-bold text-slate-700'>+</span>
              </button>
            </div>
          </div>
          
          {/* Price Info */}
          <div className='p-3 bg-slate-50 rounded-lg'>
            <div className='flex justify-between items-center'>
              <div className='flex items-center gap-2'>
                <DollarSign className='w-3 h-3 text-slate-600' />
                <span className='text-sm text-slate-600'>Price per seat</span>
              </div>
              <span className='font-semibold text-slate-900'>₹{rideDetails.pricePerSeat}</span>
            </div>
            <div className='flex justify-between items-center mt-1'>
              <div className='flex items-center gap-2'>
                <TrendingUp className='w-3 h-3 text-slate-600' />
                <span className='text-sm text-slate-600'>Total seats</span>
              </div>
              <span className='font-semibold text-slate-900'>× {seats}</span>
            </div>
          </div>
        </div>
        
        {/* Estimated Fare */}
        <div className='mt-5 pt-4 border-t border-slate-200'>
          <div className='flex justify-between items-center'>
            <div>
              <span className='text-sm font-medium text-slate-700'>Estimated Fare</span>
              <p className='text-xs text-slate-500'>Total for {seats} seat{seats > 1 ? 's' : ''}</p>
            </div>
            <div className='text-right'>
              <div className='text-2xl font-bold text-red-600'>₹{estimatedFare}</div>
            </div>
          </div>
        </div>
      </div>}
      

      {/* Action Buttons */}
      <div className='flex gap-3'>
        <button
          type='button'
          onClick={() => setShowBooking(false)}
          className='flex-1 px-4 py-3 border border-slate-300 text-slate-700 rounded-lg font-medium hover:border-slate-400 transition-all text-sm'
        >
          Cancel
        </button>
        <button
          type='button'
          onClick={handleNextStep}
          disabled={seats < 1}
          className='flex-1 px-4 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg font-medium hover:shadow-lg transition-all text-sm flex items-center justify-center gap-2 group disabled:opacity-50'
        >
          <span>Continue</span>
          <ChevronRight className='w-4 h-4 group-hover:translate-x-1 transition-transform' />
        </button>
      </div>
    </div>
  )

  const renderStep2 = () => (
    <div className='p-4 md:p-6 space-y-6'>
      {/* Header */}
     

      {/* Booking Card */}
      <div className='max-w-2xl mx-auto'>
        <div className='bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden'>
          {/* Header */}
          <div className='p-4 bg-gradient-to-r from-slate-900 to-slate-800'>
            <div className='flex flex-col sm:flex-row sm:items-center justify-between gap-2'>
              <div>
                <p className='text-xs text-slate-300'>Request ID</p>
                <p className='font-mono text-sm font-bold text-white'>
                  RQ{Math.random().toString(36).substr(2, 6).toUpperCase()}
                </p>
              </div>
              <div className='text-right'>
                <p className='text-xs text-slate-300'>Total Amount</p>
                <p className='text-2xl font-bold text-white'>₹{estimatedFare}</p>
              </div>
            </div>
          </div>
          
          {/* Content */}
          <div className='p-5 space-y-5'>
            {/* Route Summary */}
            <div className='space-y-4'>
              <div className='flex items-center gap-2'>
                <Route className='w-4 h-4 text-slate-400' />
                <h4 className='text-sm font-bold text-slate-900'>Route Details</h4>
              </div>
              
              <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                <div className='p-3 bg-red-50 border border-red-100 rounded-lg'>
                  <div className='flex items-center gap-2 mb-2'>
                    <div className='w-2 h-2 bg-red-500 rounded-full'></div>
                    <p className='text-xs font-medium text-red-700'>PICKUP</p>
                  </div>
                  <p className='font-semibold text-slate-900 text-sm'>{rideDetails.from?.city}</p>
                  <p className='text-slate-600 text-xs truncate'>{rideDetails.from?.address}</p>
                </div>
                
                <div className='p-3 bg-blue-50 border border-blue-100 rounded-lg'>
                  <div className='flex items-center gap-2 mb-2'>
                    <div className='w-2 h-2 bg-blue-500 rounded-full'></div>
                    <p className='text-xs font-medium text-blue-700'>DROP</p>
                  </div>
                  <p className='font-semibold text-slate-900 text-sm'>{rideDetails.to?.city}</p>
                  <p className='text-slate-600 text-xs truncate'>{rideDetails.to?.address}</p>
                </div>
              </div>
            </div>

            {/* Journey Details */}
            <div className='space-y-4'>
              <h4 className='text-sm font-bold text-slate-900'>Journey Information</h4>
              <div className='grid grid-cols-2 md:grid-cols-4 gap-3'>
                <div className='p-3 bg-slate-50 rounded-lg'>
                  <div className='flex items-center gap-2 mb-1'>
                    <Calendar className='w-3 h-3 text-blue-600' />
                    <p className='text-xs text-blue-700'>Date</p>
                  </div>
                  <p className='font-semibold text-slate-900 text-sm'>{formatDate(rideDetails.departureTime)}</p>
                </div>
                
                <div className='p-3 bg-slate-50 rounded-lg'>
                  <div className='flex items-center gap-2 mb-1'>
                    <Clock className='w-3 h-3 text-blue-600' />
                    <p className='text-xs text-blue-700'>Time</p>
                  </div>
                  <p className='font-semibold text-slate-900 text-sm'>{formatTime(rideDetails.departureTime)}</p>
                </div>
                
                
                <div className='p-3 bg-slate-50 rounded-lg'>
                  <div className='flex items-center gap-2 mb-1'>
                    <Users className='w-3 h-3 text-emerald-600' />
                    <p className='text-xs text-emerald-700'>Seats</p>
                  </div>
                  <p className='font-semibold text-slate-900 text-sm'>{rideDetails?.isFullSharing ? "Full" : `${seats} seat${seats > 1 ? 's' : ''}`}</p>
                </div>
                
                <div className='p-3 bg-slate-50 rounded-lg'>
                  <div className='flex items-center gap-2 mb-1'>
                    <Car className='w-3 h-3 text-purple-600' />
                    <p className='text-xs text-purple-700'>Vehicle</p>
                  </div>
                  <p className='font-semibold text-slate-900 text-sm truncate'>{rideDetails.vehicle?.model || 'N/A'}</p>
                </div>
              </div>
            </div>

            {/* Price Breakdown */}
            <div className='bg-slate-50 rounded-lg p-4'>
              <div className='flex items-center gap-2 mb-3'>
                <IndianRupee className='w-4 h-4 text-slate-600' />
                <h4 className='text-sm font-bold text-slate-900'>Price Breakdown</h4>
              </div>
              <div className='space-y-2'>
                <div className='flex justify-between items-center'>
                  <span className='text-sm text-slate-600'>Base Fare</span>
                  <span className='font-medium text-slate-900'>₹{rideDetails.pricePerSeat * seats}</span>
                </div>
                <div className='flex justify-between items-center'>
                  <span className='text-sm text-slate-600'>Service Fee</span>
                  <span className='font-medium text-slate-900'>₹0</span>
                </div>
                <div className='flex justify-between items-center'>
                  <span className='text-sm text-slate-600'>Taxes</span>
                  <span className='font-medium text-slate-900'>₹0</span>
                </div>
                <div className='pt-3 mt-3 border-t border-slate-300'>
                  <div className='flex justify-between items-center'>
                    <span className='font-bold text-slate-900'>Total Amount</span>
                    <span className='text-xl font-bold text-red-600'>₹{estimatedFare}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Important Notes */}
            <div className='bg-amber-50 border border-amber-200 rounded-lg p-4'>
              <div className='flex items-start gap-3'>
                <AlertCircle className='w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5' />
                <div className='space-y-2'>
                  <h4 className='text-sm font-bold text-amber-800'>Important Notes</h4>
                  <ul className='space-y-1.5 text-xs text-amber-700'>
                    <li className='flex items-start gap-2'>
                      <span className='mt-0.5'>•</span>
                      <span>This is a ride request - driver needs to accept</span>
                    </li>
                    <li className='flex items-start gap-2'>
                      <span className='mt-0.5'>•</span>
                      <span>You'll receive email confirmation upon acceptance</span>
                    </li>
                    <li className='flex items-start gap-2'>
                      <span className='mt-0.5'>•</span>
                      <span>No payment required upfront</span>
                    </li>
                    <li className='flex items-start gap-2'>
                      <span className='mt-0.5'>•</span>
                      <span>Cancel anytime before driver acceptance</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className='flex flex-col sm:flex-row gap-3'>
        <button
          type='button'
          onClick={handlePrevStep}
          className='flex-1 px-4 py-3 border border-slate-300 text-slate-700 rounded-lg font-medium hover:border-slate-400 transition-all text-sm'
        >
          Back to Edit
        </button>
        <button
          type='button'
          onClick={handleBookRide}
          disabled={loading}
          className='flex-1 px-4 py-3 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-lg font-medium hover:shadow-lg transition-all text-sm flex items-center justify-center gap-2 group disabled:opacity-50'
        >
          {loading ? (
            <>
              <Loader2 className='w-4 h-4 animate-spin' />
              <span>Sending Request...</span>
            </>
          ) : (
            <>
              <CheckCircle className='w-4 h-4' />
              <span>Confirm & Send Request</span>
              <Navigation className='w-4 h-4 group-hover:translate-x-1 transition-transform' />
            </>
          )}
        </button>
      </div>

      {/* Safety Badges */}
      <div className='flex items-center justify-center gap-4 pt-4'>
        <div className='flex items-center gap-1.5'>
          <Shield className='w-3 h-3 text-green-600' />
          <span className='text-xs text-slate-600'>Safe Ride</span>
        </div>
        <div className='flex items-center gap-1.5'>
          <Star className='w-3 h-3 text-amber-500' />
          <span className='text-xs text-slate-600'>Verified Driver</span>
        </div>
        <div className='flex items-center gap-1.5'>
          <Lock className='w-3 h-3 text-blue-600' />
          <span className='text-xs text-slate-600'>Secure</span>
        </div>
      </div>
    </div>
  )

  return (
    <div className='fixed inset-0 z-50 overflow-hidden'>
      <div 
        className='absolute inset-0 bg-black/70 backdrop-blur-sm'
        onClick={() => setShowBooking(false)}
      />
      
      <div className='absolute inset-2 sm:inset-4 flex items-center justify-center'>
        <div className='bg-white rounded-xl sm:rounded-2xl shadow-2xl w-full h-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col'>
          {/* Header */}
          <div className='bg-white border-b border-slate-200 p-4'>
            <div className='flex items-center justify-between'>
              <div>
                <h2 className='text-lg sm:text-xl font-bold text-slate-900'>Request Ride</h2>
                <p className='text-slate-600 text-xs sm:text-sm mt-0.5'>
                  {rideDetails.from?.city} → {rideDetails.to?.city}
                </p>
              </div>
              <button
                onClick={() => setShowBooking(false)}
                className='p-1.5 hover:bg-slate-100 rounded-lg transition-colors'
              >
                <X className='w-5 h-5 text-slate-500' />
              </button>
            </div>
            
            {/* Progress Steps */}
            <div className='mt-3'>
              <div className='flex items-center justify-center'>
                <div className='flex items-center gap-2 sm:gap-4'>
                  {[1, 2].map((stepNumber) => (
                    <div key={stepNumber} className='flex items-center gap-2'>
                      <div className={`flex items-center justify-center w-6 h-6 rounded-full ${stepNumber <= step ? 'bg-red-500 text-white' : 'bg-slate-200 text-slate-500'}`}>
                        {stepNumber < step ? (
                          <CheckCircle className='w-3 h-3' />
                        ) : (
                          <span className='text-xs font-bold'>{stepNumber}</span>
                        )}
                      </div>
                      <span className={`text-xs font-medium ${stepNumber <= step ? 'text-slate-900' : 'text-slate-500'}`}>
                        {stepNumber === 1 ? 'Seats' : 'Confirm'}
                      </span>
                      {stepNumber < 2 && (
                        <div className={`w-6 sm:w-8 h-0.5 ${stepNumber < step ? 'bg-red-500' : 'bg-slate-300'}`} />
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className='flex-1 overflow-y-auto'>
            {step === 1 && renderStep1()}
            {step === 2 && renderStep2()}
          </div>
        </div>
      </div>
    </div>
  )
}

export default ShowBooking