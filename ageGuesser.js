const express = require('express');
const path = require("path");
const app = express();

const axios = require('axios');

require("dotenv").config({ path: path.resolve(__dirname, 'credentials/.env') }) 
const uri = process.env.MONGO_CONNECTION_STRING;
const databaseAndCollection = {db: "CMSC335_DB", collection:"ageGuesser"};
const { MongoClient, ServerApiVersion } = require('mongodb');


const client = new MongoClient(uri);
require('dotenv').config();


const PORT = process.env.PORT || 3000; 

app.set("views", path.resolve(__dirname, "templates"));
app.set("view engine", "ejs");
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/", (request, response) => {
    response.render("index");
});

app.get("/index", (request, response) => {
    response.render("index");
});

app.get("/reviewApplication", (request, response) => {
    response.render("reviewApplication");
});

app.post("/information", async (req, res) => {
    const { firstName, lastName, email, favoriteGame, realAge } = req.body;

    const apiUrl = `https://api.agify.io/?name=${encodeURIComponent(firstName)}`;

    try {
        const apiResponse = await axios.get(apiUrl);
        const predictedAgeFromApi = apiResponse.data.age || "Not available";

        const newEntry = {
            firstName,
            lastName,
            email,
            favoriteGame,
            realAge,
            predictedAge: predictedAgeFromApi
        };

        await client.connect();
        const result = await client.db(databaseAndCollection.db)
            .collection(databaseAndCollection.collection)
            .insertOne(newEntry);

        console.log(`Inserted document with _id: ${result.insertedId}`);

        const variables = {
            firstName: newEntry.firstName,
            lastName: newEntry.lastName,
            email: newEntry.email,
            favoriteGame: newEntry.favoriteGame,
            realAge: newEntry.realAge,
            predictedAge: newEntry.predictedAge
        };

        res.render("information", variables);
    } catch (error) {
        console.error('Error:', error);
        res.status(500).send("An error occurred. Please try again.");
    }
});

app.post("/clearDatabase", async (req, res) => {
    try {
        await client.connect();
        const result = await client.db(databaseAndCollection.db)
            .collection(databaseAndCollection.collection)
            .deleteMany({}); 

        console.log(`Deleted ${result.deletedCount} people from the collection.`);

        res.render("clearDatabase", { deletedCount: result.deletedCount });
    } catch (error) {
        console.error("Error clearing database:", error);
    } finally {
        await client.close(); 
    }
});
