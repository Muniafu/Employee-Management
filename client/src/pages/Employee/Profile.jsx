import { useEffect, useState, useContext } from "react";
import { AuthContext } from "../../context/AuthContext";
import {
  getEmployee,
  updateEmployee,
  getMyEmployeeProfile,
  updateMyProfile,
} from "../../api/employeeApi";

export default function Profile() {
  const { user } = useContext(AuthContext);
  const [profile, setProfile] = useState(null);
  const [allEmployees, setAllEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");

  useEffect(() => {
    async function load() {
      try {
        if (user?.role === "Admin") {
          // Admin → fetch all employees
          const employees = await getEmployee();
          setAllEmployees(employees);
        } else if (user?.employeeId) {
          // Employee → fetch own profile
          const emp = await getMyEmployeeProfile("me");
          setProfile(emp);
        }
      } catch (err) {
        setError(err.message || "Failed to load profile");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [user]);

  const onChange = (e) => {
    setProfile((p) => ({ ...p, [e.target.name]: e.target.value }));
  };

  const onSave = async (e) => {
    e.preventDefault();
    if (!profile?._id) return;
    setSaving(true);
    setMsg("");
    try {
      const payload = {
        name: profile.name,
        email: profile.email,
        phone: profile.phone,
        address: profile.address,
        position: profile.position,
      };

      let updated;
      if (user?.role === "Admin") {
        updated = await updateEmployee(profile._id, payload);
      } else {
        updated = await updateMyProfile(payload);
      }

      setProfile(updated.employee || updated);
      setMsg("✅ Profile updated successfully.");
    } catch (err) {
      setMsg(err.message || "❌ Update failed");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="container py-5">Loading...</div>;
  if (error)
    return (
      <div className="container py-5">
        <div className="alert alert-danger">{error}</div>
      </div>
    );

  // Admin view
  if (user?.role === "Admin") {
    return (
      <div className="container py-5">
        <h1 className="fw-bold text-primary mb-4">
          👩‍💼 Admin View - All Employees
        </h1>

        {allEmployees.length > 0 ? (
          <ul className="list-group shadow-sm">
            {allEmployees.map((emp) => (
              <li
                key={emp._id}
                className="list-group-item d-flex justify-content-between align-items-center"
              >
                <span>
                  {emp.name} —{" "}
                  <span className="text-muted">
                    {emp.department?.name || "No Dept"}
                  </span>
                </span>
                <span className="badge bg-info text-dark">Employee</span>
              </li>
            ))}
          </ul>
        ) : (
          <div className="alert alert-warning">No employees found.</div>
        )}
      </div>
    );
  }

  // Employee view
  if (!profile)
    return <div className="container py-5">No profile data available.</div>;

  return (
    <div className="container py-5" style={{ maxWidth: "700px" }}>
      <h1 className="fw-bold text-primary mb-4">🙋 My Profile</h1>

      {msg && (
        <div
          className={`alert ${
            msg.includes("successfully") ? "alert-success" : "alert-danger"
          }`}
        >
          {msg}
        </div>
      )}

      <form onSubmit={onSave} className="card shadow-sm border-0 p-4">
        <div className="mb-3">
          <label htmlFor="name" className="form-label fw-semibold">
            Full Name
          </label>
          <input
            id="name"
            name="name"
            value={profile.name || ""}
            onChange={onChange}
            className="form-control"
            placeholder="Enter your full name"
          />
        </div>

        <div className="mb-3">
          <label htmlFor="email" className="form-label fw-semibold">
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            value={profile.email || ""}
            onChange={onChange}
            className="form-control"
            placeholder="Enter your email"
          />
        </div>

        <div className="mb-3">
          <label htmlFor="phone" className="form-label fw-semibold">
            Phone
          </label>
          <input
            id="phone"
            name="phone"
            value={profile.phone || ""}
            onChange={onChange}
            className="form-control"
            placeholder="Enter your phone number"
          />
        </div>

        <div className="mb-3">
          <label htmlFor="address" className="form-label fw-semibold">
            Address
          </label>
          <input
            id="address"
            name="address"
            value={profile.address || ""}
            onChange={onChange}
            className="form-control"
            placeholder="Enter your address"
          />
        </div>

        <div className="mb-3">
          <label htmlFor="position" className="form-label fw-semibold">
            Position
          </label>
          <input
            id="position"
            name="position"
            value={profile.position || ""}
            onChange={onChange}
            className="form-control"
            placeholder="Enter your position"
          />
        </div>

        <button
          type="submit"
          disabled={saving}
          className="btn btn-primary w-100 fw-semibold"
        >
          {saving ? "Saving..." : "💾 Save Changes"}
        </button>
      </form>
    </div>
  );
}