import { useEffect, useState } from "react";
import { Routes, Route, Link } from "react-router-dom";  
import UserReg from "./UserReg/UserReg";
import EventManageForm from "./EventManageForm/EventManageForm"; // 👈 import your new component

export default function App() {
  const [msg, setMsg] = useState("loading...");

  useEffect(() => {
    fetch("/api/hello")
      .then(r => r.json())
      .then(d => setMsg(d.message))
      .catch(() => setMsg("fetch failed"));
  }, []);

  return (
    <div style={{ fontFamily: "sans-serif", padding: 20 }}>
      <Routes>
        {/* Home Page */}
        <Route
          path="/"
          element={
            <div>
              <h1>React + Node App</h1>
              <p>Backend says: {msg}</p>

              {/* Navigation buttons */}
              <div style={{ display: "flex", gap: "10px", marginTop: "20px" }}>
                <Link to="/UserRegistration">
                  <button>Go to User Registration</button>
                </Link>
                <Link to="/EventManage">
                  <button>Go to Event Management</button>
                </Link>
              </div>
            </div>
          }
        />

        {/* Pages */}
        <Route path="/UserRegistration" element={<UserReg />} />
        <Route path="/EventManage" element={<EventManageForm />} />
      </Routes>
    </div>
  );
}
