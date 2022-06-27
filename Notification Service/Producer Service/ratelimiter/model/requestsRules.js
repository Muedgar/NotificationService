const mongoose = require("mongoose");

const requestRuleSchema = new mongoose.Schema({
    softwareLimit: {
        type: String,
        required: true
    },
    monthlyLimit: {
        type: String,
        required: true
    },
    timeWindowLimit: {
        type: String,
        required: true
    }
});

const requestRules = mongoose.model('requestRules', requestRuleSchema);

module.exports = requestRules;