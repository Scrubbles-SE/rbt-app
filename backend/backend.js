import express from "express";
import cors from 'cors';
// import mongoose from 'mongoose';
import User from './models/user.js'
// const cors = require('cors');


const app = express();
const port = 8000;


app.use(cors());
app.use(express.json());




// Create a new entry for a user
app.post("/entries", async (req, res) => {
    try {
      const { user_id, rose_text, bud_text, thorn_text, is_public } = req.body;
 
      // Create a new entry
      const newEntry = new Entry({ user_id, rose_text, bud_text, thorn_text, is_public });
      await newEntry.save(); //saves new enty to Mongo
 
      // Update user's entries array
      await User.findByIdAndUpdate(user_id, { $push: { entries: newEntry._id } });
 
      res.status(201).json(newEntry);
    } catch (err) {
      res.status(500).json({ error: "Error creating journal entry" });
    }
  });


// flag
  // returns all entries by user ID
app.get("/users/:userId/entries", async (req, res) => {
    try {
      const entries = await Entry.find({ user_id: req.params.userId });
      res.json(entries);
    } catch (err) {
      res.status(500).json({ error: "Error fetching entries" });
    }
  });




// returns a specific entry by entry ID
app.get("/entries/:entryId", async (req, res) => {
    try {
      const entry = await Entry.findById(req.params.entryId).populate("user_id");
      if (!entry) return res.status(404).json({ error: "Entry not found" });
      res.json(entry);
    } catch (err) {
      res.status(500).json({ error: "Error fetching entry" });
    }
  });




  // DATE RBT?
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
  });


  function getFormattedDate() {
    const now = new Date();


    const options = {
        weekday: 'long',   // "Monday"
        year: 'numeric',   // "2023"
        month: 'long',     // "October"
        day: 'numeric',    // "30"
        hour: 'numeric',   // "10"
        minute: 'numeric', // "45"
        hour12: true       // "AM/PM" format
    };


    // Format the date according to the options
    return now.toLocaleDateString('en-US', options);
}


// Example usage
console.log(getFormattedDate()); // Output: "Monday, October 30, 2023, 10:45 AM"


