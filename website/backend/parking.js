const express = require("express");
const router = express.Router();
const { Pool } = require("pg");


const pool = new Pool({
    user: "postgres",
    host: "localhost",
    database: "parkease",
    password: "222414",
    port: 5432,
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
  console.log("Received cancel request for username:", username); // Debugging line

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

// Get user's booking info
router.get("/user-booking/:username", async (req, res) => {
  const { username } = req.params;

  try {
    const result = await pool.query("SELECT * FROM parking_slots WHERE booked_by = $1", [username]);
    if (!result.rows.length) {
      return res.json({ message: "No booking found" });
    }

    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


router.delete("/cancel/:username", async (req, res) => {
  const { username } = req.params; // Extract username from URL

  try {
    // Check if user has an active booking
    const userBooking = await pool.query("SELECT * FROM parking_slots WHERE booked_by = $1", [username]);

    if (userBooking.rows.length === 0) {
      return res.status(400).json({ message: "No active booking found" });
    }

    // Remove the booking
    await pool.query("UPDATE parking_slots SET is_booked = false, booked_by = NULL WHERE booked_by = $1", [username]);

    return res.json({ message: "Booking cancelled successfully" });
  } catch (error) {
    console.error("Error cancelling booking:", error);
    res.status(500).json({ message: "Server error" });
  }
});



module.exports = router;
