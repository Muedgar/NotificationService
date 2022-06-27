const mongoose = require("mongoose");

const notificationRequest = new mongoose.Schema({
    message: {
        type: String,
        required: true
    },
    contacts: {
        type: Object,
        required: true
    }
});

const notificationModel = mongoose.model('notificationmodel', notificationRequest);

module.exports = notificationModel;