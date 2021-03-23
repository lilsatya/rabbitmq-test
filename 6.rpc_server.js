const amqp = require('amqplib/callback_api');

const fibonacci = (n) => {
  if (n === 0 || n === 1) {
    return n;
  } else {
    return fibonacci(n - 1) + fibonacci(n - 2);
  }
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
    console.log(' [*] Waiting for RPC Request in %s. to exit press CTRL+C', queue);

    channel.consume(queue, msg => {
      const n = parseInt(msg.content.toString());

      console.log(' [.] fib(%d)', n);

      const r = {
        fib: fibonacci(n),
        correlationId: msg.properties.correlationId
      }

      channel.sendToQueue(msg.properties.replyTo,
        Buffer.from(JSON.stringify(r)), {
          correlationId: msg.properties.correlationId
        }
      );

      channel.ack(msg);
    });
  })
})
