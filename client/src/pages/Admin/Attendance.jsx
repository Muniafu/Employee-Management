import { useEffect, useState } from "react";
import { getAttendance } from "../../api/attendanceApi";

export default function Attendance() {
  const [records, setRecords] = useState([]);

  useEffect(() => {
    loadAttendance();
  }, []);

  const loadAttendance = async () => {
    const res = await getAttendance();
    if (res.success) setRecords(res.data);
  };

  return (
    <div className="container my-5">
      <div className="card shadow-sm border-0">
        <div className="card-header bg-primary text-white d-flex justify-content-between align-items-center">
          <h1 className="h5 mb-0 fw-bold">📊 Attendance Records</h1>
          <span className="badge bg-light text-primary fw-semibold">
            {records.length} Records
          </span>
        </div>
        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="table-light">
                <tr>
                  <th scope="col">Employee</th>
                  <th scope="col">Date</th>
                  <th scope="col">Status</th>
                </tr>
              </thead>
              <tbody>
                {records.length > 0 ? (
                  records.map((rec) => (
                    <tr key={rec._id}>
                      <td>{rec.employee ? `${rec.employee.firstName} ${rec.employee.lastName}` : "N/A"}</td>
                      <td>{new Date(rec.date).toLocaleDateString()}</td>
                      <td>
                        <span
                          className={`badge px-3 py-2 fw-semibold ${
                            rec.status === "Present"
                              ? "bg-success"
                              : rec.status === "Absent"
                              ? "bg-danger"
                              : "bg-warning text-dark"
                          }`}
                        >
                          {rec.status}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="3" className="text-center text-muted py-4">
                      No attendance records available.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}