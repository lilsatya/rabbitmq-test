const amqp = require('amqplib/callback_api');

amqp.connect('amqp://localhost', (err, connection) => {
  if (err) {
    throw err;
  }

  connection.createChannel((err, channel) => {
    if (err) {
      throw err;
    }

    const exchange = 'direct_logs';
    const args = process.argv.slice(2);

    channel.assertExchange(exchange, 'direct', {
      durable: false
    });

    channel.assertQueue('', {
      exclusive: true
    }, (err, q) => {
      if (err) {
        throw err;
      }

      console.log(' [*] Waiting for message in %s. to exit press CTRL+C', q.queue);

      args.forEach(severity => {
        channel.bindQueue(q.queue, exchange, severity);
      });
      

      channel.consume(q.queue, msg => {
        if (msg.content) {
          console.log(' [x] %s: %s', msg.fields.routingKey, msg.content.toString());
        }
      }, {
        noAck: false,
      });
    })
  })
})
