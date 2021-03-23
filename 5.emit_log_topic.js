const amqp = require('amqplib/callback_api');

amqp.connect('amqp://localhost', (err, connection) => {
  if (err) {
    throw err;
  }

  connection.createChannel((err, channel) => {
    if (err) {
      throw err;
    }

    const exchange = 'topic_logs';
    const args = process.argv.slice(2);
    const key = args.length > 0 ? args[0] : 'anonymous.info';
    const msg = args.slice(1).join(' ') || 'Hello World!';

    channel.assertExchange(exchange, 'topic', {
      durable: false
    });
    channel.publish(exchange, key, Buffer.from(msg));

    console.log(' [x] Sent %s: %s', key, msg);
  });

  setTimeout(() => {
    connection.close();
    process.exit(0);
  }, 500);
});