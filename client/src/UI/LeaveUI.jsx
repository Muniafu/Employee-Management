import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { API } from "../../api/axios";

const LeaveUI = ({ employee = [], superuser }) => {
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchLeaves = async () => {
      try {
        setLoading(true);
        const response = await API.leave.getUserLeaves(employee._id);
        setLeaves(response.data.filter(leave => 
          new Date(leave.endDate) >= new Date() && 
          leave.status === 'approved'
        ));
      } catch (error) {
        console.error("Error loading leave data:", error);
        toast.error("Error loading leave data");
      } finally {
        setLoading(false);
      }
    };

    if (employee._id) fetchLeaves();
  }, [employee._id]);

  const handleLeaveClick = () => {
    toast.info("Redirecting to leave approval page");
  };

  if (superuser) {
    return (
      <div className="container p-3 border rounded shadow-sm bg-white">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h5 className="mb-0 fw-bold">Pending Approval</h5>
          <Link to="/approve-leave" className="text-decoration-none" onClick={handleLeaveClick}>
            <span className="text-primary small fw-semibold">
              Leave Requests <i className="bi bi-chevron-right"></i>
            </span>
          </Link>
        </div>
        
        {loading ? (
          <div className="text-center py-2">Loading...</div>
        ) : leaves.length === 0 ? (
          <div className="text-muted text-center py-2">No pending leaves</div>
        ) : (
          leaves.map((leave) => (
            <div key={leave._id} className="d-flex justify-content-between align-items-center py-2 border-bottom">
              <span className="text-truncate" style={{ maxWidth: "150px" }}>
                {leave.user.name}
              </span>
              <span className="badge bg-warning text-dark">
                {Math.ceil((new Date(leave.endDate) - new Date(leave.startDate)) / (1000 * 60 * 60 * 24))} days
              </span>
            </div>
          ))
        )}
      </div>
    );
  }

  return (
    <div className="p-3 border rounded shadow-sm bg-white">
      <h5 className="mb-3 fw-bold">On Leave</h5>
      
      {loading ? (
        <div className="text-center py-2">Loading...</div>
      ) : leaves.length === 0 ? (
        <div className="text-muted text-center py-2">No employees on leave</div>
      ) : (
        leaves.map((leave) => (
          <div key={leave._id} className="d-flex justify-content-between align-items-center py-2 border-bottom">
            <div className="text-truncate" style={{ width: "100px" }}>
              {leave.user.name}
            </div>
            <div className="small text-muted">{new Date(leave.startDate).toLocaleDateString()}</div>
            <i className="bi bi-arrow-right text-muted"></i>
            <div className="small text-muted">{new Date(leave.endDate).toLocaleDateString()}</div>
          </div>
        ))
      )}
    </div>
  );
};

export default LeaveUI;