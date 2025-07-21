// Dashboard/Employee/Components/SocialProfiles.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { 
  Card, 
  ListGroup, 
  Button, 
  Spinner,
  Badge
} from 'react-bootstrap';
import { 
  Envelope, 
  Linkedin, 
  Github, 
  Telephone, 
  Calendar,
  Pencil
} from 'react-bootstrap-icons';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import api from '../../../api/axios';
import useAuth from '../../../Context/useAuth';
import PropTypes from 'prop-types';

const SocialProfiles = ({ onEditClick }) => {
  const { user } = useAuth();
  const [socialData, setSocialData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchSocialData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get(`/employee/social-profiles/${user?.id}`);
      setSocialData(response.data);
    } catch (error) {
      console.error('Error fetching social profiles:', error);
      setError('Failed to load social profiles');
      toast.error('Failed to load social profiles', {
        position: 'top-right',
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: 'colored',
      });
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    if (user?.id) {
      fetchSocialData();
    }
  }, [user?.id, fetchSocialData]);

  const renderSocialItem = (icon, label, value, isLink = false) => {
    if (!value) return null;

    return (
      <ListGroup.Item className="d-flex align-items-center">
        <div className="me-3" style={{ width: '24px' }}>
          {icon}
        </div>
        <div className="flex-grow-1">
          <small className="text-muted d-block">{label}</small>
          {isLink ? (
            <a 
              href={value} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-decoration-none"
            >
              {value.includes('@') ? value : 'View Profile'}
            </a>
          ) : (
            <span>{value}</span>
          )}
        </div>
      </ListGroup.Item>
    );
  };

  if (loading) {
    return (
      <Card className="shadow-sm h-100">
        <Card.Body className="text-center">
          <Spinner animation="border" variant="primary" />
          <p className="mt-2 mb-0">Loading social profiles...</p>
        </Card.Body>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="shadow-sm h-100">
        <Card.Body className="text-center text-danger">
          {error}
          <Button 
            variant="link" 
            onClick={fetchSocialData}
            className="mt-2"
          >
            Retry
          </Button>
        </Card.Body>
      </Card>
    );
  }

  return (
    <Card className="shadow-sm h-100">
      <Card.Header className="d-flex justify-content-between align-items-center">
        <Card.Title as="h5" className="mb-0">Social Profiles</Card.Title>
        <Badge bg="light" text="dark">
          {socialData?.connections || 0} Connections
        </Badge>
      </Card.Header>
      
      <Card.Body>
        <ListGroup variant="flush">
          {/* Email */}
          {renderSocialItem(
            <Envelope className="text-primary" />,
            'Email',
            socialData?.email
          )}

          {/* LinkedIn */}
          {renderSocialItem(
            <Linkedin className="text-linkedin" />,
            'LinkedIn',
            socialData?.linkedin,
            true
          )}

          {/* GitHub */}
          {renderSocialItem(
            <Github className="text-dark" />,
            'GitHub',
            socialData?.github,
            true
          )}

          {/* Phone */}
          {renderSocialItem(
            <Telephone className="text-success" />,
            'Phone',
            socialData?.phone
          )}

          {/* Joining Date */}
          <ListGroup.Item className="d-flex align-items-center">
            <div className="me-3" style={{ width: '24px' }}>
              <Calendar className="text-purple" />
            </div>
            <div className="flex-grow-1">
              <small className="text-muted d-block">Joining Date</small>
              <span>
                {socialData?.joiningDate ? 
                  new Date(socialData.joiningDate).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  }) : 
                  'N/A'
                }
              </span>
            </div>
          </ListGroup.Item>
        </ListGroup>
      </Card.Body>

      <Card.Footer className="bg-white">
        <Button 
          variant="outline-secondary" 
          className="w-100"
          onClick={onEditClick}
        >
          <Pencil className="me-2" size={14} />
          Edit Social Profiles
        </Button>
      </Card.Footer>
    </Card>
  );
};

SocialProfiles.propTypes = {
  onEditClick: PropTypes.func.isRequired
};

export default SocialProfiles;