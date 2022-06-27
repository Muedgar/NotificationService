const mongoose = require("mongoose");

const currentUser3 = new mongoose.Schema({
    active: {
        type: String,
        required: true
    }
});

const activeUser = mongoose.model('activeUser3', currentUser3);

module.exports = activeUser;