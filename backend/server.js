
const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');

const app = express();
app.use(cors());
app.use(express.json());

const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'parkease', 
  password: process.env.DB_PASSWORD || '222414',
  port: process.env.DB_PORT || 5432,
});


app.get('/check-id/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query('SELECT entrytime FROM bookings WHERE parkslot = $1', [id]);
    if (result.rows.length > 0) {
      res.json({ valid: true, entrytime: result.rows[0].entrytime });
    } else {
      res.json({ valid: false });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

app.get('/check-and-delete/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query('SELECT entrytime FROM bookings WHERE parkslot = $1', [id]);

    if (result.rows.length > 0) {
      const entryTime = result.rows[0].entrytime;
      console.log(entryTime);
      res.json({ valid: true, entrytime: entryTime });

      setTimeout(async () => {
        await pool.query('DELETE FROM bookings WHERE parkslot = $1', [id]);
        console.log(`Deleted entry with id: ${id}`);
      }, 1000); // 1-second delay

    } else {
      res.json({ valid: false });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});


const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
