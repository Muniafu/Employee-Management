import React, { useContext, useEffect, useState } from "react";
import { Button } from "react-bootstrap";
import { Link } from "react-router-dom";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import EmpList from "../../User/components/EmpList";
import EmpTable from "../components/EmpTable";
import { AuthContext } from "../../Context/AuthContext";
import CardUI from "../../UI/CardUI";
import LeaveUI from "../../UI/LeaveUI";
import WelcomeUI from "../../UI/WelcomeUI";

const Dashboard = () => {
  const [employee, setEmployee] = useState([]);
  const [loading, setLoading] = useState(true);
  const authUser = useContext(AuthContext);

  useEffect(() => {
    const getEmployeeDetails = async () => {
      try {
        const response = await axios.get("/api/users");
        setEmployee(response.data.user);
      } catch (error) {
        toast.error("Failed to load employee data");
        console.error("Error fetching employees:", error);
      } finally {
        setLoading(false);
      }
    };

    const fetchUserData = async () => {
      try {
        await authUser.getUserData();
      } catch (error) {
        toast.error("Failed to load user data");
        console.error("Error fetching user data:", error);
      }
    };

    getEmployeeDetails();
    fetchUserData();
  }, [authUser]);

  if (loading || !authUser.currentUser) {
    return (
      <div className="d-flex justify-content-center align-items-center vh-100">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <>
      <ToastContainer position="top-right" autoClose={3000} />
      <div className="container-fluid mt-3">
        <div className="row">
          <div className="col-lg-8 col-md-12">
            <CardUI width="w-100">
              <WelcomeUI employee={authUser.currentUser} />
            </CardUI>
          </div>
          <div className="col-lg-4 col-md-12">
            <CardUI>
              <LeaveUI employee={employee} superuser={authUser.isSuperUser} />
            </CardUI>
          </div>
        </div>

        <div className="container-fluid">
          <div className="d-flex justify-content-end me-4 mb-3">
            {authUser.isSuperUser && (
              <Link to={"/signup"}>
                <Button variant="" className="custom-button bg-white mt-3">
                  + Add a New Employee
                </Button>
              </Link>
            )}
          </div>
          <div className="row">
            <div className="col-lg-4 col-md-5">
              <EmpTable employee={employee} />
            </div>
            <div className="col-lg-8 col-md-7">
              <EmpList employee={employee} />
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Dashboard;