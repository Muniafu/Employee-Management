import React, { useContext, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Button, Container, Row, Col, Spinner } from "react-bootstrap";
import { toast, ToastContainer } from "react-toastify";
import axios from "axios";

import { AuthContext } from "../../Context/AuthContext";
import ProfileCard from "../../UserProfile/components/ProfileCard";
import ProfileDetails from "../../UserProfile/components/ProfileDetails";
import ProfileLinks from "../../UserProfile/components/ProfileLinks";
import EditEmployee from "../../User/pages/EditEmployee";
import getIcon from "../../utils/getIcon";

const Profile = () => {
  const auth = useContext(AuthContext);
  const { uid } = useParams();
  const [editMode, setEditMode] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const toggleEditMode = () => {
    setEditMode(!editMode);
  };

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await axios.get(`/api/users/${uid}`, {
          headers: { 
            Authorization: `Bearer ${auth.token}` 
          }
        });
        setSelectedUser(response.data.user);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load user data");
        toast.error(err.response?.data?.message || "Failed to load user data", {
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
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [uid, auth.token, editMode]);

  if (editMode) {
    return <EditEmployee changeMode={toggleEditMode} />;
  }

  if (loading) {
    return (
      <Container className="d-flex justify-content-center align-items-center" style={{ height: "100vh" }}>
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
      </Container>
    );
  }

  if (!selectedUser) {
    return (
      <Container className="my-5">
        <div className="alert alert-danger">
          {error || "User data not available"}
        </div>
      </Container>
    );
  }

  const canEdit = auth.isSuperUser || auth.userId === selectedUser._id;

  return (
    <Container className="my-5">
      <ToastContainer />
      
      {/* Edit Button (conditionally rendered) */}
      {canEdit && (
        <div className="text-end mb-3">
          <Button 
            variant="primary" 
            onClick={toggleEditMode}
            className="d-flex align-items-center gap-2"
          >
            {getIcon("edit")} Edit Profile
          </Button>
        </div>
      )}

      <Row className="g-4">
        {/* Left Column - Profile Card and Links */}
        <Col lg={4}>
          <div className="mb-4">
            <ProfileCard 
              user={selectedUser} 
              loading={loading} 
              error={error} 
            />
          </div>
          <div className="mb-4">
            <ProfileLinks 
              user={selectedUser} 
              loading={loading} 
              error={error} 
            />
          </div>
        </Col>

        {/* Right Column - Profile Details */}
        <Col lg={8}>
          <ProfileDetails 
            user={selectedUser} 
            loading={loading} 
            error={error} 
          />
        </Col>
      </Row>
    </Container>
  );
};

export default Profile;