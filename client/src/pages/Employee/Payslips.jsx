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
        <div className="container my-5">
            <div className="card shadow-sm border-0">
                <div className="card-body">
                    <h1 className="h3 fw-bold text-primary mb-4">Payslips</h1>

                    <div className="table-responsive">
                        <table className="table table-hover align-middle text-center">
                            <thead className="table-light sticky-top">
                                <tr>
                                    <th scope="col">Month</th>
                                    <th scope="col">Year</th>
                                    <th scope="col">Base</th>
                                    <th scope="col">Bonuses</th>
                                    <th scope="col">Deductions</th>
                                    <th scope="col">Net</th>
                                </tr>
                            </thead>
                            <tbody>
                                {Array.isArray(items) && items.length > 0 ? (
                                    items.map((p) => (
                                        <tr key={p._id}>
                                            <td>{p.month}</td>
                                            <td>{p.year}</td>
                                            <td className="text-muted">${p.baseSalary}</td>
                                            <td className="text-success">+${p.bonuses}</td>
                                            <td className="text-danger">-${p.deductions}</td>
                                            <td className="fw-semibold text-success">${p.netPay}</td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={6} className="py-3 text-muted">
                                            No payslips available
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    <p className="small text-muted mt-3">
                        💡 Tip: Regularly reviewing payslips helps ensure transparency and financial awareness.
                    </p>
                </div>
            </div>
        </div>
    );
}