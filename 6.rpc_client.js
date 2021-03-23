const amqp = require('amqplib/callback_api');

var args = process.argv.slice(2);

if (args.length == 0) {
  console.log('Usage: node 6.rpc_client.js num');
  process.exit(1);
}

const generateUUID = () => {
  return Math.random().toString() +
         Math.random().toString() +
         Math.random().toString();
}

amqp.connect('amqp://localhost', (err, connection) => {
  if (err) {
    throw err;
  }

  connection.createChannel((err, channel) => {
    if (err) {
      throw err;
    }

    const queue = 'rpc_client'

    channel.assertQueue(queue, {
      exclusive: false
    }, (err, q) => {
      if (err) {
        throw err;
      }

      const correlationId = generateUUID();
      const num = parseInt(args[0]);

      console.log(' [x] Requesting fib(%d), corID %s', num, correlationId);

      channel.consume(q.queue, msg => {
        if (msg.properties.correlationId === correlationId) {
          const data = JSON.parse(msg.content);
          console.log(' [.] Got %s, corID %s', data.fib, data.correlationId);
          setTimeout(() => {
            connection.close();
            process.exit(0);
          }, 500);
        }
      }, {
        noAck: false
      });

      channel.sendToQueue('rpc_queue',
        Buffer.from(num.toString()), {
          correlationId,
          replyTo: q.queue
        }
      );
    });

    
  });

  
});