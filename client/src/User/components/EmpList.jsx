import React from "react";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import CardUI from "../../UI/CardUI";

const EmpList = ({ employee }) => {
  const handleEmployeeClick = (empName) => {
    toast.info(`Viewing profile of ${empName}`, {
      position: "top-right",
      autoClose: 2000,
      className: 'bg-info text-white'
    });
  };

  if (!employee || employee.length === 0) {
    toast.warning("No employees found", {
      position: "top-right",
      autoClose: 3000,
      className: 'bg-warning text-dark'
    });
    return (
      <div className="alert alert-warning text-center">
        No employees available to display
      </div>
    );
  }

  return (
    <div className="row g-4 justify-content-center">
      {employee.map((emp) => (
        <div className="col-md-6 col-lg-4 col-xl-3" key={emp._id}>
          <Link
            to={`/profile/${emp._id}`}
            className="text-decoration-none"
            onClick={() => handleEmployeeClick(emp.name)}
          >
            <CardUI
              width="100%"
              title={emp.name}
              image={emp.image}
              position={emp.position}
              center={true}
              imgSize={50}
              className="h-100 shadow-sm"
            >
              <div className="text-center mt-2">
                <span className="badge bg-primary">
                  {emp.position || "Employee"}
                </span>
              </div>
            </CardUI>
          </Link>
        </div>
      ))}
    </div>
  );
};

export default EmpList;