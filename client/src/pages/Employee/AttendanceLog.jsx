import { useContext, useEffect, useRef, useState } from "react";
import { AuthContext } from "../../context/AuthContext";
import {
  clockIn,
  clockOut,
  getAttendance,
  getMyAttendance,
} from "../../api/attendanceApi";

export default function AttendanceLog() {
  const { user } = useContext(AuthContext);
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const toastRef = useRef(null);

    const showToast = (message, type = "success") => {
    const toastEl = toastRef.current;
    if (!toastEl) return;

    toastEl.innerText = message;
    toastEl.className = `toast align-items-center text-bg-${type} border-0 show position-fixed bottom-0 end-0 m-3`;
    setTimeout(() => {
      toastEl.className = "toast align-items-center text-bg-success border-0"; // hide after 3s
    }, 3000);
  };

  const load = async () => {
    if (!user) return;

    try {  
      let res;
      if (user.role === "Admin") {
        res = await getAttendance(); // all employees
      } else {
        res = await getMyAttendance(); // self
      }

      if (res.success) {
        setRecords(res.data);
      } else {
        setError(res.message || "Failed to load attendance");
      }
    } catch (err) {
      setError(err.message || "Failed to load attendance");
    }
  };

  useEffect(() => {
    load().finally(() => setLoading(false));
  }, [user]);

  const handleClockIn = async () => {
    setBusy(true);
    try {
      const res = await clockIn(user.employeeId || user.employee);
      await load();
      showToast(res.message, res.success ? "success" : "danger");
    } catch (err) {
      showToast(err.message || "Clock-in failed", "danger");
    } finally {
      setBusy(false);
    }
  };

  const handleClockOut = async () => {
    setBusy(true);
    try {
      const res = await clockOut(user.employeeId || user.employee);
      await load();
      showToast(res.message, res.success ? "success" : "danger");
    }catch(err) {
      showToast(err.message || "Clock-out failed", "danger");
    } finally {
      setBusy(false);
    }
  };

  if (loading)
    return (
      <div className="container py-5 text-center">
        {/* Toast container */}
        <div ref={toastRef} className="toast align-items-center text-bg-success border-0" />

        <div className="spinner-border text-primary" role="status"></div>
        <p className="mt-3">Loading attendance records...</p>
      </div>
    );

  if (error)
    return (
      <div className="container py-5">
        <div className="alert alert-danger">{error}</div>
      </div>
    );

  return (
    <div className="container py-5">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1 className="fw-bold text-primary">
          🕒 Attendance Records
        </h1>
        <div>
          <button
            onClick={handleClockIn}
            disabled={busy}
            className="btn btn-success me-2 fw-semibold"
          >
            {busy ? "Processing..." : "✅ Clock In"}
          </button>
          <button
            onClick={handleClockOut}
            disabled={busy}
            className="btn btn-secondary fw-semibold"
          >
            {busy ? "Processing..." : "⏹ Clock Out"}
          </button>
        </div>
      </div>

      <div className="card shadow-sm border-0">
        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="table table-striped table-hover align-middle mb-0">
              <thead className="table-light">
                <tr>
                  {user?.role === "Admin" && <th scope="col">Employee</th>}
                  <th scope="col">Date</th>
                  <th scope="col">Clock In</th>
                  <th scope="col">Clock Out</th>
                  <th scope="col">Status</th>
                </tr>
              </thead>
              <tbody>
                {records.map((r) => (
                  <tr key={r._id}>
                    {user?.role === "Admin" && (
                      <td>
                        {r.employee?.firstName} {r.employee?.lastName}
                      </td>
                    )}
                    <td>
                      {new Date(r.date || r.createdAt).toLocaleDateString()}{" "}
                      <span className="text-muted small">
                        {new Date(r.date || r.createdAt).toLocaleTimeString()}
                      </span>
                    </td>
                    <td>
                      {r.clockIn
                        ? new Date(r.clockIn).toLocaleTimeString()
                        : "-"}
                    </td>
                    <td>
                      {r.clockOut
                        ? new Date(r.clockOut).toLocaleTimeString()
                        : "-"}
                    </td>
                    <td>
                      <span
                        className={`badge rounded-pill ${
                          r.status === "Absent"
                            ? "bg-danger"
                            : r.clockOut
                            ? "bg-success"
                            : "bg-warning text-dark"
                        }`}
                      >
                        {r.status || (r.clockOut ? "Present" : "Open")}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}