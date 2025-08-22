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
                if (!res.ok) throw new Error("Failed to load notifications");const data = await res.json();
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
        <div className="p-6 max-w-3xl">
            <h1 className="text-2xl font-bold mb-4">Announcements</h1>
            <div className="space-y-3">
                {items.length > 0 ? (
                    items.map((n) => (
                        <div key={n._id} className="bg-white border rounded p-4 shadow-sm">
                            <h3 className="font-semibold">{n.title || "Announcement"}</h3>
                            <p className="text-sm text-gray-700">{n.message}</p>
                            <p className="text-xs text-gray-400 mt-1">{new Date(n.createdAt).toLocaleString()}</p>
                        </div>
                        ))
                    ) : (
                    <p className="text-gray-500">No announcements.</p>
                )}
            </div>
        </div>
    );
}