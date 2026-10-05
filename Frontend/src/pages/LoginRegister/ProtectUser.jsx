import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import Axios from "../../services/axios";
import { api } from "../../services/endpoints";
import { setUserDetails } from "../../store/userReducer";
import { useNavigate } from "react-router-dom";

const ProtectUser = ({ children }) => {
  const user = useSelector((state) => state.user);
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate()
  const handleGetUserDetails = async () => {
    try {
      setLoading(true);
      const res = await Axios.post(api.user.getFullDetails);
      // console.log(res, "this is response");
      if (res?.data?.success) {
        dispatch(setUserDetails(res?.data?.user));
      }
      setLoading(false);
    } catch (error) {
      setLoading(false);
      navigate("/login")
      // console.log("Error fetching user details:", error);
    }
  };

  useEffect(() => {
    if (user?.phone) return;
    else handleGetUserDetails();
  }, [user]);

  if(loading) return (
   <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="bg-[#F7F7F7] rounded-xl p-4 animate-pulse">
                    <div className="h-6 bg-gray-300 rounded w-1/3 mb-3"></div>
                    <div className="h-4 bg-gray-300 rounded w-2/3"></div>
                  </div>
                ))}
              </div>
  )

  return children;
};

export default ProtectUser;
