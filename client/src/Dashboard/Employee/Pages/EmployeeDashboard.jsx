import React, { useState, useEffect, useContext } from 'react';
import { Container, Row, Col, Button, Spinner } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import EmployeeNav from '../../../Navigation/EmployeeNav';
import ProfileOverview from '../Components/ProfileOverview';
import LeaveChart from '../Components/LeaveChart';
import SocialProfiles from '../Components/SocialProfiles';
import CardUI from '../../../UI/CardUI';
import AuthContext from '../../../Context/AuthContext';
import { API } from '../../../api/axios';

const EmployeeDashboard = () => {
  const { user } = useContext(AuthContext);
  const [leaveStats, setLeaveStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const statsResponse = await Promise.all([
          API.leave.getUserLeaves(user._id),
          API.leave.getStats(user._id)
        ]);
        
        setLeaveStats({
          ...statsResponse.data,
          remaining: user.leaveBalance
        });
      } catch (error) {
        console.error('Error fetching leave stats:', error);
        toast.error('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };

    if (user?._id) fetchData();
  }, [user]);

  const handleRequestLeave = () => {
    navigate('/employee/leave-request');
  };

  if (loading || !user) {
    return (
      <div className="d-flex justify-content-center align-items-center vh-100">
        <Spinner animation="border" variant="primary" />
      </div>
    );
  }

  return (
    <>
      <EmployeeNav />
      <Container fluid className="mt-4">
        <Row className="mb-4">
          <Col className="text-end">
            <Button variant="primary" onClick={handleRequestLeave}>
              <i className="bi bi-plus-circle me-2"></i>Request Leave
            </Button>
          </Col>
        </Row>

        <Row className="mb-4">
          <Col lg={5} md={12} className="mb-3 mb-lg-0">
            <CardUI>
              <ProfileOverview employee={user} />
            </CardUI>
          </Col>

          <Col lg={7} md={12}>
            <CardUI>
              <LeaveChart stats={leaveStats} />
            </CardUI>
          </Col>
        </Row>

        <Row>
          <Col lg={4} md={6} className="mb-3 mb-md-0">
            <CardUI>
              <SocialProfiles employee={user} />
            </CardUI>
          </Col>
        </Row>
      </Container>
    </>
  );
};

export default EmployeeDashboard;