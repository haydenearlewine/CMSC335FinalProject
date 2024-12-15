require('dotenv').config(); 
const express = require('express');
const { MongoClient } = require('mongodb');

const app = express();


app.use(express.json());
app.use(express.urlencoded({ extended: true }));


const PORT = process.env.PORT || 3000; 
const MONGO_URI = process.env.MONGO_CONNECTION_STRING;


const client = new MongoClient(MONGO_URI);
let db; 

async function connectDB() {
  try {
    await client.connect();
    db = client.db(); 
    console.log('Connected to MongoDB');
  } catch (err) {
    console.error('Error connecting to MongoDB:', err);
    process.exit(1); 
  }
}


app.get('/', (req, res) => {
  res.send('Welcome to the Age Guesser App!');
});


app.get('/users', async (req, res) => {
  try {
    const users = await db.collection('users').find().toArray();
    res.json(users);
  } catch (err) {
    console.error('Error fetching users:', err);
    res.status(500).send('Error fetching users');
  }
});


app.post('/users', async (req, res) => {
  try {
    const user = req.body; 
    const result = await db.collection('users').insertOne(user);
    res.status(201).json({ message: 'User added', id: result.insertedId });
  } catch (err) {
    console.error('Error adding user:', err);
    res.status(500).send('Error adding user');
  }
});

app.post('/predict-age', (req, res) => {
  try {
    const { name, birthYear } = req.body;
    if (!name || !birthYear) {
      return res.status(400).send('Missing required fields: name or birthYear');
    }
    const currentYear = new Date().getFullYear();
    const predictedAge = currentYear - birthYear;
    res.json({ name, predictedAge });
  } catch (err) {
    console.error('Error predicting age:', err);
    res.status(500).send('Error predicting age');
  }
});

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
});
