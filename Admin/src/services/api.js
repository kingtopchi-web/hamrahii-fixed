const base_Url = (import.meta.env.VITE_BACKEND_URL || "").trim().replace(/\/$/, "");
export const api = {
  admin: {
    sendLoginOtp: base_Url + "/admin/send-login-otp",
    verifyOtpLogin: base_Url + "/admin/verify-otp-login",
    getData: base_Url + "/admin/get-admin-details",
    logout: base_Url + "/admin/logout",
    getStats: base_Url + "/admin/get-rides-stats",
    dashboardOverview: base_Url + "/admin/dashboard-overview",
    recentRides: base_Url + "/admin/recent-rides",
    popularRoutes: base_Url + "/admin/popular-routes",
    driverStats: base_Url + "/admin/driver-stats",
    revenueAnalytics: base_Url + "/admin/revenue-analytics",
    performanceMetrics: base_Url + "/admin/performance-metrics",
    getAllRides: base_Url + "/admin/get-all-rides",
    getAllParcels: base_Url + "/admin/get-all-parcels",
    getAllUsers: base_Url + "/admin/get-all-users",
    getStats: base_Url + "/admin/get-rides-stats",
    getMessages: base_Url + "/admin/get-all-message",
    broadCast: base_Url + "/admin/perform-broadcast",
    platformHealth: base_Url + "/admin/platform-health",
  },
  user: {
    getWithPagination: base_Url + "/admin/get-user-with-pagination",
    getUserDetails: base_Url + "/admin/get-user",
    updateStatus: base_Url + "/admin/update-user-status",
    addWalletMoney: base_Url + "/admin/add-wallet-money",
    addVirtualMoney: base_Url + "/admin/add-wallet-money",
  },
  ride: {
    handleGetRides: base_Url + "/ride/get-rides",
  },
  support: {
    getSupport: base_Url + "/support/get-support-admin",
    markResolved : base_Url + '/support/mark-resolved'
  },
  car: {
    getAllCars: base_Url + "/car/get-all-car",
    updateCarStatus: base_Url + "/car/update-car-status",
    bulkUpdateCarStatus: base_Url + "/car/bulk-update-car-status",
    getCarByStatus: base_Url + "/car/get-car-by-status",
    getCarVerificationHistory: base_Url + "/car/get-car-verifivation-history",
  },
  blog: {
    createBlog: base_Url + "/blog/create-blog",
    getBlog: base_Url + "/blog/get-blog",
    deleteBlog: base_Url + "/blog/delete-blog"
  },
  file: {
    uploadImage: base_Url + "/file/upload-image",
  },
  vehicleType: {
    createVehicleType: base_Url + "/vehicleType/create-vehicle-type",
    getVehicleType: base_Url + "/vehicleType/get-vehicle-type",
    deleteVehicleRide: base_Url + "/vehicleType/delete-vehicle-type",
    addPricingSlabs: base_Url + "/vehicleType/add-pricing-slabs"
  },
  banner : {
    create : base_Url + "/admin/create-banner",
    get : base_Url + "/admin/get-banners",
    delete : base_Url + "/admin/delete-banner",
    update : base_Url + "/admin/update-banner"
  },
  commision : {
    get : base_Url + "/user/commision",
    update : base_Url + "/admin/update-commision"
  }
};
