import { createBrowserRouter } from "react-router-dom";
import App from "../App";
import Home from "../pages/Home/Home";
import About from "../pages/About/About";
import Register from "../pages/LoginRegister/Register";
import Login from "../pages/LoginRegister/Login";
import NotFound from "../pages/handleNotFound/NotFound";
import MyProfile from "../pages/profile/MyProfile";
import ForgotPassword from "../pages/LoginRegister/ForgotPassword";
import PersonalDetails from "../pages/profile/PersonalDetails";
import UploadProfilePage from "../pages/profile/UploadProfilePic";
import EditBasicDetails from "../pages/profile/EditBasicDetails";
import AddCar from "../pages/profile/AddCar";
import Cars from "../pages/profile/Cars";
import BookingHistory from "../pages/profile/BookingHistory";
import OfferRide from "../pages/OfferRide/OfferRide";
import PrivacyPolicy from "../pages/PrivacyPolicy";
import Terms from "../pages/Terms";
import Help from "../pages/Help";
import Community from "../pages/Community";
import GoogleLogin from "../pages/LoginRegister/GoogleLogin";
import FindRides from "../pages/FindRides";
import ViewRideDetails from "../pages/ViewRideDetails";
import OfferedRides from "../pages/profile/rides/OfferedRides";
import ShowOfferedRideDetails from "../pages/profile/rides/ShowOfferedRideDetails";
import WalletPage from "../pages/profile/wallet/Wallet";
import Career from "../pages/Career";
import Press from "../pages/Press";
import Blog from "../pages/Blog";
import Parterns from "../pages/Parterns";
import Sustainability from "../pages/Sustainability";
import Support from "../pages/profile/Support";
import HowitWorks from "../pages/HowitWorks";
import Safety from "../pages/Safety";
import CookiesPolicy from "../pages/CookiesPolicy";
import ProtectUser from "../pages/LoginRegister/ProtectUser";
import VerifyEmail from "../pages/profile/VerifyEmail";
import VerifyPhone from "../pages/profile/VerifyPhone";
import Contact from "../pages/Contact";
import EditPreference from "../pages/profile/EditPreference";
import AddBio from "../pages/profile/AddBio";
import Referrals from "../pages/profile/Referrals";
import VerifyDrivingLicence from "../pages/profile/VerifyDrivingLicence";
import PaymentPage from "../pages/PaymentPage";
import PaymentSuccess from "../pages/PaymentSuccess";
import PaymentFailed from "../pages/PaymentFailed";
import Bookings from "../pages/profile/Bookings";
import KycVerification from "../pages/profile/KycVerification";

// New Epic Imports
import UserDashboard from "../pages/Dashboard/UserDashboard";
import MyParcels from "../pages/Parcel/MyParcels";
import SendParcel from "../pages/Parcel/SendParcel";
import ParcelDelivery from "../pages/Parcel/ParcelDelivery";
import Vehicles from "../pages/Vehicles";

const routes = createBrowserRouter([
  {
    path: "",
    element: <App />,
    children: [
      {
        path: "/",
        element: <Home />,
      },
      {
        path: "/about",
        element: <About />,
      },
      {
        path: "/careers",
        element: <Career />
      },
      {
        path: "/press",
        element: <Press />
      },
      {
        path: "/contact",
        element: <Contact />
      },
      {
        path: "/partners",
        element: <Parterns />
      },
      {
        path: "/blog",
        element: <Blog />
      },
      {
        path: "/sustainability",
        element: <Sustainability />
      },
      {
        path: "/register/:referalCode?",
        element: <Register />,
      },
      {
        path: "/login",
        element: <Login />,
      },
      {
        path: "/safety",
        element: <Safety />
      },
      {
        path: "/cookies",
        element: <CookiesPolicy />
      },
      {
        path: "/google-login",
        element: <GoogleLogin />
      },
      {
        path: "/offer-ride",
        element: <OfferRide />,
      },
      {
        path: "/privacy",
        element: <PrivacyPolicy />,
      },
      {
        path: "/terms",
        element: <Terms />,
      },
      {
        path: "/help",
        element: <Help />,
      },
      {
        path: "/community",
        element: <Community />,
      },
      {
        path: "/rides",
        element: <FindRides />,
      },
      {
        path: "/view-ride-details",
        element:  <ProtectUser><ViewRideDetails /></ProtectUser>,
      },
      {
        path: "/payment",
        element: <PaymentPage />,
      },
      {
        path: "/payment-success",
        element: <PaymentSuccess />,
      },
      {
        path: "/payment-failed",
        element: <PaymentFailed />,
      },
      {
        path: "/how-it-works",
        element: <HowitWorks />
      },
      {
        path: "/my-profile",
        element: <ProtectUser><MyProfile /></ProtectUser>,
        children: [
          {
            path: "/my-profile/",
            element: <PersonalDetails />,
          },
          {
            path: "/my-profile/edit-basic-details",
            element: <EditBasicDetails />,
          },
          {
            path: "/my-profile/upload-profile-pic",
            element: <UploadProfilePage />,
          },
          {
            path: "/my-profile/cars",
            element: <Cars />,
          },
          {
            path: "/my-profile/add-car",
            element: <AddCar />,
          },
          {
            path: "/my-profile/booking-history",
            element: <BookingHistory />,
          },
          {
            path: "/my-profile/offered-rides",
            element: <OfferedRides />,
          },
          {
            path: "/my-profile/show-offered-rides-details/:data",
            element: <ShowOfferedRideDetails />,
          },
          {
            path: "/my-profile/wallet",
            element: <WalletPage />,
          },
          {
            path: "/my-profile/support",
            element: <Support />
          },
          {
            path: "/my-profile/verify-email",
            element: <VerifyEmail />
          },
          {
            path: "/my-profile/verify-phone",
            element: <VerifyPhone />
          },
          {
            path : "/my-profile/edit-preferences",
            element : <EditPreference />
          },
          {
            path : "/my-profile/edit-bio",
            element : <AddBio />
          },
          {
            path : "/my-profile/referral",
            element : <Referrals />
          },
          {
            path : "/my-profile/verify-driving-license",
            element : <VerifyDrivingLicence />
          },
          {
            path : "/my-profile/bookings",
            element : <Bookings />
          },
          {
            path: "/my-profile/kyc",
            element: <KycVerification />
          }
        ],
      },
      {
        path: "/forgot-password",
        element: <ForgotPassword />,
      },
      {
        path: "/user/dashboard",
        element: <ProtectUser><UserDashboard /></ProtectUser>,
      },
      {
        path: "/user/my-parcels",
        element: <ProtectUser><MyParcels /></ProtectUser>,
      },
      {
        path: "/user/send-parcel",
        element: <ProtectUser><SendParcel /></ProtectUser>,
      },
      {
        path: "/user/parcel-delivery",
        element: <ProtectUser><ParcelDelivery /></ProtectUser>,
      },
      {
        path: "/vehicles",
        element: <Vehicles />,
      },
      {
        path: "*",
        element: <NotFound />,
      },
    ],
  },
]);

export default routes;
