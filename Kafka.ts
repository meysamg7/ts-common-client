import { Kafka, logLevel, Producer} from 'kafkajs';
import config from "./config";

export class StandAloneKafka {
  static kafka: Kafka;
  static producer: Producer;
  static async init(): Promise<Kafka> {
    StandAloneKafka.kafka = new Kafka({
      clientId: config.kafka.client,
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      brokers: config.kafka.brokers,
      logLevel: logLevel.ERROR,
      retry: {
        retries: 30,
      },
    });

    StandAloneKafka.producer = StandAloneKafka.kafka.producer();
    await StandAloneKafka.producer.connect();

    return StandAloneKafka.kafka;
  }

  static async sendMessage(topic: string, message: {key: any, value: any}) {
    StandAloneKafka.producer.send({
      topic,
      messages: [{
        key: `${message.key.toString()}`,
        value: JSON.stringify(message.value)
      }]
    }).catch(console.error)
  }
}
