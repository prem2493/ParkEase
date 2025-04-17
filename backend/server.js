
const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');

const app = express();
app.use(cors());
app.use(express.json());

const pool = new Pool({
  connectionString: "postgresql://neondb_owner:npg_oTga8PRHvjZ3@ep-twilight-morning-a1bzekb2-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require",
  ssl: { rejectUnauthorized: false } 
});


app.get('/check-id/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const t = new Date().toISOString();
    await pool.query('update bookings set entrytime = $2  where parkslot = $1',[id,t]);
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
    const result = await pool.query('SELECT entrytime FROM bookings WHERE parkslot=$1', [id]);

    if (result.rows.length > 0) {
      const entryTime = result.rows[0].entrytime;
      console.log(entryTime);
      res.json({ valid: true, entrytime: entryTime });

      setTimeout(async () => {
        await pool.query('DELETE FROM bookings WHERE parkslot = $1', [id]);
        console.log(`Deleted entry with id: ${id}`);
        await pool.query('UPDATE slots SET reserved = FALSE WHERE id=$1',[id]);
      }, 1000); // 1-second delay

    } else {
      res.json({ valid: false });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

app.get('/get-complaints', async (req, res) => {
  try {
    const result = await pool.query('SELECT id,username, complaint FROM complaints ORDER BY id');
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Database error" });
  }
});




const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
