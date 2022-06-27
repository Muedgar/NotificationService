const crudRequestsRecord = require("../model/crudRequestsRecord");
module.exports.returnRequests = async() => {
    const data = await new crudRequestsRecord().getRequestRecord();
    if(data) {
        return data;
    }else {
        throw new Error("Something went wrong");
    }
}