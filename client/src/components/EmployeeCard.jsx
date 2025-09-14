export default function EmployeeCard({ employee }) {
  return (
    <div 
      className="card shadow-sm border-0 mb-3" 
      style={{ borderRadius: "1rem", transition: "transform 0.2s ease, box-shadow 0.2s ease" }}
      role="button"
      tabIndex="0"
      aria-label={`Employee card for ${employee.name}, ${employee.role} in ${employee.department}`}
      onMouseOver={(e) => {
        e.currentTarget.style.transform = "translateY(-5px)";
        e.currentTarget.style.boxShadow = "0 8px 20px rgba(0,0,0,0.15)";
      }}
      onMouseOut={(e) => {
        e.currentTarget.style.transform = "translateY(0)";
        e.currentTarget.style.boxShadow = "0 2px 6px rgba(0,0,0,0.1)";
      }}
    >
      <div className="card-body d-flex align-items-center">
        <img
          src={employee.avatar || "https://via.placeholder.com/50"}
          alt={`${employee.name}'s profile picture`}
          className="rounded-circle me-3"
          width="60"
          height="60"
        />
        <div>
          <h5 
            className="card-title mb-1 fw-bold text-primary" 
            style={{ fontSize: "1.1rem" }}
          >
            {employee.name}
          </h5>
          <p className="card-text mb-0 text-muted small">
            {employee.department}
          </p>
          <p className="card-text mb-0 text-secondary small">
            {employee.role}
          </p>
        </div>
      </div>
    </div>
  );
}