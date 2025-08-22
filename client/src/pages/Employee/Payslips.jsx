import { useContext, useEffect, useState } from "react";
import { AuthContext } from "../../context/AuthContext";
import { getPayrolls } from "../../api/payrollApi";


export default function Payslips() {
    const { user } = useContext(AuthContext);
    const [items, setItems] = useState([]);
    
    useEffect(() => {
        async function load() {
            if (!user) return;
            const res = await getPayrolls(user.employeeId || user._id);
            setItems(res?.payrolls || res?.data || res || []);
        }
        load();
    }, [user]);
    
    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold mb-4">Payslips</h1>
                <table className="w-full border-collapse border">
                    <thead>
                        <tr className="bg-gray-100">
                            <th className="border px-2 py-1">Month</th>
                            <th className="border px-2 py-1">Year</th>
                            <th className="border px-2 py-1">Base</th>
                            <th className="border px-2 py-1">Bonuses</th>
                            <th className="border px-2 py-1">Deductions</th>
                            <th className="border px-2 py-1">Net</th>
                        </tr>
                    </thead>
                    <tbody>
                        {Array.isArray(items) && items.length > 0 ? (
                            items.map((p) => (
                                <tr key={p._id}>
                                    <td className="border px-2 py-1">{p.month}</td>
                                    <td className="border px-2 py-1">{p.year}</td>
                                    <td className="border px-2 py-1">{p.baseSalary}</td>
                                    <td className="border px-2 py-1">{p.bonuses}</td>
                                    <td className="border px-2 py-1">{p.deductions}</td>
                                    <td className="border px-2 py-1 font-semibold">{p.netPay}</td>
                                </tr>
                            ))
                        ) : (
                        <tr><td className="border px-2 py-3 text-center" colSpan={6}>No payslips</td></tr>
                    )}
                </tbody>
            </table>
        </div>
    );
}