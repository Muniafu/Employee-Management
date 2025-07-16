import React, { useEffect } from "react";
import { ListGroup, Spinner } from "react-bootstrap";
import { toast } from "react-toastify";
import CardUI from "../../UI/CardUI";
import getIcon from "../../utils/getIcon";

const ListGroupItem = ({ icon, title, value }) => {
  return (
    <ListGroup.Item className="py-3">
      <div className="d-flex justify-content-between align-items-center">
        <span className="fw-bold text-primary">
          {getIcon(icon, { className: "me-2" })}
          {title}
        </span>
        <span className="text-muted">{value || "Not provided"}</span>
      </div>
    </ListGroup.Item>
  );
};

const ProfileLinks = ({ user, loading, error }) => {
  // Show error toast if there's an error
  useEffect(() => {
    if (error) {
      toast.error(error.message || "Failed to load profile links", {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        style: {
          background: '#f8f9fa',
          color: '#212529',
          borderRadius: '8px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
          borderLeft: '4px solid #dc3545'
        }
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
      <CardUI>
        <div className="alert alert-warning mb-0">No user data available</div>
      </CardUI>
    );
  }

  return (
    <CardUI width="100%">
      <h3 className="text-center mb-4">
        {getIcon("share-alt", { className: "me-2" })}
        Social Profiles
      </h3>
      
      <ListGroup variant="flush">
        <ListGroupItem 
          icon="envelope" 
          title="Email" 
          value={user.email} 
        />
        <ListGroupItem 
          icon="linkedin" 
          title="LinkedIn" 
          value={user.linkedInId} 
        />
        <ListGroupItem 
          icon="github" 
          title="GitHub" 
          value={user.githubId} 
        />
        <ListGroupItem 
          icon="calendar-day" 
          title="Joining Date" 
          value={user.joiningDate ? new Date(user.joiningDate).toLocaleDateString() : "Not available"} 
        />
        <ListGroupItem 
          icon="phone" 
          title="Phone Number" 
          value={user.phone} 
        />
      </ListGroup>
    </CardUI>
  );
};

export default ProfileLinks;