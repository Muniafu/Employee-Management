// Dashboard/Employee/Components/ProfileOverview.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { 
  Card, 
  Button, 
  Spinner, 
  Badge, 
  Row, 
  Col,
  Image,
  Stack
} from 'react-bootstrap';
import { 
  Pencil, 
  Calendar, 
  ClockHistory,
  PersonLinesFill
} from 'react-bootstrap-icons';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import api, { API } from '../../../api/axios';
import useAuth from '../../../Context/useAuth';
import isOnLeave from '../../../utils/isOnLeave';
import PropTypes from 'prop-types';

const ProfileOverview = ({ onEditProfile, onLeaveRequest }) => {
  const { user } = useAuth();
  const [employeeData, setEmployeeData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [onLeave, setOnLeave] = useState(false);

  const fetchProfileData = useCallback(async () => {
    try {
      setLoading(true);
      const response = await api.get(`/employee/profile/${user?.id}`);
      setEmployeeData(response.data);
      setOnLeave(isOnLeave(response.data.leaveHistory));
    } catch (error) {
      console.error('Error fetching profile data:', error);
      toast.error('Failed to load profile data');
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    if (user?.id) {
      fetchProfileData();
    }
  }, [user?.id, fetchProfileData]);

  // ✅ Upload avatar
  const handleImageUpload = async (file) => {
    try {
      const formData = new FormData();
      formData.append('avatar', file);
      
      const response = await API.user.uploadAvatar(formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      setEmployeeData(prev => ({
        ...prev,
        image: response.data.imageUrl
      }));
      toast.success('Profile picture updated!');
    } catch (error) {
      toast.error(error.message || 'Failed to upload image');
    }
  };

  // ✅ Update profile
  const handleProfileUpdate = async (data) => {
    try {
      const formData = new FormData();
      formData.append('name', data.name);
      formData.append('position', data.position);
      if (data.image) {
        formData.append('image', data.image);
      }
      
      await API.user.updateProfile(user.id, formData);
      toast.success('Profile updated!');
    } catch (error) {
      toast.error(error.message || 'Profile update failed');
    }
  };

  if (loading) {
    return (
      <Card className="shadow-sm h-100">
        <Card.Body className="text-center">
          <Spinner animation="border" variant="primary" />
          <p className="mt-2 mb-0">Loading profile...</p>
        </Card.Body>
      </Card>
    );
  }

  return (
    <Card className="shadow-sm h-100">
      <Card.Body>
        {/* Profile Header */}
        <div className="d-flex justify-content-between align-items-start mb-4">
          <div className="d-flex align-items-center gap-3">
            <Image
              src={employeeData?.image || '/default-avatar.png'}
              alt={employeeData?.name || 'Profile'}
              roundedCircle
              width={80}
              height={80}
              className="border border-2 border-primary"
            />
            <div>
              <h4 className="mb-1">{employeeData?.name || 'N/A'}</h4>
              <p className="text-muted mb-1">{employeeData?.position || 'N/A'}</p>
              <Badge bg={onLeave ? 'danger' : 'success'}>
                {onLeave ? 'On Leave' : 'Active'}
              </Badge>
            </div>
          </div>
          
          <Button 
            variant="outline-primary" 
            size="sm"
            onClick={() => onEditProfile({
              handleImageUpload,
              handleProfileUpdate
            })}
          >
            <Pencil className="me-1" size={14} />
            Edit
          </Button>
        </div>

        {/* Stats Row */}
        <Row className="g-3 mb-4">
          <Col md={4}>
            <Card bg="light" text="dark" className="text-center h-100">
              <Card.Body>
                <h3 className="mb-0">{employeeData?.totalLeaves || 0}</h3>
                <small className="text-muted">Total Leaves</small>
              </Card.Body>
            </Card>
          </Col>
          <Col md={4}>
            <Card bg="light" text="dark" className="text-center h-100">
              <Card.Body>
                <h3 className="mb-0">{employeeData?.acceptedLeaves || 0}</h3>
                <small className="text-muted">Approved</small>
              </Card.Body>
            </Card>
          </Col>
          <Col md={4}>
            <Card bg="light" text="dark" className="text-center h-100">
              <Card.Body>
                <h3 className="mb-0">{employeeData?.pendingLeaves || 0}</h3>
                <small className="text-muted">Pending</small>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* Quick Actions */}
        <div>
          <h5 className="mb-3">Quick Actions</h5>
          <Stack gap={2}>
            <Button 
              variant="outline-primary" 
              className="d-flex align-items-center justify-content-start gap-2"
              onClick={onLeaveRequest}
            >
              <Calendar size={16} />
              Apply for Leave
            </Button>
            <Button 
              variant="outline-secondary" 
              className="d-flex align-items-center justify-content-start gap-2"
            >
              <ClockHistory size={16} />
              View Attendance
            </Button>
            <Button 
              variant="outline-info" 
              className="d-flex align-items-center justify-content-start gap-2"
              onClick={() => handleProfileUpdate(employeeData)}
            >
              <PersonLinesFill size={16} />
              Update Contact Info
            </Button>
          </Stack>
        </div>
      </Card.Body>
    </Card>
  );
};

ProfileOverview.propTypes = {
  onEditProfile: PropTypes.func.isRequired,
  onLeaveRequest: PropTypes.func.isRequired
};

export default ProfileOverview;