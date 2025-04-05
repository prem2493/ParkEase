const express = require("express");
const router = express.Router();
const { Pool } = require("pg");

// Hardcoded Neon connection string (replace with your actual Neon details)
const pool = new Pool({
    connectionString: "postgresql://neondb_owner:npg_oTga8PRHvjZ3@ep-twilight-morning-a1bzekb2-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require",
    ssl: { rejectUnauthorized: false } // Required for Neon SSL
});

// Fetch parking lot status
router.get("/", async (req, res) => {
    try {
        const result = await pool.query("SELECT * FROM parking_slots ORDER BY spot_number");
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Book a spot
router.post("/book", async (req, res) => {
    const { spot_number, username } = req.body;
    console.log("Received book request for username:", username); // Updated debug message to match intent
    try {
        // Check if the spot is available
        const spot = await pool.query("SELECT * FROM parking_slots WHERE spot_number = $1", [spot_number]);
        if (!spot.rows.length || spot.rows[0].is_booked) {
            return res.status(400).json({ message: "Spot is already booked or does not exist" });
        }

        // Book the spot
        await pool.query(
            "UPDATE parking_slots SET is_booked = TRUE, booked_by = $1 WHERE spot_number = $2",
            [username, spot_number]
        );

        res.json({ message: "Booking successful", spot_number });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get all bookings for a user
router.get("/user-bookings/:username", async (req, res) => {
    const { username } = req.params;
    try {
        const result = await pool.query("SELECT * FROM parking_slots WHERE booked_by = $1", [username]);
        if (result.rows.length === 0) {
            return res.json([]);
        }
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Cancel a specific spot for a user
router.delete("/cancel/:username/:spot_number", async (req, res) => {
    const { username, spot_number } = req.params;
    try {
        // Check if the user has booked this specific spot
        const userBooking = await pool.query(
            "SELECT * FROM parking_slots WHERE booked_by = $1 AND spot_number = $2",
            [username, spot_number]
        );
        if (userBooking.rows.length === 0) {
            return res.status(400).json({ message: "No active booking found for this spot" });
        }

        // Remove only the selected booking
        await pool.query(
            "UPDATE parking_slots SET is_booked = FALSE, booked_by = NULL WHERE booked_by = $1 AND spot_number = $2",
            [username, spot_number]
        );

        return res.json({ message: "Booking cancelled successfully" });
    } catch (err) {
        console.error("Error cancelling booking:", err);
        res.status(500).json({ message: "Server error" });
    }
});

// Submit a complaint
router.post("/submit-complaint", async (req, res) => {
    const { username, complaint } = req.body;
    try {
        if (!complaint) {
            return res.status(400).json({ message: "Complaint cannot be empty" });
        }
        await pool.query(
            "INSERT INTO complaints (username, complaint) VALUES ($1, $2)",
            [username, complaint]
        );
        res.json({ message: "Complaint submitted successfully" });
    } catch (err) {
        console.error("Error submitting complaint:", err);
        res.status(500).json({ message: "Server error" });
    }
});

module.exports = router;