const requestsRecord = require("./requestsRecord");
const mongoose = require("mongoose");
class crudRequestRecord {
    async createRequestRecord(userRecords, requestTimeStamp, requestStatus) {
       const result = await requestsRecord.create({userRecords, requestTimeStamp, requestStatus});
       if(result) {
        return "request recorded successfully";
       }else {
           throw new Error("something went wrong");
       }
    }
    async getRequestRecord() {
        let data;
        // create connection first.
        await mongoose.connect(process.env.MONGO_URI).then(async d=> {
            console.log("database connected");
            await requestsRecord.find({}).then(d=>{
                
                    data = d;
                   
            }).catch(e=>{
                console.log(e);
            });
        }).catch(e=>{
            console.log(e);
        });
        if(data!=undefined) {
            return data;
        }else if(data==undefined) {
            return "couldn't find data";
        }else {
            throw new Error("something went wrong");
        }
    }
}

module.exports = crudRequestRecord;