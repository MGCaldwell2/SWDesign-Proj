import { useEffect, useState } from "react";
import { Routes, Route, Link } from "react-router-dom";  
import AccountManage from "./AccountManagement/accountmanage";
import EventManageForm from "./EventManageForm/EventManageForm";
import VolunteerLog from "./history/history";
import Login from "./Login/Login";
import UserReg from "./UserReg/UserReg";
import VolunteerMatching from "./volunteermatching/volunteermatching";  


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
      {/* Debug banner to confirm React mounted */}
      <div style={{ position: "fixed", top: 8, right: 8, background: "#fffa", color: "#000", padding: "6px 8px", borderRadius: 6, zIndex: 9999 }}>
        Debug: App mounted
      </div>
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
                <Link to="/VolunteerMatching">
                  <button>Go to Volunteer Matching</button>
                </Link>
                <Link to="/VolunteerLog">
                  <button>Go to Volunteer Log</button>
                </Link>
                <Link to="/Login">
                  <button>Go to Login</button>
                </Link>
                <Link to="/AccountManage">
                  <button>Go to Account Manage</button>
                </Link>
              </div>
            </div>
          }
        />

        {/* Pages */}
        <Route path="/UserRegistration" element={<UserReg />} />
        <Route path="/EventManage" element={<EventManageForm />} />
        <Route path="/VolunteerMatching" element={<VolunteerMatching />} />
        <Route path="/VolunteerLog" element={<VolunteerLog />} />
        <Route path="/Login" element={<Login />} />
        <Route path="/AccountManage" element={<AccountManage />} />
      </Routes>
    </div>
  );
}
