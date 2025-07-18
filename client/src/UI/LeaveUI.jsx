import React from "react";
import { getLeaveData } from "../utils/leaveFunction";
import { userOnLeave } from "../utils/isOnLeave";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const LeaveUI = ({ employee = [], superuser }) => {
  let leaveUsers = [];
  
  try {
    leaveUsers = userOnLeave(employee);
  } catch (error) {
    console.error("Error in LeaveUI:", error);
    toast.error("Error loading leave data", {
      position: "top-right",
      autoClose: 3000
    });
  }

  const handleLeaveClick = () => {
    toast.info("Redirecting to leave approval page", {
      position: "top-right",
      autoClose: 2000,
    });
  };

  if (superuser) {
    return (
      <div className="container p-3 border rounded shadow-sm bg-white">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h5 className="mb-0 fw-bold">Pending Approval</h5>
          <Link 
            to={"/approve-leave"} 
            className="text-decoration-none"
            onClick={handleLeaveClick}
          >
            <span className="text-primary small fw-semibold">
              Leave Requests <i className="bi bi-chevron-right"></i>
            </span>
          </Link>
        </div>
        
        {employee.length === 0 ? (
          <div className="text-muted text-center py-2">No employees found</div>
        ) : (
          employee.map((emp) => {
            const leaveDays = getLeaveData(emp.leaveDates || []);
            if (leaveDays > 0) {
              return (
                <div 
                  key={emp._id}
                  className="d-flex justify-content-between align-items-center py-2 border-bottom"
                >
                  <span className="text-truncate" style={{ maxWidth: "150px" }}>
                    {emp.name}
                  </span>
                  <span className="badge bg-warning text-dark">
                    {leaveDays} day{leaveDays !== 1 ? 's' : ''}
                  </span>
                </div>
              );
            }
            return null;
          })
        )}
      </div>
    );
  }

  return (
    <div className="p-3 border rounded shadow-sm bg-white">
      <h5 className="mb-3 fw-bold">On Leave</h5>
      
      {leaveUsers.length === 0 ? (
        <div className="text-muted text-center py-2">No employees on leave</div>
      ) : (
        leaveUsers.map((user, index) => (
          <div 
            key={index} 
            className="d-flex justify-content-between align-items-center py-2 border-bottom"
          >
            <div className="text-truncate" style={{ width: "100px" }}>
              {user.name}
            </div>
            <div className="small text-muted">{user.startDate}</div>
            <i className="bi bi-arrow-right text-muted"></i>
            <div className="small text-muted">{user.endDate}</div>
          </div>
        ))
      )}
    </div>
  );
};

export default LeaveUI;