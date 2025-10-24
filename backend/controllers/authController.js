import jwt from "jsonwebtoken";

// Temporary in-memory users (replace with database later)
const users = [];

export const register = (req, res) => {
  const { username, password } = req.body;

  if (users.find((u) => u.username === username)) {
    return res.status(400).json({ message: "User already exists" });
  }

  const newUser = { username, password };
  users.push(newUser);

  res.json({ message: "Registration successful" });
};

export const login = (req, res) => {
  const { username, password } = req.body;

  const user = users.find(
    (u) => u.username === username && u.password === password
  );
  if (!user) {
    return res.status(401).json({ message: "Invalid credentials" });
  }

  // Generate a JWT token
  const token = jwt.sign(
    { username: user.username },
    process.env.JWT_SECRET || "default_secret",
    { expiresIn: "1h" }
  );

  res.json({
    token: token,
    message: "Login successful",
  });
};
