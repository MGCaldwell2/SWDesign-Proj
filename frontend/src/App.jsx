import { useEffect, useState } from "react";
import { Routes, Route, Link } from "react-router-dom";
import AccountManage from "./AccountManagement/accountmanage";
import EventCreateForm from "./EventManageForm/EventCreateForm";
import EventEditForm from "./EventManageForm/EventEditForm";
import VolunteerLog from "./history/history";
import Login from "./login/login";
import UserReg from "./UserReg/UserReg";
import VolunteerMatching from "./volunteermatching/volunteermatching";
import Notification from "./notification/notification";
import AdminNotificationSender from "./notification/AdminNotificationSender";
import Home from "./home/home";
import UserDashboard from "./dashboard/UserDashboard";
import AdminDashboard from "./dashboard/AdminDashboard";  


export default function App() {
  return (
    <div style={{ fontFamily: "sans-serif", background: "white", minHeight: "100vh" }}>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/UserRegistration" element={<div style={{ padding: 20 }}><UserReg /></div>} />
        <Route path="/EventCreate" element={<div style={{ padding: 20 }}><EventCreateForm /></div>} />
        <Route path="/EventEdit" element={<div style={{ padding: 20 }}><EventEditForm /></div>} />
        <Route path="/VolunteerMatching" element={<div style={{ padding: 20 }}><VolunteerMatching /></div>} />
        <Route path="/VolunteerLog" element={<div style={{ padding: 20 }}><VolunteerLog /></div>} />
        <Route path="/Login" element={<div style={{ padding: 20 }}><Login /></div>} />
        <Route path="/AccountManage" element={<div style={{ padding: 20 }}><AccountManage /></div>} />
        <Route path="/notifications" element={<Notification />} />
        <Route path="/admin/notifications" element={<AdminNotificationSender />} />
        <Route path="/dashboard" element={<UserDashboard />} />
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
      </Routes>
    </div>
  );
}
