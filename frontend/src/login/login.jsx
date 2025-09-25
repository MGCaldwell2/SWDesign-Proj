import React, { useState } from "react";
import "./login.css";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState({ email: "", password: "" });

  const validate = () => {
    const newErrors = { email: "", password: "" };
    let valid = true;

    if (!email) {
      newErrors.email = "*Email* is mandatory";
      valid = false;
    }

    if (!password) {
      newErrors.password = "*Password* is mandatory";
      valid = false;
    }

    setErrors(newErrors);
    return valid;
  };

  const onSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;

    const userData = JSON.parse(localStorage.getItem(email));

    if (userData && userData.password === password) {
      console.log(userData.name + " You have successfully logged in!");
    } else {
      console.log("Email or Password is Incorrect");
    }
  };

  return (
    <>
      <h2>Login Form</h2>
      <form className="login-form" onSubmit={onSubmit}>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
        />
        {errors.email && <span style={{ color: "red" }}>{errors.email}</span>}

        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
        />
        {errors.password && (
          <span style={{ color: "red" }}>{errors.password}</span>
        )}

        <input type="submit" style={{ backgroundColor: "#a1eafb" }} />
      </form>
    </>
  );
}
