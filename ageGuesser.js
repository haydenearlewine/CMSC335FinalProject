// Import required modules
require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');

const app = express();

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Constants
const PORT = process.env.PORT || 3000; // Render will set PORT
const MONGODB_URI = process.env.MONGODB_URI;

// MongoDB connection
mongoose
  .connect(MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Connected to MongoDB'))
  .catch((err) => {
    console.error('Error connecting to MongoDB:', err);
    process.exit(1); // Exit process if the database connection fails
  });

// Define routes
app.get('/', (req, res) => {
  res.send('Welcome to the Age Guesser App!');
});

// Example POST endpoint (for testing purposes)
app.post('/predict-age', (req, res) => {
  const { name, birthYear } = req.body;

  if (!name || !birthYear) {
    return res.status(400).send('Missing required fields: name or birthYear');
  }

  const currentYear = new Date().getFullYear();
  const predictedAge = currentYear - birthYear;

  res.status(200).json({
    message: `Hello, ${name}! Based on your birth year, your predicted age is ${predictedAge}.`,
  });
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
