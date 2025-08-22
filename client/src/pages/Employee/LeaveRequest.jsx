import { useContext, useState } from "react";
import { AuthContext } from "../../context/AuthContext";

export default function LeaveRequest() {
    const { user } = useContext(AuthContext);
    const [form, setForm] = useState({ type: "Annual", startDate: "", endDate: "", reason: "" });
    const [loading, setLoading] = useState(false);
    const [msg, setMsg] = useState("");

    const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });
    
    const onSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMsg("");
        try {
            const token = localStorage.getItem("token");
            const res = await fetch(`${import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api"}/leaves`, {
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
            });
            if (!res.ok) throw new Error((await res.json()).message || "Request failed");
            setMsg("Leave request submitted.");
            setForm({ type: "Annual", startDate: "", endDate: "", reason: "" });
        } catch (err) {
            setMsg(err.message || "Error");
        } finally {
            setLoading(false);
        }
    };
    return (
        <div className="p-6 max-w-xl">
            <h1 className="text-2xl font-bold mb-4">Leave Request</h1>
            {msg && <p className="mb-3 text-sm text-blue-700">{msg}</p>}
            <form onSubmit={onSubmit} className="grid grid-cols-1 gap-3">
                <select name="type" value={form.type} onChange={onChange} className="border rounded px-3 py-2">
                    <option>Annual</option>
                    <option>Sick</option>
                    <option>Unpaid</option>
                    <option>Parental</option>
                </select>
                <input type="date" name="startDate" value={form.startDate} onChange={onChange} className="border rounded px-3 py-2" />
                <input type="date" name="endDate" value={form.endDate} onChange={onChange} className="border rounded px-3 py-2" />
                <textarea name="reason" value={form.reason} onChange={onChange} className="border rounded px-3 py-2" placeholder="Reason" />
                <button type="submit" disabled={loading} className="bg-green-600 text-white rounded px-4 py-2">
                    {loading ? "Submitting..." : "Submit"}
                </button>
            </form>
        </div>
    );
}