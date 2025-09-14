import { useEffect, useState } from "react";

export default function Announcements() {
    const [items, setItems] = useState([]);
    const API = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";

    useEffect(() => {
        async function load() {
            try {
                const token = localStorage.getItem("token");
                const res = await fetch(`${API}/notifications`, {
                    headers: { Authorization: token ? `Bearer ${token}` : undefined },
                });
                if (!res.ok) throw new Error("Failed to load notifications");
                const data = await res.json();
                const list = data?.notifications || data?.data || [];
                setItems(list);
            } catch (err) {
                console.error(err);
                setItems([]);
            }
        }
        load();
    }, [API]);

    return (
        <div className="container my-5">
            <div className="card shadow-sm border-0">
                <div className="card-body">
                    <h1 className="h3 fw-bold text-primary mb-4">
                        📢 Announcements
                    </h1>

                    {items.length > 0 ? (
                        <div className="d-flex flex-column gap-3">
                            {items.map((n) => (
                                <div
                                    key={n._id}
                                    className="card border-0 shadow-sm"
                                    style={{ backgroundColor: "#f8faff" }}
                                >
                                    <div className="card-body">
                                        <h5 className="card-title fw-semibold text-dark">
                                            {n.title || "Announcement"}
                                        </h5>
                                        <p className="card-text text-muted mb-2">
                                            {n.message}
                                        </p>
                                        <p className="small text-secondary mb-0">
                                            {new Date(n.createdAt).toLocaleString()}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-muted fst-italic">
                            No announcements at the moment.
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
}