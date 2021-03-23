const amqp = require('amqplib/callback_api');

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

    const exchange = 'topic_logs';

    channel.assertExchange(exchange, 'topic', {
      durable: false
    });

    channel.assertQueue('', {
      exclusive: true
    }, (err, q) => {
      if (err) {
        throw err;
      }

      console.log(' [*] Waiting for message in %s. to exit press CTRL+C', q.queue);

      args.forEach(key => {
        channel.bindQueue(q.queue, exchange, key);
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
