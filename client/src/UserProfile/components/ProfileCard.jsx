import React from "react";
import { Spinner } from "react-bootstrap";
import CardUI from "../../UI/CardUI";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const ProfileCard = ({ user, loading, error }) => {
  // Show error toast if there's an error
  React.useEffect(() => {
    if (error) {
      toast.error(error.message || "Failed to load profile data", {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
    }
  }, [error]);

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: "200px" }}>
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="alert alert-warning">
        No user data available
      </div>
    );
  }

  return (
    <>
      <ToastContainer />
      <CardUI
        image={
          <img 
            src={user.image || "/default-profile.png"} 
            alt={user.name}
            className="img-fluid"
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover"
            }}
          />
        }
        width="100%"
        title={user.name}
        center={true}
        position={user.position}
        address={
          <>
            {user.email && <div className="mb-1">{user.email}</div>}
            {user.phone && <div className="mb-1">Phone: {user.phone}</div>}
            {user.dateOfBirth && (
              <div className="mb-1">
                DOB: {new Date(user.dateOfBirth).toLocaleDateString()}
              </div>
            )}
          </>
        }
        style={{ 
          border: "1px solid #dee2e6",
          borderRadius: "0.5rem",
          boxShadow: "0 0.5rem 1rem rgba(0, 0, 0, 0.15)"
        }}
      >
        {user.githubId && (
          <div className="mt-3">
            <strong>GitHub:</strong> {user.githubId}
          </div>
        )}
        {user.linkedInId && (
          <div className="mt-2">
            <strong>LinkedIn:</strong> {user.linkedInId}
          </div>
        )}
      </CardUI>
    </>
  );
};

export default ProfileCard;