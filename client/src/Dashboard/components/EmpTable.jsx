import React from "react";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const EmpTable = ({ employee }) => {
  const handleRowClick = (emp) => {
    toast.info(`Viewing details for ${emp.name}`, {
      position: "top-right",
      autoClose: 2000,
      className: 'bg-info text-white'
    });
  };

  if (!employee || employee.length === 0) {
    toast.warning("No employee data available", {
      position: "top-right",
      autoClose: 3000,
      className: 'bg-warning text-dark'
    });
    return (
      <div className="alert alert-info text-center my-4">
        No employees found in the database
      </div>
    );
  }

  return (
    <div className="card shadow-sm border-0">
      <div className="card-body p-0">
        <div className="table-responsive">
          <table className="table table-hover mb-0">
            <thead className="table-dark">
              <tr>
                <th scope="col" className="ps-4">Name</th>
                <th scope="col">Position</th>
                <th scope="col">Email</th>
              </tr>
            </thead>
            <tbody>
              {employee.map((emp) => (
                <tr 
                  key={emp.email}
                  onClick={() => handleRowClick(emp)}
                  style={{ cursor: 'pointer' }}
                  className="align-middle"
                >
                  <td className="fw-bold ps-4">{emp.name}</td>
                  <td>
                    <span className="badge bg-primary">
                      {emp.position}
                    </span>
                  </td>
                  <td>
                    <a 
                      href={`mailto:${emp.email}`} 
                      className="text-decoration-none"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {emp.email}
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default EmpTable;