const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config()

const app = express()
const port = process.env.PORT || 5000;

// middleman
app.use(express.json())
app.use(cors())

// uri
const uri = process.env.URI;

// mongoose db connect
mongoose.connect(uri)

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', () => {
    console.log('Connected to MongoDB');
});

// Define a Mongoose Schema
const userSchema = new mongoose.Schema({
    name: String,
    email: String,
    uid: String,
    dpUrl: String,
});

const User = mongoose.model('User', userSchema);

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})