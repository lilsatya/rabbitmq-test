const amqp = require('amqplib/callback_api');

amqp.connect('amqp://localhost', (err, connection) => {
  if (err) {
    throw err;
  }

  connection.createChannel((err, channel) => {
    if (err) {
      throw err;
    }

    const queue = 'task_queue';

    channel.assertQueue(queue, {
      durable: false
    });

    console.log(' [*] Waiting for message in %s. to exit press CTRL+C', queue);
    channel.prefetch(1);
    channel.consume(queue, msg => {
      const secs = msg.content.toString().split('.').length - 1;

      console.log(' [x] Received %s', msg.content.toString());
      setTimeout(() => {
        console.log(' [x] Done');
        channel.ack(msg);
      }, secs * 1000)
    }, {
      noAck: false,
    });
  })
})
