/// import all methods 
const modelRequest = require('./model/crudRequestsRecord'); // for creating requests
const modelRules = require('./model/crudRules'); // for creating rules
//const cacheRequest = require('./redisAsCache/requestsCache'); // get requests
//const cacheRules = require('./redisAsCache/rulesCaches'); // get requests
const mongoose = require("mongoose");
const axios = require("axios");
const jwt = require("jsonwebtoken");
///
const redis = require("redis");
let client = redis.createClient();

client.on('connect', () => {
    console.log('Connected to Redis...');
});

const ratelimiter = async(req, res, next) => {
    /// Phase one get all data from cache
    ///Step 1: run cache methods to store current data in redis cache
    storeOneRecord();
    let currentRequestCache ;
    let currentRuleCache;
    let count = 0;
    // before anything else get data from database and set them in redis cache
    async function storeAllDataToCache() {
        
        await new modelRequest().getRequestRecord().then(d=>{
            // let dataa = d.data;
            // console.log(dataa);
            
            client.hmset("requestCache", [
                'data', JSON.stringify(d)
            ],function(err, reply) {
                if(err) {
                    console.log(err);
                }
                console.log("recorded data to cache" || d == [] || d == undefined);
                console.log(reply);
               
            });
        });
        await new modelRules().getRequestRules().then(d=>{
           
            // let data2 = d.data;
            client.hmset("rulesCache", [
                'data2', JSON.stringify(d)
            ],function(err, reply) {
                if(err) {
                    console.log(err);
                }
                console.log(reply);
                getAllDataFromCache();
            });
        });
        
    }
    storeAllDataToCache();
    
    function getAllDataFromCache() { //
        client.hgetall("requestCache",function(err, obj){
            if(!obj) {
                console.log("no data available");
                
            }else {
                let parsedObj = JSON.parse(obj.data); //JSON.parse(obj);
                currentRequestCache = parsedObj;
            }
        });

        client.hgetall("rulesCache",function(err, obj){
            if(!obj) {
                console.log("no data available");
                
                
            }else {
                let parsedObj = JSON.parse(obj.data2); //JSON.parse(obj);
                
                currentRuleCache = parsedObj;
                console.log("now implement a rate limiting algorithm using rules because data is available");
                console.log(currentRequestCache);
                /// the rate limiting algorithm
                // first of all get the current request infomation
                // id, status


                const token = req.cookies.jwt;

        
                // check json jwt exists & is verified
                if(token) {
                jwt.verify(token,'net ninja secret', (err, decodedToken) => {
                 if(err) {
                    console.log(err.message);
                 }else {
                    console.log("this is token id",decodedToken);
                    // get user information using axios request.
                    let user = "";
                    const getUser = async()=> {
                       await axios(`http://localhost:5000/oneUserInformation/${decodedToken.id}`).then(d=>{
                            user = d.data;
                            console.log(user);
                            console.log("Here is where I compare and decide");

                            /// First apply the Software Limit Rule
                            //// Apply Monthly Limit Rule
                            //// Apply time window limit rule

                            ////// Create obvious names of Current Request User data, Requests Data, Rules Data
                            let currentrequestuserdata = user;
                            let requestsdata = []; // related requests, requests of the same user.
                            function populateRequestsData() {
                                for(let i=0;i<currentRequestCache.length;i++) {
                                    if(currentRequestCache[i].userRecords == currentrequestuserdata.email) {
                                        requestsdata.push(currentRequestCache[i]);
                                    }
                                }
                            }
                            populateRequestsData();
                            let rulesdata = currentRuleCache;
                            console.log("decision data...");

                            console.log(currentrequestuserdata);
                            console.log(requestsdata);
                            console.log(rulesdata);
                            if(currentRequestCache.length>3000) {
                                res.status(429).json({status: "System has reached 3000 requests per month which is the limit"});
                            }
                            /// How the leaky bucket rate limiting algorithm would work. [for each specific user]
                            //// I would have to take the requestsdata, and start serving from the oldest, and removing them from the queue, until the queue is empty or at least not full to accept more requests.
                            /// In this case since all requests are allowed, there would be some kind of rejecting request depending on the ones that have been served according to time stamps and user tier, and over all limit of the system.
                            
                            // Advantages
                            /*
                            It smoothens burst of requests by processing them at a constant rate.
                            Easy to implement.
                            The size of the queue (buffer) used will be constant, hence it is memory efficient.
                            */
                           // Disadvantages
                           /*
                           A burst of traffic can fill-up the queue with old requests in a time slot and the new request might starve.
                           It provides no guarantee that requests will be processed in a fixed amount of time.
                           */

                           //// How the fixed window rate limiting algorithm would work. [for each specific user]
                           //// get all the requests that the current user requested in the time window usually 1 hour but for the sake of testing make the fixed window of 2 minutes
                           //// for each tier there will be a limit if the user has exceeded the limit the requests will get rejected
                           /*
                                softwareLimit: '3000',
                                monthlyLimit: '300 200 100',
                                timeWindowLimit: '10 5 3',
                           */
                          // Advantages
                          /*
                          It is easy to implement.
                          Less memory requirement since we are storing the only count in a given time window.
                          It ensures more recent requests get processed without being starved by old requests (as the counter resets after every window).
                          */
                         // Disadvantages
                         /*
                         A single burst of traffic that occurs near the boundary of a window can result in twice the rate of requests being processed. Suppose, that counter is empty 10 requests spikes arrive at 12:59, they will be accepted and again a 10 requests spike arrives at 1:00 since this is a new window and the counter will be set to 0 for this window. So even these requests will be accepted and sever is now handling 20 requests> 10 requests/ hour limit.
                         Many consumers waiting for a reset window(ex during peak hour like black Friday sale) can stampede our server at the same time
                         */

                         /// How the sliding window rate limiting algorithm would work. [for each specific user]
                         /*
                         limit = 100 requests/hour
                         // test business account 84 * ((60-15)/60) + 36; 
                            123business!@@123  businessemail1@gmail.com
                            123free!@@123      free1@gmail.com
                         // 
                            rate = 84 * ((60-15)/60) + 36
                                 = 84 * 0.75 + 36
                                 = 99

                            rate < 100
                            The first step is to allocate requests in 2 minutes time windows of the two last 4 minutes.
                            hence, we will accept this request.
                            84 is the requests processed in the last time window - 1
                            36 is the requests to process in the last time window
                            15 is different between the latest request time stamp and when the last window was supposed to finish
                            15 is the currentTime.getMinutes - upperLimit of the last window
                            rate is a measure to decide if the remaining 
                            100 is the tier limit.
                         */
                        // Advantages
                        /*
                        It smoothens the traffic spikes problem we had in the fixed window method, it is easy to implement.
                        It results in an approximate value, but the value is very closer to an accurate value ( an analysis on 400 million requests from 270,000 distinct sources shows only 0.003% of requests have been wrongly allowed)
                        It has very little memory usage: we need to store only 2 numbers per counter.
                        */
                       /////

                            /*
                            
                            before doing any limit monthly uses
                            step one get requests in the same month
                            step two check if they exceed limit according to tier
                            hard task: getting requests in the same month.
                            */
                       //////
                        let monthlyRequests = [];
                        let monthCurrent = new Date().toDateString().split(" ");
                        let monthC = monthCurrent[1];
                        function populateMonthlyRequests() {
                            for(let i=0;i<requestsdata.length;i++) { // for each request decide if the month is the same as monthlyTime's month
                                let rdata = requestsdata[i].requestTimeStamp.split(".");
                                let rrdata = rdata[0].split(" ");
                                let month = rrdata[1];
                                if(month == monthC) {
                                    monthlyRequests.push(requestsdata[i]);
                                }
                            }
                        }
                        populateMonthlyRequests();
                        console.log("These are monthly requests");
                        console.log(monthlyRequests);
                        if(currentrequestuserdata.tier == 'Business') {
                            if(monthlyRequests.length>300) {
                                res.status(429).json({status: "Business 300 requests per month is the limit"});
                                return;
                            }
                        }else if(currentrequestuserdata.tier == 'Professional') {
                            if(monthlyRequests.length>200) {
                                res.status(429).json({status: "Professional 200 requests per month is the limit"});
                                return;
                            }
                        }else if(currentrequestuserdata.tier == 'Free') {
                            if(monthlyRequests.length>100) {
                                res.status(429).json({status: "Free 100 requests per month is the limit"});
                                return;
                            }
                        }

                       /////////
                       let beforeLastTimeWindowRequests = [];
                       let lastTimeWindowRequests = [];
                       let eightFour = 0; // number
                       let thirtySix = 0; // number
                       let sixty = 1; // number
                       let fifteen = 0; // number
                       let aHundred = 0; // number
                       let time = new Date();
                       let rate = 0; // number to compare with aHundred
                       function populateBeforeLastTimeWindowRequests() {
                        /// use the fixed window algorithm to alocate the time window
                           // step 1: figure out the range
                        //find the range 
                        let fourMinutesAgo = time.getMinutes() - 2;
                        let twoMinutesAgo = time.getMinutes() - 1; 
                        let range = [fourMinutesAgo, twoMinutesAgo];
                        console.log(range);
                        // step 2: figure out for any request that has the same day and hour as of today, 
                                //the if that is the minutes range
                        for(let i=0;i<requestsdata.length;i++) {
                            let timeStamp = requestsdata[i].requestTimeStamp.split('.');

                            if(timeStamp[1]==time.getDay().toString()) {
                                if(timeStamp[2]==time.getHours().toString()) {
                                    // the find if minutes is in range
                                    if(Number(timeStamp[3])>=range[0] && Number(timeStamp[3])<=range[1]) {
                                        beforeLastTimeWindowRequests.push(requestsdata[i]);
                                    }
                                }
                            }
                        }

                        // find the requests  whose minutes are in this range
                        // for(let i=0;i<requestsdata.length;i++) {
                        //     let request = requestsdata[i];
                        //     /// 
                        // }
                       }
                       // run first populate function
                       populateBeforeLastTimeWindowRequests();
                       console.log("Testing Time Window 1");
                       console.log(beforeLastTimeWindowRequests);
                       let rangeLast = [];
                       function populateLastTimeWindowRequests() {
                           /// use the fixed window algorithm to alocate the time window
                            // step 1: figure out the range
                            //find the range 
                                let twoMinutesAgo = time.getMinutes() - 1;
                                let zeroMinutesAgo = time.getMinutes(); 
                                rangeLast = [twoMinutesAgo, zeroMinutesAgo];
                                console.log(rangeLast);
                            // step 2: figure out for any request that has the same day and hour as of today, 
                            //the if that is the minutes rangeLast
                                for(let i=0;i<requestsdata.length;i++) {
                                    let timeStamp = requestsdata[i].requestTimeStamp.split('.');

                                if(timeStamp[1]==time.getDay().toString()) {
                                    if(timeStamp[2]==time.getHours().toString()) {
                                        // the find if minutes is in rangeLast
                                        if(Number(timeStamp[3])>=rangeLast[0] && Number(timeStamp[3])<=rangeLast[1]) {
                                            lastTimeWindowRequests.push(requestsdata[i]);
                                            }
                                    }
                                }
                            }
                       }
                       // run second populate function
                       populateLastTimeWindowRequests();
                       console.log("Testing Window 1");
                       console.log(lastTimeWindowRequests);
                       function populateEightFour() {
                        eightFour = beforeLastTimeWindowRequests.length;
                       }
                       populateEightFour();
                       console.log(eightFour);
                       function populateThirtySix() {
                        thirtySix = lastTimeWindowRequests.length;
                       }
                       populateThirtySix();
                       console.log("sixty",thirtySix);
                       function populateFifteen() {
                        // 
                        /*
                        */
                        fifteen = time.getMinutes() - rangeLast[1];
                       }
                       populateFifteen();
                       console.log("fifteen",fifteen);
                       function populateAHundred() {
                           //'Free','Professional','Business'
                        if(currentrequestuserdata.tier == 'Business') {
                            aHundred = 5;
                        }else if(currentrequestuserdata.tier == 'Professional') {
                            aHundred = 4;
                        }else if(currentrequestuserdata.tier == 'Free') {
                            aHundred = 3;
                        }
                       }
                       populateAHundred();
                       console.log("a hundred",aHundred);
                       function populateRate() {
                           //84 * ((60-15)/60) + 36
                         rate = (eightFour * ((sixty-fifteen)/sixty)) + thirtySix; 
                       }
                       populateRate();
                       console.log("rate",rate);
                       // finish to run functions
                       // make decision.
                       if(rate<=aHundred) {
                        console.log("accepting request and calling next, calling next()");
                        next();
                       }else {
                           console.log("not processing anything at all because requests reached the maximum, returning res.status(429)");
                           res.status(429).json({status: `${aHundred} requests per 2 minutes is the limit`});
                           return;
                       }
                        });
                    };
                    getUser();
                  }
    
                });
             }


















                // next();
                ///// if all goes well this is where I implement the rate limiting algorithm.
            }
        });
    }

    async function storeOneRecord() {
        // check if data is present else return res
        /// if no data present at least create one record in both collections.
        // insert data in Cache memory
        
        // get user id from req
        
            const token = req.cookies.jwt;

        // check json jwt exists & is verified
        if(token) {
        jwt.verify(token,'net ninja secret', async (err, decodedToken) => {
            if(err) {
                console.log(err.message);
            }else {
                console.log("this is token id",decodedToken.id);
                let userRecords = ''; // store email

                /// get data
                await axios(`http://localhost:5000/oneUserInformation/${decodedToken.id}`).then(d=>{
                    console.log("Storing data", d.data)
                            let newData = d.data;
                            userRecords = newData.email;
            });

                // get request time stamp
                let time = new Date();
        const requestTimeStamp = time.toDateString() + "." + time.getDay() + "." + time.getHours() + "." + time.getMinutes();
        // set record status after deciding to serve request
        const requestStatus = "served";
        // store in request collection
       await new modelRequest().createRequestRecord(userRecords, requestTimeStamp, requestStatus).then(async d=>{
           let result = d.data;
           console.log("result",result);
        await new modelRules().createRequestRules("3000","300 200 100","10 5 3").then(d2=>{
            let result2 = d2.data;
            console.log("result2",result2);
            if(result == "request recorded successfully" && result2 == "request rules created successfully") {
                console.log("calling next after recording request");
                storeAllDataToCache();
                
               }else if(result != "request recorded successfully" && result2 != "request rules created successfully") {
                console.log("result", result);
                console.log("result2", result2);   
                // res.status(429).json({status: "failed to serve request"});
                   
               }
        });
       });
       
       
            }
        });
        }else {
        console.log("not able to get token");
        }  
    
    }

    
    //////
    /*
    what is a rate limiting 
    first of all select data from 
    */
    /////
    // setTimeout(() => {
    //     next();
    // }, 60000);
}

module.exports = {ratelimiter};