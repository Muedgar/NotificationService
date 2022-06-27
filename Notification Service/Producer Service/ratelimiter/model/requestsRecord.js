const mongoose = require("mongoose");

const requestRecord = new mongoose.Schema({
    userRecords: {
        type: String,
        required: true
    },
    requestTimeStamp: {
        type: String,
        required: true
    },
    requestStatus: {
        type: String,
        required: true
    }
});

const requestRecordExport = mongoose.model('requestRecordExport', requestRecord);

module.exports = requestRecordExport;