const express = require("express");
const router = express.Router();
const { Pool } = require("pg");
const { Server } = require('socket.io');
const pool = new Pool({
    connectionString: "postgresql://neondb_owner:npg_oTga8PRHvjZ3@ep-twilight-morning-a1bzekb2-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require",
    ssl: { rejectUnauthorized: false },
});

let io; 
const setIo = (socketIo) => {
  io = socketIo;
};

router.get("/", async (req, res) => {
    try {
        const result = await pool.query("SELECT * FROM parking_slots ORDER BY spot_number");
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.get("/areas", async (req, res) => {
    try {
        const result = await pool.query("SELECT * FROM parking_spaces");
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.get('/slots/:areaId', async (req, res) => {
    try {
      const slots = await pool.query(
        `SELECT * FROM slots WHERE parking_space_id = ${req.params.areaId}`
      );
      res.json(slots.rows);
    } catch (error) {
        console.error("Error fetching slots:", error); 
      res.status(500).json({ error: error.message });
    }
  });


router.post('/book', async (req, res) => {
    const { spot_number, username } = req.body;
    console.log('Received book request for spot:', spot_number, 'by:', username);
    try {
      await pool.query('BEGIN');
  
      const spotCheck = await pool.query('SELECT * FROM slots WHERE id = $1 FOR UPDATE', [spot_number]);
      if (!spotCheck.rows.length || spotCheck.rows[0].reserved) {
        await pool.query('ROLLBACK');
        return res.status(400).json({ message: 'Spot is already booked or does not exist' });
      }
  
      await pool.query('UPDATE slots SET reserved = TRUE WHERE id = $1', [spot_number]);
      await pool.query('INSERT INTO bookings (parkslot, booked_by) VALUES ($1, $2)', [spot_number, username]);
  
      await pool.query('COMMIT');
  
      if (io) {
        const updatedSpot = { spot_number, reserved: true, username };
        io.emit('bookingUpdate', updatedSpot);
        console.log('Emitted bookingUpdate:', updatedSpot);
      }
  
      res.json({ message: 'Booking successful', spot_number });
    } catch (err) {
      await pool.query('ROLLBACK');
      console.error('Error booking spot:', err);
      res.status(500).json({ error: err.message });
    }
  });

router.get("/user-bookings/:username", async (req, res) => {
    const { username } = req.params;
    try {
        const result = await pool.query("SELECT * FROM bookings WHERE booked_by = $1", [username]);
        if (result.rows.length === 0) {
            return res.json([]);
        }
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.delete("/cancel/:username/:spot_number", async (req, res) => {
    const { username, spot_number } = req.params;
    try {
        // Check if the user has booked this specific spot
        const userBooking = await pool.query(
            "SELECT * FROM bookings WHERE booked_by = $1 AND id = $2",
            [username, spot_number]
        );

        // Remove only the selected booking
        await pool.query(
            "UPDATE slots SET reserved = FALSE, booked_by = NULL WHERE id = $1",
            [spot_number]
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
module.exports.setIo = setIo;