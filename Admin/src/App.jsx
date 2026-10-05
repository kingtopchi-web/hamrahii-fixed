import { Outlet } from "react-router-dom"
  import { ToastContainer, toast } from 'react-toastify';
function App() {

  return (
    <>
        <main>
          <Outlet />
          <ToastContainer />
        </main>
    </>
  )
}

export default App
