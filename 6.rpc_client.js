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

    channel.assertQueue('', {
      exclusive: true
    }, (err, q) => {
      if (err) {
        throw err;
      }

      const correlationId = generateUUID();
      const num = parseInt(args[0]);

      console.log(' [x] Requesting fib(%d)', num);

      channel.consume(q.queue, msg => {
        if (msg.properties.correlationId === correlationId) {
          console.log(' [.] Got %s', msg.content.toString());
          setTimeout(() => {
            connection.close();
            process.exit(0);
          }, 500);
        }
      })
    });

    console.log(' [x] Sent %s: %s', key, msg);
  });

  
});