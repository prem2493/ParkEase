const express = require('express');
const http = require('http'); 
const { Server } = require('socket.io'); 
const cors = require('cors');

const authRoutes = require('./authroutes'); 
const parkingRoutes = require('./parking');

const app = express();

// Middleware
app.use(express.json());
app.use(cors({
  origin: 'http://localhost:5173', 
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  credentials: true, 
}));

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: 'http://localhost:5173',
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

parkingRoutes.setIo(io);

app.use('/auth', authRoutes);
app.use('/parking', parkingRoutes);

const PORT = process.env.PORT || 5001;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});