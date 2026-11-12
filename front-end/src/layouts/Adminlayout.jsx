// ClientLayout.js
import Sidebar from "../components/Admin/ddcon/Sidebar";
import { Outlet } from "react-router-dom";



const AdminLayout = () => {
  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      <Sidebar />
      <main className="main-content">
        <Outlet />
      </main>
    </div>
  );
};


export default AdminLayout;
