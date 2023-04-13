import * as amqplib from 'amqplib';
import { Channel } from 'amqplib/callback_api';
import * as config from '../common/config';

export class RabbitmqClient {
  private static amqpChannel: Channel;
  private static retryCounter = 0;
  static async init(): Promise<void> {
    RabbitmqClient.retryCounter++;
    amqplib
      .connect(config.default().rabbitServer)
      .then((conn) => {
        console.log('[AMQP] connected');
        conn.on('error', (err) => {
          if (err.message !== 'Connection closing') {
            console.error('[AMQP] conn error', err.message);
          } else {
            console.error(err.message);
          }
        });
        conn.on('close', () => {
          console.error(
            `[AMQP] reconnecting in ${RabbitmqClient.retryCounter}s`,
          );
          return setTimeout(
            RabbitmqClient.init,
            RabbitmqClient.retryCounter * 1000,
          );
        });
        console.log('Connected to rabbitMq successfully');
        conn.createChannel().then((channel) => {
          RabbitmqClient.amqpChannel = channel;
          RabbitmqClient.retryCounter = 0;
        });
      })
      .catch((e) => {
        console.error('[AMQP] conn error: ', e.message);
        console.error(`[AMQP] reconnecting in ${RabbitmqClient.retryCounter}s`);
        return setTimeout(
          RabbitmqClient.init,
          RabbitmqClient.retryCounter * 1000,
        );
      });
  }

  static getChannel(): Channel {
    return RabbitmqClient.amqpChannel;
  }

  static consume<EventType>(
    queue: string,
    callback: (arg0: EventType) => void,
  ) {
    RabbitmqClient.amqpChannel.assertQueue(queue, {
      durable: true,
      // deadLetterExchange: 'DLX-COMMENTS',
      // messageTtl: 30000
    });

    RabbitmqClient.amqpChannel.consume(
      queue,
      (msg) => {
        if (msg) {
          // const secs: EventType = JSON.parse(msg.content.toString());
          // await callback(secs);
          // RabbitmqClient.amqpChannel.ack(msg);
          try {
            const secs: EventType = JSON.parse(msg.content.toString());
            RabbitmqClient.amqpChannel.ack(msg);
            callback(secs);
          } catch (e) {
            RabbitmqClient.amqpChannel.nack(msg, false, false);
            console.log(e);
          }
        }
      },
      {
        noAck: false,
      },
    );
  }
  static async sendToQueue<EventType>(
    queue: string,
    data: EventType,
  ): Promise<boolean> {
    await RabbitmqClient.amqpChannel.assertQueue(queue, {
      durable: true,
    });
    return RabbitmqClient.amqpChannel.sendToQueue(
      queue,
      Buffer.from(JSON.stringify(data)),
      {
        persistent: true,
      },
    );
  }
}
