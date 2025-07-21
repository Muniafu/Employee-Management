import React from 'react';
import { Card, Spinner, Alert } from 'react-bootstrap';
import ChartUI from '../../../UI/ChartUI';
import PropTypes from 'prop-types';

const LeaveChart = ({ stats }) => {
  if (!stats) {
    return (
      <div className="d-flex justify-content-center" style={{ height: '300px' }}>
        <Spinner animation="border" />
      </div>
    );
  }

  const chartData = {
    labels: ['Approved', 'Pending', 'Rejected', 'Remaining'],
    datasets: [{
      data: [
        stats.approved || 0,
        stats.pending || 0,
        stats.rejected || 0,
        stats.remaining || 0
      ],
      backgroundColor: [
        '#28a745', '#ffc107', '#dc3545', '#17a2b8'
      ]
    }]
  };

  return (
    <Card className="h-100 shadow-sm">
      <Card.Body>
        <div style={{ height: '300px' }}>
          <ChartUI type="pie" data={chartData} />
        </div>
      </Card.Body>
    </Card>
  );
};

LeaveChart.propTypes = {
  stats: PropTypes.object
};

export default LeaveChart;