const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
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
    displayName: String,
    email: String,
    uid: String,
    photoURL: String,
    role: String
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

// payment records schema
const paymentSchema = new mongoose.Schema({
    chargeId: String,
    amount: Number,
    currency: String,
    uid: String,
    contestId: String,
    source: String,
    description: String,
    photoURL: String,
    contestId: String,
    winner: String,
    userName: String,
    contestName: String,
    image: String,
    task: String,
})

const Payment = mongoose.model("Payment", paymentSchema);

// root directory
app.get("/", (req, res) => {

    res.status(200).send("prizo server is walking...");
})

// payments related api
app.post("/create-charge", async (req, res) => {
    try {
        const uid = req.query.uid;
        const { contestId } = req.body;
        const payment = req.body;
        // save DB record here

        const newPayment = new Payment(payment)
        const savedPayment = await newPayment.save()

        if (savedPayment) {
            const pervious = await Contest.findById(contestId);
            const previousParticipants = pervious.participants;
            const newParticipants = { participants: previousParticipants + 1 }

            const updated = await Contest.findByIdAndUpdate(contestId, {
                $set: newParticipants
            }, { new: true })

            res.status(200).send({ success: true, message: "payment complete", savedPayment })
        }

        // const charge = await stripe.charges.create({
        //     amount: amount,
        //     currency: currency,
        //     source,
        //     description
        // })
    } catch (error) {
        res.status(202).send({ success: true, message: "payment done" })
    }
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

// delete user
app.delete("/users/delete/:uid", async (req, res) => {
    try {
        const uid = req.params.uid;
        console.log(uid);
        const deletedUser = await User.findOneAndDelete({ uid: uid });

        res.status(204).send(deletedUser);
    } catch (error) {
        res.status(500).send(error);
    }
})

// update user role
app.patch("/users/update/:uid", async (req, res) => {
    try {
        const uid = req.params.uid;

        const updateData = req.body;

        const updated = await User.findOneAndUpdate(
            { uid: uid },
            { $set: updateData },
            { new: true }
        );

        if (!updated) {
            return res.status(404).send({ success: false, message: "Not Found" })
        }

        res.status(200).send(updated);
    } catch (error) {
        res.status(500).send(error);
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

// top contests
app.get("/contests/top", async (req, res) => {
    try {
        const topContests = await Contest.find({ participants: { $gte: 0 } })
            .sort({ participants: -1 })
            .limit(8)

        res.status(200).send(topContests);
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