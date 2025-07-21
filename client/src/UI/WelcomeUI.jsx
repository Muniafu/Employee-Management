import React, { useEffect } from "react";
import img from "../assets/dashboard-img.png";
import { toast } from "react-toastify";

const WelcomeUI = ({ employee }) => {
  useEffect(() => {
    if (!employee) return;

    // Set a greeting based on the time of day
    const timeNow = new Date().getHours();
    const greeting =
      timeNow >= 5 && timeNow < 12
        ? "Good Morning"
        : timeNow >= 12 && timeNow < 18
        ? "Good Afternoon"
        : "Good Evening";

    // Show greeting toast with different styles based on time of day
    toast.dismiss();
    toast(
      <div className="text-center">
        <h5 className="mb-1">{greeting}, {employee?.name}!</h5>
        <p className="small mb-0">Have a wonderful day at work</p>
      </div>, 
      {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        className: timeNow >= 5 && timeNow < 12 
          ? "bg-info text-white" 
          : timeNow >= 12 && timeNow < 18 
            ? "bg-warning text-dark" 
            : "bg-dark text-white",
      }
    );
  }, [employee]);

  const getGreetings = () => {
    const timeNow = new Date().getHours();
    return timeNow >= 5 && timeNow < 12
      ? "Good Morning"
      : timeNow >= 12 && timeNow < 18
        ? "Good Afternoon"
        : "Good Evening";
  };

  return (
    <div className="row align-items-center p-4 bg-light rounded-3 shadow-sm">
      <div className="col-md-7">
        {employee && (
          <h3 className="mb-3">
            Hello, <span className="fw-bold text-primary">{employee.name}</span>
          </h3>
        )}
        <h2 className="display-6 mb-2 text-muted">{getGreetings()}!</h2>
        <h6 className="text-secondary">Have a Productive Day!</h6>
      </div>
      <div className="col-md-5 text-end">
        <img 
          src={img} 
          className="img-fluid rounded-3" 
          alt="dashboard" 
          style={{ maxHeight: "150px" }}
        />
      </div>
    </div>
  );
};

export default WelcomeUI;