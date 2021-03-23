const amqp = require('amqplib/callback_api');

const fibonacci = (n) => {
  if (n === 0 || n === 1) {
    return n;
  } else {
    return fibonacci(n - 1) + fibonacci(n - 2);
  }
}

const args = process.argv.slice(2);
if (args.length === 0) {
  console.log('Usage: node 5.receive_logs_topic.js <facility>.<severtity>');
}

amqp.connect('amqp://localhost', (err, connection) => {
  if (err) {
    throw err;
  }

  connection.createChannel((err, channel) => {
    if (err) {
      throw err;
    }

    const queue = 'rpc_queue';

    channel.assertQueue(queue, {
      durable: false
    });


    channel.prefetch(1);
    console.log(' [*] Waiting for RPC Request in %s. to exit press CTRL+C', q.queue);

    channel.consume(q.queue, msg => {
      const n = parseInt(msg.content.toString());

      console.log(' [.] fib(%d)', n);

      const r = fibonacci(n);

      channel.sendToQueue(msg.properties.replyTo,
        Buffer.from(r.toString()), {
          correlationId: msg.properties.correlationId
        }
      );

      channel.ack(msg);
    });
  })
})
