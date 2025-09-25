import { useEffect, useState } from "react";
import AccountManage from "./AccountManagement/accountmanage.jsx";

// App.jsx
import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import VolunteerMatching from "./volunteermatching/volunteermatching.jsx";
import "./volunteermatching/volunteermatching.css";   
//import VolunteerMatching from "volunteermatching/volunteermatching.jsx";
//import "./volunteermatching/volunteermatching.css";                  

import VolunteerLog from "./history/history.jsx";
import "./history/history.css";

import Login from "./login/login.jsx";
import "./login/login.css";
function Home() {
  return (
    <div style={{ fontFamily: "sans-serif", padding: 20 }}>
      <h1>React + Node App</h1>
      <h2>Home</h2>
      <p>Go to the volunteer matcher:</p>
      <Link to="/match">Open Volunteer Matching</Link>
      <Link to="/history">Open Volunteer History</Link>
      <Link to="/login">Open Volunteer Login</Link>
      <Link to="/accountmanage">Open Account Management</Link>
    </div>
  );
}



export default function App() {
  return (
    <div style={{ fontFamily: "sans-serif", padding: 20 }}>
      <h1>React + Node App</h1>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/match" element={<VolunteerMatching />} />
          <Route path="/history" element={<VolunteerLog />} />
          <Route path="/login" element={<Login />} />
          <Route path="/accountmanage" element={<AccountManage />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}
