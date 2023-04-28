// File: ./modules/model.js

// Require Mongoose
var mongoose = require("mongoose");

// Defining new schema
const SongSchema = new mongoose.Schema({

    title:  String,
    artist: String, 
    year: String,
    img_url: String,
    url: String,
});

// Exporting SongSchema
module.exports = mongoose.model('Song', SongSchema, 'musicData');