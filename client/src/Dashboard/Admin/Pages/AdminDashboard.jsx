import React, { useState, useEffect, useContext } from 'react';
import { Button, Container, Row, Col, Spinner } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import AdminNav from '../../../Navigation/AdminNav';
import WelcomeUI from '../../../UI/WelcomeUI';
import LeaveApprovalGrid from '../Components/LeaveApprovalGrid';
import EmployeeGrid from '../Components/EmployeeGrid';
import AddEmployee from '../Components/AddEmployee';
import AuthContext from '../../../Context/AuthContext';
import CardUI from "../../../UI/CardUI";
import { API } from '../../../api/axios';

const AdminDashboard = () => {
  const { user, isAdmin, isLoading } = useContext(AuthContext);
  const [employees, setEmployees] = useState([]);
  const [pendingLeaves, setPendingLeaves] = useState([]);
  const [showAddEmployeeModal, setShowAddEmployeeModal] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const navigate = useNavigate();

  // Fetch all required data for admin dashboard
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setIsFetching(true);
        
        // Fetch employees
        const empResponse = await API.admin.getEmployees();
        setEmployees(empResponse.data);
        
        // Fetch pending leaves if admin
        if (isAdmin) {
          const leavesResponse = await API.admin.getPendingLeaves();
          setPendingLeaves(leavesResponse.data);
        }
        
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        toast.error('Failed to load dashboard data');
      } finally {
        setIsFetching(false);
      }
    };

    fetchDashboardData();
    
    // Set up periodic refresh
    const interval = setInterval(fetchDashboardData, 30000);
    return () => clearInterval(interval);
  }, [isAdmin]);

  const handleLeaveApproval = async (leaveId, action) => {
    try {
      await API.leave.updateStatus(leaveId, { status: action });
      setPendingLeaves(pendingLeaves.filter(leave => leave.id !== leaveId));
      toast.success(`Leave ${action === 'approve' ? 'approved' : 'rejected'} successfully`);
    } catch (error) {
      console.error('Error processing leave:', error);
      toast.error(`Failed to ${action} leave`);
    }
  };

  const handleAddEmployee = async () => {
    setShowAddEmployeeModal(true);
  };

  if (isLoading || isFetching || !user) {
    return (
      <div className="d-flex justify-content-center align-items-center vh-100">
        <Spinner animation="border" variant="primary" />
      </div>
    );
  }

  if (!isAdmin) {
    navigate('/unauthorized');
    return null;
  }

  return (
    <>
      <ToastContainer position="top-right" autoClose={5000} />
      <AdminNav />
      
      <Container fluid className="mt-4">
        <Row className="mb-4">
          <Col lg={8} md={12} className="mb-3 mb-md-0">
            <CardUI>
              <WelcomeUI employee={user} />
            </CardUI>
          </Col>
          <Col lg={4} md={12}>
            <CardUI>
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h5 className="mb-0">Pending Approvals</h5>
                <Button 
                  variant="primary" 
                  size="sm"
                  onClick={() => navigate('/admin/leaves')}
                >
                  View All
                </Button>
              </div>
              <LeaveApprovalGrid 
                leaves={pendingLeaves} 
                onApprove={handleLeaveApproval} 
              />
            </CardUI>
          </Col>
        </Row>

        <Row className="mb-4">
          <Col className="text-end">
            <Button
              variant="success"
              onClick={() => setShowAddEmployeeModal(true)}
              className="me-2"
            >
              <i className="bi bi-plus-lg me-2"></i>Add Employee
            </Button>
            <Link to="/admin/reports" className="btn btn-info">
              <i className="bi bi-graph-up me-2"></i>View Reports
            </Link>
          </Col>
        </Row>

        <Row>
          <Col lg={6} md={12} className="mb-3 mb-lg-0">
            <CardUI>
              <h5 className="mb-3">Employee Directory</h5>
              <EmployeeGrid employees={employees} />
            </CardUI>
          </Col>
          <Col lg={6} md={12}>
            <CardUI>
              <h5 className="mb-3">Recent Activity</h5>
              {/* Recent activity component would go here */}
              <div className="text-center py-4 text-muted">
                <i className="bi bi-activity fs-1"></i>
                <p className="mt-2">Activity feed coming soon</p>
              </div>
            </CardUI>
          </Col>
        </Row>
      </Container>

      {/* Add Employee Modal */}
      <AddEmployee 
        show={showAddEmployeeModal}
        onHide={() => setShowAddEmployeeModal(false)}
        onAddEmployee={handleAddEmployee}
      />
    </>
  );
};

export default AdminDashboard;