import { Children } from "react";
import App from "../App";
import Login from "../pages/Login";
import { createBrowserRouter } from "react-router-dom";
import Admin from "../pages/Admin/Admin";
import OverView from "../pages/Admin/OverView";
import Analytics from "../pages/Admin/Analytics";
import ProtectAdmin from "../pages/Admin/ProtectAdmin";
import AdminUsersPage from "../pages/Admin/users/AdminUsersPage";
import AdminUserDetails from "../pages/Admin/users/AdminUserDetails";
import Rides from "../pages/Admin/Rides";
import Message from "../pages/Admin/Message";
import BroadCast from "../pages/Admin/BroadCast";
import Cars from "../pages/Admin/Cars";
import AdminBlog from "../pages/Admin/AdminBlog";
import ShowBlog from "../pages/Admin/ShowBlog";
import VehicleType from "../pages/Admin/VehicleType";
import ShowVehicleType from "../pages/Admin/ShowVehicleType";
import PricingSlabsVehicleType from "../pages/Admin/PricingSlabsVehicleType";
import Banner from "../pages/Admin/Banner/Banner";
import CreateBanner from "../pages/Admin/Banner/CreateBanner";
import Commisions from "../pages/Admin/Commisions";
import Parcels from "../pages/Admin/Parcels";
import ParcelSlabs from "../pages/Admin/ParcelSlabs";

const routes = createBrowserRouter([
  {
    path: "",
    element: <App />,
    children: [
      {
        path: "/",
        element: <Login />,
      },
      {
        path: "/login",
        element: <Login />,
      },
      {
        path: "/admin",
        element: (
          <ProtectAdmin>
            {" "}
            <Admin />{" "}
          </ProtectAdmin>
        ),
        children: [
          {
            path: "/admin/",
            element: <OverView />,
          },
          {
            path: "/admin/analytics",
            element: <Analytics />,
          },
          {
            path: "/admin/users",
            element: <AdminUsersPage />,
          },
          {
            path: "/admin/users-details",
            element: <AdminUserDetails />,
          },
          {
            path: "/admin/rides",
            element: <Rides />,
          },
          {
            path: "/admin/messages",
            element: <Message />,
          },
          {
            path: "/admin/broadcast",
            element: <BroadCast />,
          },
          {
            path: "/admin/cars",
            element: <Cars />,
          },
          {
            path: "/admin/blog",
            element: <AdminBlog />,
          },
          {
            path: "/admin/show-blog",
            element: <ShowBlog />,
          },
          {
            path: "/admin/create-vehicle-type",
            element: <VehicleType />,
          },
          {
            path: "/admin/show-vehicle-type",
            element: <ShowVehicleType />,
          },
          {
            path: "/admin/add-pricing-slabs-vehicly-type",
            element: <PricingSlabsVehicleType />,
          },
          {
            path : "/admin/banner",
            element : <Banner />
          },
          {
            path : "/admin/create-banner",
            element : <CreateBanner />
          },
          {
            path : "/admin/commisions",
            element : <Commisions />
          },
          {
            path : "/admin/parcels",
            element : <Parcels />
          },
          {
            path : "/admin/parcel-slabs",
            element : <ParcelSlabs />
          },
        ],
      },
    ],
  },
]);

export default routes;
