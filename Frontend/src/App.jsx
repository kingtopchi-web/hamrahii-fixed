// import { Outlet } from 'react-router-dom'
// import './App.css'
// import Navbar from './components/Navbar/Navbar'
// import Footer from './components/Footer/Footer'

// function App() {

//   return (
//     <>
//       <Navbar />
//         <main>
//           <Outlet />
//         </main>
//         <Footer />
//     </>
//   )
// }

// export default App

import { useEffect } from "react";
import { Outlet, useLocation, useSearchParams } from "react-router-dom";
import "./App.css";
import Navbar from "./components/Navbar/Navbar";
import Footer from "./components/Footer/Footer";
import { ToastContainer } from "react-toastify";
import GlobalParcelTracking from "./components/Tracking/GlobalParcelTracking";

function App() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: "smooth", // use "smooth" if you want animation
    });
  }, [pathname]);

  return (
    <>
      <ToastContainer />
      <Navbar />
      <div id="smooth-wrapper">
        <div id="smooth-content">
          <main>
            <Outlet />
          </main>
          <Footer />
          <GlobalParcelTracking />
        </div>
      </div>
    </>
  ); 
}

export default App;
