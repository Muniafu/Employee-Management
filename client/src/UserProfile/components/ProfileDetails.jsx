import React from "react";
import { ListGroup, Spinner, Card } from "react-bootstrap";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import CardUI from "../../UI/CardUI";
import ChartUI from "../../UI/ChartUI";
import { getIcon } from "../../utils/getIcon";

const ListGroupItem = ({ title, value }) => {
  return (
    <ListGroup.Item className="py-3">
      <div className="d-flex justify-content-between align-items-center">
        <span className="fw-bold text-primary">{title}</span>
        <span className="text-muted">{value || "Not provided"}</span>
      </div>
    </ListGroup.Item>
  );
};

const ProfileDetails = ({ user, loading, error }) => {
  // Show error toast if there's an error
  React.useEffect(() => {
    if (error) {
      toast.error(error.message || "Failed to load profile details", {
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
      <div className="d-flex justify-content-center align-items-center" style={{ height: "300px" }}>
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
      </div>
    );
  }

  if (!user) {
    return (
      <Card className="text-center p-4">
        <Card.Body>
          <Card.Text>No user data available</Card.Text>
        </Card.Body>
      </Card>
    );
  }

  return (
    <>
      <ToastContainer />
      <CardUI width="100%">
        <h3 className="text-center mb-4">
          {getIcon("user", { className: "me-2" })}
          Personal Details
        </h3>
        
        <ListGroup variant="flush" className="mb-4">
          <ListGroupItem title="Full Name" value={user.name} />
          <ListGroupItem title="Position" value={user.position} />
          <ListGroupItem 
            title="Date of Birth" 
            value={user.dateOfBirth ? new Date(user.dateOfBirth).toLocaleDateString() : "Not provided"} 
          />
          <ListGroupItem title="Email" value={user.email} />
          <ListGroupItem title="Phone" value={user.phone} />
          {user.githubId && <ListGroupItem title="GitHub" value={user.githubId} />}
          {user.linkedInId && <ListGroupItem title="LinkedIn" value={user.linkedInId} />}
        </ListGroup>

        {user.leaveDates && user.leaveDates.length > 0 && (
          <div className="mt-4">
            <h4 className="text-center mb-3">Leave History</h4>
            <ChartUI leaves={user.leaveDates} />
          </div>
        )}
      </CardUI>
    </>
  );
};

export default ProfileDetails;