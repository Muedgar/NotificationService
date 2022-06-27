const redis = require("redis");
const rulesData = require("../retriever/rulesRetriever");

let client = redis.createClient();
// let startClient = async()=> {
//     await client.connect();
// }
// startClient();
client.on('connect', () => {
    console.log('Connected to Redis...');
});

module.exports.storerulesDataInCacheMemory = async ()=> {
   const data = rulesData();
   /// replace the request data in cache with new data.

   client.hmset("rulesCache", [
    'data', JSON.stringify(data)
],function(err, reply) {
    if(err) {
        console.log(err);
    }
    console.log(reply);
});

};



