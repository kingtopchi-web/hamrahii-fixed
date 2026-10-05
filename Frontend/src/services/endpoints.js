import { uploadImage } from "./uploadImage"

const base_url = import.meta.env.VITE_BACKEND_URL


export const api = {
    user: {
        register: base_url + "/user/register",
        login: base_url + "/user/login",
        getFullDetails: base_url + "/user/get-user-details",
        logOut: base_url + "/user/logout",
        sendOtpForResetPassword: base_url + "/user/send-otp-for-password-reset",
        resetPassword: base_url + "/user/reset-password",
        uploadProfielPic: base_url + "/user/upload-profile-pic",
        editBasicDetails: base_url + "/user/edit-basic-details",
        saveFcm: base_url + "/user/save-fcm",
        googleLogin: base_url + "/user/google-login",
        googleRegistration: base_url + "/user/google-registration",
        googleSignIn: base_url + "/user/google-sign-in",
        contact: base_url + "/user/contact",
        creditWallet: base_url + "/user/credit-wallet",
        getTransactionDetails: base_url + "/user/transaction",
        getRidesBookingHistory: base_url + "/user/ride-booking-history",
        sendEmailVerificationOtp: base_url + "/user/send-email-verification-otp",
        verifyEmailOtp: base_url + "/user/verify-email-otp",
        sendPhoneVerificationOtp: base_url + "/user/send-phone-verification-otp",
        verifyPhoneOtp: base_url + "/user/verify-phone-opt",
        support: base_url + "/user/support",
        editPreferences: base_url + "/user/edit-preferences",
        addBio: base_url + "/user/add-bio",
        getReferrals: base_url + "/user/get-referrals",
        getVirtualTransaction: base_url + "/user/get-virtual-transaction",
        getDlDetails: base_url + "/user/get-dl-details",
        confirmDlDetails: base_url + "/user/confirm-dl-details",
        updateLocation: base_url + "/user/update-location",
        notifications: base_url + "/user/notifications",
        markNotificationsRead: base_url + "/user/notifications/mark-read"
    },
    file: {
        uploadImage: base_url + "/file/upload-image"
    },
    car: {
        add: base_url + "/car/add",
        deactivate: base_url + "/car/deactivate",
        getByUser: base_url + "/car/get-by-user",
        getDataBySurePassApi: base_url + "/car/surepass-api"
    },
    ride: {
        create: base_url + "/ride/create",
        getOffered: base_url + "/ride/get-offered",
        getlocationSuggetion: base_url + "/ride/get-location-suggestion",
        find: base_url + "/ride/find-rides",
        getById: base_url + "/ride/get-details-by-id",
        requestRide: base_url + "/ride/request-for-ride",
        getOfferedRideDetails: base_url + "/ride/get-offered-ride-details",
        acceptRideRequest: base_url + "/ride/accept-ride",
        rejectRideRequest: base_url + "/ride/reject-ride",
        getRecentRides: base_url + "/ride/recent-ride",
        getNewBookings: base_url + "/ride/get-new-bookings"
    },
    location: {
        getSuggetsions: base_url + "/location/get-suggetions",
        getByCoordinates: base_url + "/location/get-by-coordinates",
    },
    support: {
        createSupport: base_url + "/support/create-support",
        getSupport: base_url + "/support/get-support"
    },
    blog: {
        getBlog: base_url + "/blog/get-blog",
        getAllBlog: base_url + "/blog/get-all-blog"
    },
    payment: {
        create: base_url + "/payment/create",
        handlePayment: base_url + "/payment/handle-payment"
    },
    vehicleType: {
        getByUser: base_url + "/vehicleType/get-types-by-user",
        getPricingSlabs: base_url + "/vehicleType/get-slabs-by-id"
    },
    commision: {
        get: base_url + "/user/commision",
    },
    parcel: {
        create: base_url + "/parcel/create",
        calculateFare: base_url + "/parcel/calculate-fare",
        getMyParcels: base_url + "/parcel/my-parcels",
        getDeliveries: base_url + "/parcel/deliveries",
        getRideParcels: (rideId) => base_url + `/parcel/ride/${rideId}`,
        updateStatus: (parcelId) => base_url + `/parcel/${parcelId}/status`,
        track: (parcelId) => base_url + `/parcel/${parcelId}/track`,
        getNearbyRiders: (parcelId) => base_url + `/parcel/${parcelId}/nearby-riders`,
        refreshSearch: (parcelId) => base_url + `/parcel/${parcelId}/refresh-search`,
    }
}