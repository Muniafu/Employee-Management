import Sidebar from "./Sidebar";
import Navbar from "./Navbar";
import { Outlet } from "react-router-dom";

export default function Layout() {
  return (
    <div className="dashboard-container flex">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Navbar />
        <main className="dashboard-main p-6">
            <Outlet /> {/* Render nested routes here */}
        </main>
      </div>
    </div>
  );
}