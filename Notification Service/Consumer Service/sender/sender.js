const amqp = require("amqplib/callback_api");

/*

  notification: {
    mes: 'Redis notification',
    data: '[{"Email":"user1@gmail.com","PhoneNumber":"0788440033"},{"Email":"user1@gmail.com","PhoneNumber":"0788440034"},{"Email":"user1@gmail.com","PhoneNumber":"0788440035"},{"Email":"user1@gmail.com","PhoneNumber":"0788440036"},{"Email":"user1@gmail.com","PhoneNumber":"0788440037"},{"Email":"user1@gmail.com","PhoneNumber":"0788440038"},{"Email":"user1@gmail.com","PhoneNumber":"0788440039"},{"Email":"user1@gmail.com","PhoneNumber":"0788440040"},{"Email":"user1@gmail.com","PhoneNumber":"0788440041"}]'
  }
*/ 
/*
in sender function queue messages.
don't change input
*/

process.on("message", message=>{
    const jsonResponse = sender(message.notification);
    setTimeout(() => {
        process.send(jsonResponse);
        process.exit();
    }, 2000);
});
function sender(notification) {
    let choice = "true";
    // send message queue in rabbitmq.
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
        // Assert Queue
        const QUEUE = 'message1';
        channel.assertQueue(QUEUE);

        /// edit inpu
        // const messageQUE = {
        //     message: "this",
        //     contacts: {
        //        contact: {
        //             email: 'email@gmail.com',
        //             phone: '2309=1323'
        //         }
        //     }
        // };
        // notification= {
        //     mes: 'Redis notification',
        //     data: '[{"Email":"user1@gmail.com","PhoneNumber":"0788440033"},{"Email":"user1@gmail.com","PhoneNumber":"0788440034"},{"Email":"user1@gmail.com","PhoneNumber":"0788440035"},{"Email":"user1@gmail.com","PhoneNumber":"0788440036"},{"Email":"user1@gmail.com","PhoneNumber":"0788440037"},{"Email":"user1@gmail.com","PhoneNumber":"0788440038"},{"Email":"user1@gmail.com","PhoneNumber":"0788440039"},{"Email":"user1@gmail.com","PhoneNumber":"0788440040"},{"Email":"user1@gmail.com","PhoneNumber":"0788440041"}]'
        //   }
        // send message to queue
        console.log("This is notification Before Sending");
        
        let dataSent = JSON.stringify(notification);
        channel.sendToQueue(QUEUE, Buffer.from(dataSent));
        console.log(`Message sent: ${QUEUE}`);
    });
}); // asynchronous message queueing protocal
return {message: choice};
};