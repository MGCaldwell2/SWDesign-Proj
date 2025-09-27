import { useEffect, useState } from "react";
import { Routes, Route, Link } from "react-router-dom";  
import AccountManage from "./AccountManagement/accountmanage";
import EventManageForm from "./EventManageForm/EventManageForm";
import VolunteerLog from "./history/history";
import Login from "./Login/Login";
import UserReg from "./UserReg/UserReg";
import VolunteerMatching from "./volunteermatching/volunteermatching";
import Notification from "./notification/notification";
import Home from "./home/home";  


export default function App() {
  /*const [msg, setMsg] = useState("loading...");

  useEffect(() => {
    fetch("/api/hello")
      .then(r => r.json())
      .then(d => setMsg(d.message))
      .catch(() => setMsg("fetch failed"));
  }, []);*/

  return (
    <div style={{ fontFamily: "sans-serif", background: "white", minHeight: "100vh" }}>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/UserRegistration" element={<div style={{ padding: 20 }}><UserReg /></div>} />
        <Route path="/EventManage" element={<div style={{ padding: 20 }}><EventManageForm /></div>} />
        <Route path="/VolunteerMatching" element={<div style={{ padding: 20 }}><VolunteerMatching /></div>} />
        <Route path="/VolunteerLog" element={<div style={{ padding: 20 }}><VolunteerLog /></div>} />
        <Route path="/Login" element={<div style={{ padding: 20 }}><Login /></div>} />
        <Route path="/AccountManage" element={<div style={{ padding: 20 }}><AccountManage /></div>} />
        <Route path="/notifications" element={<Notification />} />
      </Routes>
    </div>
  );
}