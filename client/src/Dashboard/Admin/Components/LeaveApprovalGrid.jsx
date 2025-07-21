import React, { useState, useEffect } from 'react';
import { Card, Badge, Button, Spinner, Alert } from 'react-bootstrap';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { API } from '../../../api/axios';

const LeaveApprovalGrid = () => {
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState({});

  useEffect(() => {
    const fetchLeaves = async () => {
      try {
        const response = await API.leave.getPending();
        setLeaves(response.data);
      } catch (error) {
        console.error('Error fetching leave requests:', error);
        toast.error('Failed to load leave requests');
      } finally {
        setLoading(false);
      }
    };

    fetchLeaves();
  }, []);

  const handleAction = async (leaveId, action) => {
    try {
      setProcessing(prev => ({ ...prev, [leaveId]: true }));
      await API.leave.updateStatus(leaveId, { action });
      setLeaves(prev => prev.filter(leave => leave._id !== leaveId));
      toast.success(`Leave ${action}d successfully`);
    } catch (error) {
      console.error(`Error ${action}ing leave:`, error);
      toast.error(`Failed to ${action} leave`);
    } finally {
      setProcessing(prev => ({ ...prev, [leaveId]: false }));
    }
  };

  if (loading) return <Spinner animation="border" />;

  if (leaves.length === 0) {
    return <Alert variant="info">No pending leaves</Alert>;
  }

  return (
    <div className="row g-3">
      {leaves.map(leave => (
        <div key={leave._id} className="col-md-6 col-lg-4">
          <Card className="h-100 shadow-sm">
            <Card.Header>
              {leave.user.name} - {leave.type}
            </Card.Header>
            <Card.Body>
              <p>Dates: {new Date(leave.startDate).toLocaleDateString()} to {new Date(leave.endDate).toLocaleDateString()}</p>
              <p>Reason: {leave.reason}</p>
            </Card.Body>
            <Card.Footer className="d-flex gap-2">
              <Button
                variant="success"
                size="sm"
                onClick={() => handleAction(leave._id, 'approved')}
                disabled={processing[leave._id]}
              >
                {processing[leave._id] ? <Spinner size="sm" /> : 'Approve'}
              </Button>
              <Button
                variant="danger"
                size="sm"
                onClick={() => handleAction(leave._id, 'rejected')}
                disabled={processing[leave._id]}
              >
                {processing[leave._id] ? <Spinner size="sm" /> : 'Reject'}
              </Button>
            </Card.Footer>
          </Card>
        </div>
      ))}
    </div>
  );
};

export default LeaveApprovalGrid;