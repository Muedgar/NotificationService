const crudRules = require("../model/crudRules");
module.exports.returnRequests = async() => {
    const data = await new crudRules().getRequestRules();
    if(data) {
        return data;
    }else {
        throw new Error("Something went wrong");
    }
}