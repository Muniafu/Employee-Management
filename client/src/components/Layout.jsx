import Sidebar from "./Sidebar";
import Navbar from "./Navbar";
import { Outlet } from "react-router-dom";

export default function Layout() {
  return (
    <div className="container-fluid min-vh-100 bg-light">
      <div className="row flex-nowrap">
        {/* Sidebar */}
        <aside
          className="col-auto col-md-3 col-lg-2 d-flex flex-column bg-dark text-white p-0 shadow-sm"
          role="complementary"
        >
          <Sidebar />
        </aside>

        {/* Main Content */}
        <div className="col px-0 d-flex flex-column">
          {/* Navbar */}
          <header
            className="bg-primary text-white py-2 px-3 shadow-sm"
            role="banner"
          >
            <Navbar />
          </header>

          {/* Dashboard Main */}
          <main
            className="flex-grow-1 p-4 overflow-auto"
            role="main"
            aria-label="Main content area"
          >
            <div className="card border-0 shadow-sm rounded-3 p-4 bg-white">
              <Outlet /> {/* Render nested routes */}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}