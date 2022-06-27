const amqp = require("amqplib/callback_api");
const Vonage = require('@vonage/server-sdk');
const sendgrid = require('@sendgrid/mail');
require("dotenv").config();
const vonage = new Vonage({
    apiKey: "57fa99ea",
    apiSecret: "OkfgywM7TmTAha4v"
  });
  //ttestemailsendinglastname@gmail.com
sendgrid.setApiKey('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');

// create connection
amqp.connect('amqp://localhost', (connError, connection)=> {
    if(connError) {
        throw connError;
    }
    // create channel
    connection.createChannel((channelError, channel)=> {
        if(channelError) {
            throw channelError;
        }
         // assert queue
         // Assert Queue
        const QUEUE = 'message1';
        channel.assertQueue(QUEUE);
        // receive message
        channel.consume(QUEUE, (msg)=> {
            console.log('Message received');
            let content = msg.content.toString();
            let parsedContent = JSON.parse(content);
            let message = parsedContent['mes'];
            let contacts = JSON.parse(parsedContent['data']);
            console.log(message);
            console.log(contacts);
            ////////////////////////
            ///FOR EACH EMAIL AND PHONE NUMBER SEND EMAIL AND NOTIFICATION.
            setTimeout(() => {
                if(message.length>0) {
                    for(let i=0;i<contacts.length;i++) {
                        let keysObj = Object.keys(contacts[i]);
                        let email = contacts[i][keysObj[0]];
                        /////// send email notification
                        let messageToSend = message;
                        let sendEmailNotification = async () => {
                            let msg = {
                                to: email,
                                from: "lidybachelorsfinalproject2022@gmail.com",
                                subject: "Notication",
                                text: `${messageToSend} Text goes here`,
                                html: `<h1>Notification Message: ${messageToSend}</h1>`
                            };
                            sendgrid.send(msg);
                        }

                        sendEmailNotification();
                        /////// send phone notification
                        
                    }
                













                // for(let i=0;i<contacts.length;i++) {
                //     let keysObj = Object.keys(contacts[i]);
                //     let phone = contacts[i][keysObj[1]];
                    
                //     /////// send phone notification
                //     let sendPhoneNotification = async () => {
                //         let from = "NT Services";
                //         let to = phone;
                //         let text = message;
                        
                //        vonage.message.sendSms(from, to, text, (err, responseData) => {
                //            console.log(from,to,text);
                //             if (err) {
                //                 console.log(err);
                //             } else {
                //                 if(responseData.messages[0]['status'] === "0") {
                //                     console.log("Message sent successfully.");
                //                 } else {
                //                     console.log(`Message failed with error: ${responseData.messages[0]['error-text']}`);
                //                 }
                //             }
                //         });
                //     }
                //     sendPhoneNotification();
                // }
                }
            }, 1000);
            /////////////////////////
           
            console.log("input above");
        }, {
            noAck: true
        });
    });
    });
