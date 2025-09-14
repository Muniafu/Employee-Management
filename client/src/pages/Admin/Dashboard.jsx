import { useEffect, useState } from "react";
import { getEmployees } from "../../api/employeeApi";
import { getAttendance } from "../../api/attendanceApi";
import { getPayrolls } from "../../api/payrollApi";

export default function Dashboard() {
  const [stats, setStats] = useState({
    employees: 0,
    attendance: 0,
    payrolls: 0,
  });

  useEffect(() => {
    async function fetchStats() {
      try {
        const emp = await getEmployees();
        const att = await getAttendance();
        const pay = await getPayrolls();

        setStats({
          employees: emp.success ? emp.length : 0,
          attendance: att.success ? att.length : 0,
          payrolls: pay.success ? pay.length : 0,
        });
      } catch (error) {
        console.error("Failed to fetch stats:", error);
      }
    }
    fetchStats();
  }, []);

  return (
    <div className="container my-5">
      <h1 className="fw-bold mb-4 text-primary">📊 Admin Dashboard</h1>

      <div className="row g-4">
        {/* Employees Card */}
        <div className="col-12 col-md-4">
          <div className="card shadow-sm border-0 h-100">
            <div className="card-body text-center bg-light">
              <h2 className="h6 fw-semibold text-primary">Total Employees</h2>
              <p className="display-6 fw-bold text-primary mt-2">
                {stats.employees}
              </p>
            </div>
          </div>
        </div>

        {/* Attendance Card */}
        <div className="col-12 col-md-4">
          <div className="card shadow-sm border-0 h-100">
            <div className="card-body text-center bg-success bg-opacity-10">
              <h2 className="h6 fw-semibold text-success">
                Attendance Records
              </h2>
              <p className="display-6 fw-bold text-success mt-2">
                {stats.attendance}
              </p>
            </div>
          </div>
        </div>

        {/* Payroll Card */}
        <div className="col-12 col-md-4">
          <div className="card shadow-sm border-0 h-100">
            <div className="card-body text-center bg-warning bg-opacity-10">
              <h2 className="h6 fw-semibold text-warning">Payroll Entries</h2>
              <p className="display-6 fw-bold text-warning mt-2">
                {stats.payrolls}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}