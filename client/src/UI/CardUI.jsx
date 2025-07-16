import React from "react";
import { Card } from "react-bootstrap";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const CardUI = (props) => {
  // Toastify style configuration
  const toastStyle = {
    background: '#f8f9fa',
    color: '#212529',
    borderRadius: '8px',
    boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
    borderLeft: props.toastBorderColor ? `4px solid ${props.toastBorderColor}` : '4px solid #0d6efd'
  };

  return (
    <>
      {/* Toast Container - Only render if toast props are provided */}
      {props.showToast && (
        <div className="position-absolute top-0 end-0 m-3">
          {toast(props.toastMessage, {
            position: "top-right",
            autoClose: 3000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
            style: toastStyle,
            className: props.toastClassName || ''
          })}
        </div>
      )}

      <Card 
        className={`p-3 m-2 ${props.className || ''}`}
        style={{ 
          width: props.width || '100%',
          border: props.border ? '1px solid #dee2e6' : 'none',
          borderRadius: '0.5rem',
          boxShadow: props.shadow ? '0 0.5rem 1rem rgba(0, 0, 0, 0.15)' : 'none',
          ...props.style
        }}
      >
        <Card.Body className={props.bodyClassName || ''}>
          {props.image && (
            <div className={`d-flex ${props.center ? "justify-content-center" : "justify-content-start"} align-items-center`}>
              <div 
                className="rounded-circle bg-secondary d-flex align-items-center justify-content-center"
                style={{
                  width: props.imgSize || '64px',
                  height: props.imgSize || '64px',
                  overflow: 'hidden',
                  backgroundColor: props.imgBg || '#e9ecef'
                }}
              >
                {props.image}
              </div>
              
              {props.title && (
                <div className="ms-3">
                  <Card.Title as="h3" className="mb-1 text-primary">
                    {props.title}
                  </Card.Title>
                  {props.position && (
                    <Card.Subtitle className="mb-1 text-muted fw-bold">
                      {props.position}
                    </Card.Subtitle>
                  )}
                  {props.address && (
                    <Card.Text className="text-muted small">
                      {props.address}
                    </Card.Text>
                  )}
                </div>
              )}
            </div>
          )}
          
          {props.children}
        </Card.Body>
      </Card>
    </>
  );
};

export default CardUI;