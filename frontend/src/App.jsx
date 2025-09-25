import { useEffect, useState } from "react";
import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import AccountManage from "./AccountManagement/accountmanage.jsx";

function Home({ msg }) {
  return (
    <div>
      <h2>Home</h2>
      <p>{msg}</p>
      <p>
        <Link to="/accountmanage">Manage Account</Link>
      </p>
    </div>
  );
}

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
      <h1>React + Node App</h1>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home msg={msg} />} />
          <Route path="/accountmanage" element={<AccountManage />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}



