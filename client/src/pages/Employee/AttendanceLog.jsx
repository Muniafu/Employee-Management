import { useContext, useEffect, useState } from "react";
import { AuthContext } from "../../context/AuthContext";
import { clockIn, clockOut, getAttendanceForEmployee, getAttendance, getMyAttendance } from "../../api/attendanceApi";

export default function AttendanceLog() {
    const { user } = useContext(AuthContext);
    const [records, setRecords] = useState([]);
    const [loading, setLoading] = useState(true);
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState("");

    const load = async () => {
        if (!user) return;
        const data = await getAttendanceForEmployee(user.employeeId || user._id);
        setRecords(data?.data || data || []);
    };
    
    useEffect(() => { 
        async function load() {
            try {
                let data;
                if (user?.role === "Admin") {
                    // Admin → fetch all attendance records
                    data = await getAttendance();
                } else {
                    // Employee → fetch own attendance records
                    data = await getMyAttendance();
                }
                setRecords(data);
            } catch (err) {
                setError(err.message || "Failed to load attendance");
            } finally {
                setLoading(false);
            }
        }
        load();
    }, [user]);

    const handleClockIn = async () => {
        setBusy(true);
        try { await clockIn(user.employeeId || user._id); await load(); } finally { setBusy(false); }
    };
    const handleClockOut = async () => {
        setBusy(true);
        try { await clockOut(user.employeeId || user._id); await load(); } finally { setBusy(false); }
    };

    if (loading) return <div className="p-6">Loading...</div>;
    if (error) return <div className="p-6 text-red-600">{error}</div>;

    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold mb-4">Attendance Records</h1>
            <div className="flex gap-3 mb-4">
                <button onClick={handleClockIn} disabled={busy} className="bg-blue-600 text-white px-4 py-2 rounded">Clock In</button>
                <button onClick={handleClockOut} disabled={busy} className="bg-gray-700 text-white px-4 py-2 rounded">Clock Out</button>
            </div>
            <table className="w-full border-collapse border">
                <thead>
                    <tr className="bg-gray-100">
                        {user?.role === "Admin" && (
                            <th className="border px-2 py-1">Employee</th>
                        )}
                        <th className="border px-2 py-1">Date</th>
                        <th className="border px-2 py-1">Clock In</th>
                        <th className="border px-2 py-1">Clock Out</th>
                        <th className="border px-2 py-1">Status</th>
                    </tr>
                </thead>
                <tbody>
                    {records.map((r) => (
                        <tr key={r._id}>
                            {user?.role === "Admin" && (
                                <td className="border px-2 py-1">
                                    {r.employee?.firstName} {r.employee?.lastName}
                                </td>
                            )}
                            <td className="border px-2 py-1">{new Date(r.date || r.createdAt).toLocaleString()}</td>
                            <td className="border px-2 py-1">{r.clockIn ? new Date(r.clockIn).toLocaleTimeString() : "-"}</td>
                            <td className="border px-2 py-1">{r.clockOut ? new Date(r.clockOut).toLocaleTimeString() : "-"}</td>
                            <td className="border px-2 py-1">{r.status || (r.clockOut ? "Present" : "Open")}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}