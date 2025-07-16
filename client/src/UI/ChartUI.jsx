import React from "react";
import { ResponsivePie } from "@nivo/pie";
import { Card, Spinner, Alert } from "react-bootstrap";
import { toast } from "react-toastify";

const ChartUI = ({ leaves, loading, error }) => {
  // Show error toast if there's an error
  React.useEffect(() => {
    if (error) {
      toast.error(error.message || "Failed to load leave data", {
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

  const getLeaveData = (status) => {
    if (!leaves || !Array.isArray(leaves)) {
      return 0;
    }

    return leaves.filter(leave => leave.status === status).length;
  };

  const data = [
    {
      id: "approved",
      label: "Approved",
      value: getLeaveData("approved"),
      color: "#28a745" // Bootstrap success color
    },
    {
      id: "rejected",
      label: "Rejected",
      value: getLeaveData("rejected"),
      color: "#dc3545" // Bootstrap danger color
    },
    {
      id: "pending",
      label: "Pending",
      value: getLeaveData("pending"),
      color: "#ffc107" // Bootstrap warning color
    },
  ];

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: '225px' }}>
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="danger" className="mt-3">
        Failed to load leave data
      </Alert>
    );
  }

  if (!leaves || leaves.length === 0) {
    return (
      <Alert variant="info" className="mt-3">
        No leave data available
      </Alert>
    );
  }

  return (
    <Card className="mb-4">
      <Card.Body>
        <div style={{ height: 225 }}>
          <ResponsivePie
            colors={{ datum: 'data.color' }}
            data={data}
            margin={{ top: 40, right: 80, bottom: 80, left: 80 }}
            innerRadius={0.5}
            padAngle={0.7}
            cornerRadius={3}
            activeOuterRadiusOffset={8}
            borderWidth={1}
            borderColor={{
              from: "color",
              modifiers: [["darker", 0.2]],
            }}
            arcLinkLabelsSkipAngle={10}
            arcLinkLabelsTextColor="#333333"
            arcLinkLabelsThickness={2}
            arcLinkLabelsColor={{ from: "color" }}
            arcLabelsSkipAngle={10}
            arcLabelsTextColor={{
              from: "color",
              modifiers: [["darker", 5]],
            }}
            legends={[
              {
                anchor: "bottom",
                direction: "row",
                justify: false,
                translateX: 0,
                translateY: 56,
                itemsSpacing: 0,
                itemWidth: 100,
                itemHeight: 18,
                itemTextColor: "#6c757d", // Bootstrap secondary text color
                itemDirection: "left-to-right",
                itemOpacity: 1,
                symbolSize: 18,
                symbolShape: "circle",
                effects: [
                  {
                    on: "hover",
                    style: {
                      itemTextColor: "#212529", // Bootstrap dark color
                    },
                  },
                ],
              },
            ]}
          />
        </div>
      </Card.Body>
      <Card.Footer className="text-muted small">
        Showing leave status distribution
      </Card.Footer>
    </Card>
  );
};

export default ChartUI;