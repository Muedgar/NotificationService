const redis = require("redis");
const requestData = require("../retriever/requestRetriever");

let client = redis.createClient();
// let startClient = async()=> {
//     await client.connect();
// }
// startClient();
client.on('connect', () => {
    console.log('Connected to Redis...');
});

module.exports.storeRequestDataInCacheMemory = async ()=> {
   const data = requestData();
   /// replace the request data in cache with new data.

   client.hmset("requestCache", [
    'data', JSON.stringify(data)
],function(err, reply) {
    if(err) {
        console.log(err);
    }
    console.log(reply);
});

};



