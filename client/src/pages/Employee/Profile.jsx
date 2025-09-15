import { useEffect, useState, useContext } from "react";
import { AuthContext } from "../../context/AuthContext";
import {
  getEmployees,
  getMyEmployeeProfile,
  updateEmployee,
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
        setLoading(true);
        setError("");

        if (user?.role === "Admin") {
          // Admin → fetch all employees
          const res = await getEmployees();
          const employees = res.employees || res || [];
          setAllEmployees(employees);
          // Optionally set profile to first employee for editing
          if (employees.length > 0) {
            setProfile(employees[0]);
          } else {
            setProfile(null);
          }
        } else {
          // Employee → fetch own profile
          const emp = await getMyEmployeeProfile();
          setProfile(emp || null);
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
    const { name, value } = e.target;
    setProfile((p) => ({ ...(p || {}), [name]: value }));
  };

  const onSave = async (e) => {
    e.preventDefault();
    if (!profile) return;
    setSaving(true);
    setMsg("");
    try {
      // Map to backend-friendly fields
      const payload = {
        firstName: profile.firstName,
        lastName: profile.lastName,
        position: profile.position,
        department: profile.department ? profile.department._id || profile.department : undefined,
        salary: profile.salary,
        phone: profile.phone,
        address: profile.address,
      };

      let updated;
      if (user?.role === "Admin") {
        // Admin edits an employee record
        updated = await updateEmployee(profile._id, payload);
        // update local list
        const refreshed = await getEmployees();
        setAllEmployees(refreshed.employees || refreshed || []);
        // set profile to updated employee shape
        setProfile(updated);
      } else {
        updated = await updateMyProfile(payload);
        setProfile(updated);
      }

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
        <h1 className="fw-bold text-primary mb-4">👩‍💼 Admin View - All Employees</h1>

        {allEmployees.length > 0 ? (
          <ul className="list-group shadow-sm">
            {allEmployees.map((emp) => (
              <li
                key={emp._id}
                className="list-group-item d-flex justify-content-between align-items-center"
              >
                <div>
                  <strong>{emp.name || `${emp.firstName} ${emp.lastName}`}</strong>{" "}
                  — <span className="text-muted">{emp.department?.name || "No Dept"}</span>
                  <br />
                  <small className="text-muted">
                    {emp.user ? `${emp.user.username} | ${emp.user.email} | Role: ${emp.user.role}` : "No user account linked"}
                  </small>
                </div>
                <span className="badge bg-info text-dark">Employee</span>
              </li>
            ))}
          </ul>
        ) : (
          <div className="alert alert-warning">No employees found.</div>
        )}

        {/* Optional: show/edit selected employee */}
        {profile && (
          <div className="mt-4 card p-3 shadow-sm">
            <h5>Edit: {profile.name}</h5>
            <form onSubmit={onSave}>
              <div className="row g-2">
                <div className="col">
                  <input name="firstName" value={profile.firstName || ""} onChange={onChange} className="form-control" placeholder="First name" />
                </div>
                <div className="col">
                  <input name="lastName" value={profile.lastName || ""} onChange={onChange} className="form-control" placeholder="Last name" />
                </div>
              </div>
              <div className="mb-2 mt-2">
                <input name="position" value={profile.position || ""} onChange={onChange} className="form-control" placeholder="Position" />
              </div>
              <button type="submit" disabled={saving} className="btn btn-primary">
                {saving ? "Saving..." : "💾 Save Changes"}
              </button>
              {msg && <div className="mt-2 alert">{msg}</div>}
            </form>
          </div>
        )}
      </div>
    );
  }

  // Employee view
  if (!profile) return <div className="container py-5">No profile data available.</div>;

  return (
    <div className="container py-5" style={{ maxWidth: "700px" }}>
      <h1 className="fw-bold text-primary mb-4">🙋 My Profile</h1>

      {msg && (
        <div className={`alert ${msg.includes("successfully") ? "alert-success" : "alert-danger"}`}>
          {msg}
        </div>
      )}

      <form onSubmit={onSave} className="card shadow-sm border-0 p-4">
        <div className="mb-3">
          <label htmlFor="firstName" className="form-label fw-semibold">First Name</label>
          <input id="firstName" name="firstName" value={profile.firstName || ""} onChange={onChange} className="form-control" placeholder="First name" />
        </div>

        <div className="mb-3">
          <label htmlFor="lastName" className="form-label fw-semibold">Last Name</label>
          <input id="lastName" name="lastName" value={profile.lastName || ""} onChange={onChange} className="form-control" placeholder="Last name" />
        </div>

        <div className="mb-3">
          <label htmlFor="email" className="form-label fw-semibold">Email</label>
          <input id="email" name="email" type="email" value={profile.user?.email || profile.email || ""} onChange={onChange} className="form-control" placeholder="Email" disabled />
        </div>

        <div className="mb-3">
          <label htmlFor="phone" className="form-label fw-semibold">Phone</label>
          <input id="phone" name="phone" value={profile.phone || ""} onChange={onChange} className="form-control" placeholder="Phone" />
        </div>

        <div className="mb-3">
          <label htmlFor="address" className="form-label fw-semibold">Address</label>
          <input id="address" name="address" value={profile.address || ""} onChange={onChange} className="form-control" placeholder="Address" />
        </div>

        <div className="mb-3">
          <label htmlFor="position" className="form-label fw-semibold">Position</label>
          <input id="position" name="position" value={profile.position || ""} onChange={onChange} className="form-control" placeholder="Position" />
        </div>

        <button type="submit" disabled={saving} className="btn btn-primary w-100 fw-semibold">
          {saving ? "Saving..." : "💾 Save Changes"}
        </button>
      </form>
    </div>
  );
}