const amqp = require('amqplib/callback_api');

amqp.connect('amqp://localhost', (err, connection) => {
  if (err) {
    throw err;
  }

  connection.createChannel((err, channel) => {
    if (err) {
      throw err;
    }

    const exchange = 'logs';

    channel.assertExchange(exchange, 'fanout', {
      durable: false
    });

    channel.assertQueue('', {
      exclusive: true
    }, (err, q) => {
      if (err) {
        throw err;
      }

      console.log(' [*] Waiting for message in %s. to exit press CTRL+C', q.queue);
      channel.bindQueue(q.queue, exchange, '');

      channel.consume(q.queue, msg => {
        if (msg.content) {
          console.log(' [x] Received %s', msg.content.toString());
        }
      }, {
        noAck: false,
      });
    })
  })
})
