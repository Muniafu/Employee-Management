import React, { useContext, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { AuthContext } from "../../Context/AuthContext";
import { Button, Dropdown, Table, Spinner } from "react-bootstrap";
import { AiFillFilter } from "react-icons/ai";
import { GrClear } from "react-icons/gr";

const AllLeaves = () => {
  const auth = useContext(AuthContext);
  const [sortedLeaves, setSortedLeaves] = useState([]);
  const [loading, setLoading] = useState(true);

  const getLeaveStatus = (status) => {
    switch (status) {
      case "rejected":
        return <span className="badge bg-danger">Rejected</span>;
      case "approved":
        return <span className="badge bg-success">Approved</span>;
      default:
        return <span className="badge bg-warning text-dark">Pending</span>;
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        await auth.getUserData();
        setLoading(false);
      } catch (error) {
        toast.error(`Failed to load leave data: ${error.message}`, {
          position: "top-right",
          autoClose: 3000
        });
        console.error("Error fetching leave data:", error);
        setLoading(false);
      }
    };

    fetchData();
  }, [auth]);

  useEffect(() => {
    if (auth.currentUser?.leaveDates) {
      setSortedLeaves(auth.currentUser.leaveDates);
    }
  }, [auth.currentUser]);

  const filterLeaveData = (status) => {
    if (!auth.currentUser?.leaveDates) {
      toast.warning("No leave data available", {
        position: "top-right",
        autoClose: 2000
      });
      return;
    }

    let filteredData = [];
    let message = "";
    
    switch (status) {
      case "approved":
        filteredData = auth.currentUser.leaveDates.filter(
          (data) => data.status === "approved"
        );
        message = `Showing ${filteredData.length} approved leaves`;
        break;
      case "rejected":
        filteredData = auth.currentUser.leaveDates.filter(
          (data) => data.status === "rejected"
        );
        message = `Showing ${filteredData.length} rejected leaves`;
        break;
      case "pending":
        filteredData = auth.currentUser.leaveDates.filter(
          (data) => data.status === "pending"
        );
        message = `Showing ${filteredData.length} pending leaves`;
        break;
      default:
        filteredData = auth.currentUser.leaveDates;
        message = "Showing all leaves";
        break;
    }
    
    setSortedLeaves(filteredData);
    toast.info(message, {
      position: "top-right",
      autoClose: 2000
    });
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center vh-100">
        <Spinner animation="border" variant="primary" />
      </div>
    );
  }

  return (
    <div className="container py-4">
      <ToastContainer position="top-right" autoClose={3000} />
      
      <div className="text-center mb-4">
        <h2 className="fw-bold">Leave Status and History</h2>
      </div>

      <div className="d-flex justify-content-between mb-4">
        <div className="d-flex gap-3">
          <Button
            variant="outline-secondary"
            onClick={() => filterLeaveData("all")}
            className="d-flex align-items-center"
          >
            <GrClear className="me-2" />
            Clear Filters
          </Button>
          
          <Dropdown>
            <Dropdown.Toggle variant="outline-primary" className="d-flex align-items-center">
              <AiFillFilter className="me-2" />
              Filter
            </Dropdown.Toggle>
            <Dropdown.Menu>
              <Dropdown.Item onClick={() => filterLeaveData("approved")}>
                Approved
              </Dropdown.Item>
              <Dropdown.Item onClick={() => filterLeaveData("rejected")}>
                Rejected
              </Dropdown.Item>
              <Dropdown.Item onClick={() => filterLeaveData("pending")}>
                Pending
              </Dropdown.Item>
            </Dropdown.Menu>
          </Dropdown>
        </div>

        <Link to={`/ask-for-leave/${auth.userId}`}>
          <Button variant="primary" className="px-4">
            + Request Leave
          </Button>
        </Link>
      </div>

      <div className="card shadow-sm">
        <Table striped bordered hover responsive className="mb-0">
          <thead className="table-dark">
            <tr>
              <th>#</th>
              <th>Start Date</th>
              <th>End Date</th>
              <th>Days</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {sortedLeaves.length > 0 ? (
              sortedLeaves.map((leave, index) => (
                <tr key={leave._id || index}>
                  <td>{index + 1}</td>
                  <td>{new Date(leave.startDate).toLocaleDateString()}</td>
                  <td>{new Date(leave.endDate).toLocaleDateString()}</td>
                  <td>{leave.days}</td>
                  <td>{getLeaveStatus(leave.status)}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" className="text-center py-4 text-muted">
                  No leave records found
                </td>
              </tr>
            )}
          </tbody>
        </Table>
      </div>
    </div>
  );
};

export default AllLeaves;