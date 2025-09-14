import { useEffect, useState } from "react";
import { getEmployees } from "../../api/employeeApi";
import { getAttendanceForEmployee } from "../../api/attendanceApi";
import { getPayrolls } from "../../api/payrollApi";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

export default function Reports() {
  const [reportData, setReportData] = useState([]);

  useEffect(() => {
    async function loadData() {
      const emp = await getEmployees();
      const att = await getAttendanceForEmployee();
      const pay = await getPayrolls();

      setReportData([
        { name: "Employees", value: emp.success ? emp.data.length : 0 },
        { name: "Attendance", value: att.success ? att.data.length : 0 },
        { name: "Payrolls", value: pay.success ? pay.data.length : 0 },
      ]);
    }
    loadData();
  }, []);

  return (
    <div className="container my-5">
      <div className="text-center mb-4">
        <h1 className="fw-bold text-primary">📊 Reports & Analytics</h1>
        <p className="text-muted">
          Gain insights into workforce trends, productivity, and payroll data.
        </p>
      </div>

      <div className="card shadow-sm border-0">
        <div className="card-body">
          <h5 className="card-title text-secondary mb-3">
            Overview Dashboard
          </h5>
          <div style={{ width: "100%", height: 350 }}>
            <ResponsiveContainer>
              <BarChart data={reportData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="#0d6efd" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Legend Section */}
      <div className="row mt-4 text-center">
        <div className="col-md-4">
          <div className="p-3 bg-primary bg-opacity-10 rounded">
            <h6 className="fw-bold text-primary">Employees</h6>
            <p className="text-muted small">
              Total active employees in the system.
            </p>
          </div>
        </div>
        <div className="col-md-4">
          <div className="p-3 bg-success bg-opacity-10 rounded">
            <h6 className="fw-bold text-success">Attendance</h6>
            <p className="text-muted small">
              Recorded check-ins and attendance logs.
            </p>
          </div>
        </div>
        <div className="col-md-4">
          <div className="p-3 bg-warning bg-opacity-10 rounded">
            <h6 className="fw-bold text-warning">Payrolls</h6>
            <p className="text-muted small">
              Salary and compensation entries processed.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}