const requestsRules = require("./requestsRules");
const mongoose = require("mongoose");
class crudRequestRules {
    async createRequestRules(softwareLimit, monthlyLimit, timeWindowLimit) {
       const result = await requestsRules.create({softwareLimit, monthlyLimit, timeWindowLimit});
       if(result) {
        return "request rules created successfully";
       }else {
           throw new Error("something went wrong");
       }
    }
    async getRequestRules() {

           let data;
        // create connection first.
        await mongoose.connect(process.env.MONGO_URI).then(async d=> {
            console.log("database connected");
            await requestsRules.find({}).then(d=>{
                
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

module.exports = crudRequestRules;