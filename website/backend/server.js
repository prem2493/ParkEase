const express = require("express");
const cors = require("cors");
// require("dotenv").config();

const authRoutes = require("./authroutes");
const parkingRoutes = require("./parking");

const app = express();
app.use(express.json());
app.use(cors());

app.use("/auth", authRoutes);
app.use("/parking", parkingRoutes);

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));










