const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { Pool } = require("pg");

// Neon connection string (placeholder - replace with your actual Neon details)
const pool = new Pool({
    connectionString: "postgresql://neondb_owner:npg_oTga8PRHvjZ3@ep-twilight-morning-a1bzekb2-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require",
    ssl: { rejectUnauthorized: false } // Neon requires SSL; this handles self-signed certificates
});

const SECRET_KEY = "your_secret_key";

// Register Route
router.post("/register", async (req, res) => {
    const { username, password , name, email, phone} = req.body;
    try {
        if (!username || !password) {
            return res.status(400).json({ message: "Username and password are required" });
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        await pool.query(
            "INSERT INTO users (username, password, name, email, phone) VALUES ($1, $2,$3,$4,$5)",
            [username, hashedPassword, name, email, phone]
        );
        res.json({ message: "User registered successfully!" });
    } catch (err) {
        console.error("Error in register route:", err);
        res.status(500).json({ error: err.message });
    }
});

// Login Route
router.post("/login", async (req, res) => {
    const { username, password } = req.body;
    try {
        const user = await pool.query("SELECT * FROM users WHERE username = $1", [username]);
        if (user.rows.length === 0) {
            return res.status(400).json({ message: "User not found" });
        }
        const isValidPassword = await bcrypt.compare(password, user.rows[0].password);
        if (!isValidPassword) {
            return res.status(400).json({ message: "Invalid credentials" });
        }
        const token = jwt.sign({ username }, SECRET_KEY, { expiresIn: "1h" });
        res.json({ token, username: user.rows[0].username, message: "Login successful" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});


module.exports = router;
