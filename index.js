const express = require("express");
const cors = require("cors");
require("dotenv").config();

const PORT = process.env.PORT || 3000;
const app = express();

const corsOptions = {
  origin: process.env.CORS_ORIGIN,
  optionsSuccessStatus: 200,
};

// Import routers

// Import controllers

// Import db
const db = require("./db/models/index");

// Initialise controllers

// Initialise routers

// Enable CORS
app.use(cors(corsOptions));

// Set up middleware
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Use routers
app.get("/", (req, res) => {
  res.send("Hello, World!");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
