const express = require("express");
const bcrypt = require("bcrypt");
const router = express.Router();

const User = require("../models/user"); 


router.post("/signup", async (req, res) => {
  try {
    const { username, firstname, lastname, password } = req.body;

    if (!username || !firstname || !lastname || !password) {
      return res.status(400).json({ message: "All fields are required." });
    }

    const existing = await User.findOne({ username: username.trim() });
    if (existing) {
      return res.status(409).json({ message: "Username already taken." });
    }

    const hashed = await bcrypt.hash(password, 10);

    const user = await User.create({
      username: username.trim(),
      firstname: firstname.trim(),
      lastname: lastname.trim(),
      password: hashed
    });

    return res.status(201).json({
      message: "Signup OK",
      user: { username: user.username, firstname: user.firstname, lastname: user.lastname }
    });
  } catch (err) {

    if (err?.code === 11000) {
      return res.status(409).json({ message: "Username already taken." });
    }
    return res.status(500).json({ message: "Server error", error: err.message });
  }
});


router.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ message: "Username and password required." });
    }

    const user = await User.findOne({ username: username.trim() });
    if (!user) return res.status(401).json({ message: "Invalid credentials." });

    const ok = await bcrypt.compare(password, user.password);
    if (!ok) return res.status(401).json({ message: "Invalid credentials." });

    return res.json({
      message: "Login OK",
      user: { username: user.username, firstname: user.firstname, lastname: user.lastname }
    });
  } catch (err) {
    return res.status(500).json({ message: "Server error", error: err.message });
  }
});

router.get("/health", (req, res) => res.json({ ok: true }));

module.exports = router;

