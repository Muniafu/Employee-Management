import { useContext, useState } from "react";
import { AuthContext } from "../../context/AuthContext";

export default function LeaveRequest() {
  const { user } = useContext(AuthContext);
  const [form, setForm] = useState({
    type: "Annual",
    startDate: "",
    endDate: "",
    reason: "",
  });
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");

  const onChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const onSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMsg("");
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(
        `${
          import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api"
        }/leaves`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: token ? `Bearer ${token}` : undefined,
          },
          body: JSON.stringify({
            employeeId: user?.employeeId || user?._id,
            type: form.type,
            startDate: form.startDate,
            endDate: form.endDate,
            reason: form.reason,
          }),
        }
      );
      if (!res.ok) throw new Error((await res.json()).message || "Request failed");
      setMsg("✅ Leave request submitted successfully.");
      setForm({ type: "Annual", startDate: "", endDate: "", reason: "" });
    } catch (err) {
      setMsg(err.message || "Error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container py-5">
      <div className="card shadow-sm border-0 mx-auto" style={{ maxWidth: "600px" }}>
        <div className="card-body">
          <h1 className="fw-bold text-primary mb-4">📅 Leave Request</h1>

          {msg && (
            <div
              className={`alert ${
                msg.includes("successfully") ? "alert-success" : "alert-danger"
              }`}
              role="alert"
            >
              {msg}
            </div>
          )}

          <form onSubmit={onSubmit}>
            <div className="mb-3">
              <label htmlFor="type" className="form-label fw-semibold">
                Leave Type
              </label>
              <select
                id="type"
                name="type"
                value={form.type}
                onChange={onChange}
                className="form-select"
                required
              >
                <option>Annual</option>
                <option>Sick</option>
                <option>Unpaid</option>
                <option>Parental</option>
              </select>
            </div>

            <div className="row">
              <div className="col-md-6 mb-3">
                <label htmlFor="startDate" className="form-label fw-semibold">
                  Start Date
                </label>
                <input
                  type="date"
                  id="startDate"
                  name="startDate"
                  value={form.startDate}
                  onChange={onChange}
                  className="form-control"
                  required
                />
              </div>
              <div className="col-md-6 mb-3">
                <label htmlFor="endDate" className="form-label fw-semibold">
                  End Date
                </label>
                <input
                  type="date"
                  id="endDate"
                  name="endDate"
                  value={form.endDate}
                  onChange={onChange}
                  className="form-control"
                  required
                />
              </div>
            </div>

            <div className="mb-3">
              <label htmlFor="reason" className="form-label fw-semibold">
                Reason
              </label>
              <textarea
                id="reason"
                name="reason"
                value={form.reason}
                onChange={onChange}
                className="form-control"
                placeholder="Provide details for your leave request"
                rows="3"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn btn-success w-100 fw-bold"
            >
              {loading ? "Submitting..." : "Submit Request"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}