import { useEffect, useState, useContext } from "react";
import { AuthContext } from "../../context/AuthContext";
import { getEmployee, updateEmployee } from "../../api/employeeApi";

export default function Profile() {
    const { user } = useContext(AuthContext);
    const [profile, setProfile] = useState(null);
    const [saving, setSaving] = useState(false);
    const [msg, setMsg] = useState("");

    useEffect(() => {
        async function load() {
            if (!user) return;
            // Prefer loading the Employee doc for richer fields
            const res = await getEmployee(user.employeeId || user._id);
            setProfile(res);
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
            const updated = await updateEmployee(profile._id, {
                name: profile.name,
                email: profile.email,
                phone: profile.phone,
                address: profile.address,
                position: profile.position,
            });
            setProfile(updated);
            setMsg("Profile updated successfully.");
        } catch (err) {
            setMsg(err.message || "Update failed");
        } finally {
            setSaving(false);
        }
    };
    
    if (!profile) return <div className="p-6">Loading...</div>;

    return (
        <div className="p-6 max-w-2xl">
            <h1 className="text-2xl font-bold mb-4">My Profile</h1>
            {msg && <p className="mb-3 text-sm text-green-600">{msg}</p>}
            <form onSubmit={onSave} className="grid grid-cols-1 gap-4">
                <input
                    name="name"
                    value={profile.name || ""}
                    onChange={onChange}
                    className="border rounded px-3 py-2"
                    placeholder="Full Name"
                />
                <input
                    name="email"
                    type="email"
                    value={profile.email || ""}
                    onChange={onChange}
                    className="border rounded px-3 py-2"
                    placeholder="Email"
                />
                <input
                    name="phone"
                    value={profile.phone || ""}
                    onChange={onChange}
                    className="border rounded px-3 py-2"
                    placeholder="Phone"
                />
                <input
                    name="address"
                    value={profile.address || ""}
                    onChange={onChange}
                    className="border rounded px-3 py-2"
                    placeholder="Address"
                />
                <input
                    name="position"
                    value={profile.position || ""}
                    onChange={onChange}
                    className="border rounded px-3 py-2"
                    placeholder="Position"
                />
                <button
                    type="submit"
                    disabled={saving}
                    className="bg-blue-600 text-white rounded px-4 py-2"
                    >
                    {saving ? "Saving..." : "Save Changes"}
                </button>
            </form>
        </div>
    );
}