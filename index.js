// Require the Express module and create an Express application
const express = require("express");
const app = express();

// Require the Mongoose module and import a model
const mongoose = require("mongoose");
const Song = require("./modules/model");
const mime = require('mime');

// Load environment variables from a .env file
require("dotenv").config();
const uri = process.env.DB_URI;
const PORT = process.env.PORT || 8081;

// Set the view engine to EJS
app.set('view engine', 'ejs');

// Use body-parser middleware to parse incoming request bodies
var bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({ extended: true }));

// Connect to a MongoDB database using Mongoose
mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true })
console.log("Connection established!");

// Define routes and their functionality
app.get('/css/style.css', (req, res) => {
  res.type('text/css');
  res.sendFile(__dirname + '/public/css/style.css');
});

// Get all songs and render them to the index view
app.get("/api/getall", async (req, res) => {
  try {
    const songs = await Song.find();
    res.render("index", { songs: songs });
  } catch (error) {
    res.status(500).json("Connection error");
    console.error(`Connection error: ${error.stack} on Worker process: ${process.pid}`);
  }
});

// Get a song by ID
app.get("/api/songs/:id", async function (req, res) {
  try {
    const song = await Song.findById(req.params.id);
    if (!song) {
      res.status(404).json({ error: "Song not found" });
    } else {
      res.json(song);
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Render a form to add a new song
app.get("/api/add", function (req, res) {
  const song = new Song();
  res.render('add', { song: song });
});

// Add a new song to the database
app.post("/api/add", (req, res) => {

  // Creates a new Song object and sets its properties based on the form data
  const song = new Song({
    title: req.body.title,
    artist: req.body.artist,
    year: req.body.year,
    img_url: req.body.img_url,
    url: req.body.url,
  });
// Saves the song to the database
  song.save()
    .then(() => {
      console.log('Song added to the database');
      res.redirect('/api/getall');
    })
    .catch(error => {
      console.log('Error adding song to the database', error);
      res.send('Error adding song to the database');
    });
});

// Render a form to update an existing song
app.get('/api/update/:id', async (req, res) => {
  // Finds a song by its ID in the database
  const song = await Song.findById(req.params.id);
  // Renders the 'update' template and passes in the song object as a parameter
  res.render('update', { song: song });
});

// Route to handle the form submission
app.post('/api/update/:id', async (req, res) => {
  try {
    const song = await Song.findById(req.params.id);
    // If the song is not found, returns a 404 status and message
    if (!song) {
      return res.status(404).send('Song not found');
    }

    // Updates the song object's properties based on the form data
    song.title = req.body.title;
    song.artist = req.body.artist;
    song.year = req.body.year;
    song.img_url = req.body.img_url;
    song.url = req.body.url;

    // Saves the updated song to the database
    song.save();

    console.log("Song updated: ", song);
    console.log("Update complete")

    //Redirecting to getall page
    res.redirect('/api/getall');

  } catch (err) {
    console.error(err);
    res.status(500).send('Internal server error');
  }
});

// Creates a GET endpoint for deleting a song by its ID
app.get('/api/delete/:id', async (req, res) => {
    const song = await Song.findById(req.params.id);
    console.log(song, req.params.id )

    // Renders the 'delete' template and passes in the song object as a parameter
    res.render('delete', { song });
  });
  
 // Route to handle the form submission
// Creates a POST endpoint for handling the delete form submission
  app.post('/api/delete/:id', async (req, res) => {
    // Deletes a song from the database based on its ID
    await Song.deleteOne({ _id: req.params.id });

    //Redirecting to getall page
    res.redirect('/api/getall');
  });

  app.get("*", function(req, res) {
    res.send("Cant find the requested page", 404);
  });

// Creating server by Express
app.listen(8081, function () {
    console.log("Listening port..." + PORT);
});