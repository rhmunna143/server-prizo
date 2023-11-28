const express = require('express');
const app = express()
const cors = require('cors');
require('dotenv').config()
const mongoose = require('mongoose');

const port = process.env.PORT || 5000;

// middleman
app.use(cors({
    origin: [
        process.env.LOCAL
    ],
    credentials: true,
}))
app.use(express.json())

// uri
// const uri = process.env.URI;

const uri = process.env.LOCAL_URI;

// mongoose db connect
mongoose.connect(uri)

const db = mongoose.connection.useDb("prizoDB");
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', () => {
    console.log('Connected to MongoDB');
});

// Define a Mongoose Schema
const userSchema = new mongoose.Schema({
    DisplayName: String,
    email: String,
    uid: String,
    photoURL: String,
    role: String,
    password: String,
});

const User = mongoose.model("User", userSchema);


// contest schema
const contestSchema = new mongoose.Schema({
    contestName: String,
    image: String,
    description: String,
    prize: String,
    prizeMoney: Number,
    submissionDetails: String,
    deadline: Date,
    contestCreator: String,
    creatorUid: String,
    participants: Number,
    status: String,
    tag: String
})

const Contest = mongoose.model("contest", contestSchema);

// root directory
app.get("/", (req, res) => {

    res.status(200).send("prizo server is walking...");
})



// users

// post user
app.post("/users", async (req, res) => {
    try {
        const user = req.body;
        const uid = user.uid;
        const isExist = await User.findOne({ uid: uid })

        if (isExist) {
            return res.status(202).send({ success: "already exist", exist: true })
        }
        const newUser = new User(user);

        const savedUser = await newUser.save();

        res.status(201).send(savedUser);
    }
    catch (err) {
        res.status(500).send(err);
    }
})

// get users
app.get("/users", async (req, res) => {
    try {
        const users = await User.find({});
        res.status(200).send(users);
    } catch (err) {
        res.status(500).send(err);
    }
})

// get single users
app.get("/users/:uid", async (req, res) => {
    try {
        const uid = req.params.uid;
        const user = await User.findOne({ uid: uid });
        res.status(200).send(user);
    } catch (err) {
        res.status(500).send(err);
    }
})




// contests

// post contest
app.post("/contests", async (req, res) => {
    try {
        const contest = req.body;
        const newContest = new Contest(contest);

        const savedContest = await newContest.save();

        res.status(201).send(savedContest);
    }
    catch (err) {
        res.status(500).send(err);
    }
})

// get contests
app.get("/contests", async (req, res) => {
    try {
        const contests = await Contest.find({});

        res.status(200).send(contests);
    } catch (error) {
        res.status(500).send(error);
    }
})

// get creator contests
app.get("/contest", async (req, res) => {
    try {
        const uid = req.query.uid;
        const contests = await Contest.find({ creatorUid: uid });

        res.status(200).send(contests);
    } catch (error) {
        res.status(500).send(error);
    }
})

// get single contest
app.get("/contests/:id", async (req, res) => {
    try {
        const id = req?.params?.id;

        const contest = await Contest.findById(id);

        res.status(200).send(contest);
    } catch (error) {
        res.status(500).send(error);
    }
})

// patch contest
app.patch("/contest", async (req, res) => {
    try {
        const id = req.query.id;
        const updateContest = req.body;

        const updatedContest = await Contest.findByIdAndUpdate(id, updateContest, { new: true })

        if (!updatedContest) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.status(200).json(updatedContest);

    } catch (error) {
        res.status(500).send(error);
    }
})

// get single contest and delete
app.delete("/contests/delete/:id", async (req, res) => {
    try {
        const id = req?.params?.id;

        const contest = await Contest.findByIdAndDelete({ _id: id })

        res.status(200).send(contest);
    } catch (error) {
        res.status(500).send(error);
    }
})

// server listener
app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})