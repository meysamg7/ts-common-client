import * as amqplib from "amqplib";
import {Channel} from "amqplib/callback_api";
import {Point} from "@influxdata/influxdb-client";
import config from "../common/config";

export class RabbitmqClient {
    private static amqpChannel: Channel;
    private static retryCounter: number=0;
    static async init(): Promise<void> {
        RabbitmqClient.retryCounter++;
        amqplib.connect(config.rabbitmq.broker).then((conn)=>{
            console.log("[AMQP] connected");
            conn.on("error",(err) =>{
                if (err.message !== "Connection closing") {
                    console.error("[AMQP] conn error", err.message);
                } else {
                    console.error(err.message);
                }
            });
            conn.on("close", () => {
                console.error(`[AMQP] reconnecting in ${RabbitmqClient.retryCounter}s`);
                return setTimeout(RabbitmqClient.init, RabbitmqClient.retryCounter*1000);
            });
            console.log("Connected to rabbitMq successfully");
            conn.createChannel().then((channel) => {
                RabbitmqClient.amqpChannel = channel;
                RabbitmqClient.retryCounter=0;
            });
        }).catch((e)=>{
            console.error("[AMQP] conn error: ", e.message);
            console.error(`[AMQP] reconnecting in ${RabbitmqClient.retryCounter}s`);
            return setTimeout(RabbitmqClient.init, RabbitmqClient.retryCounter*1000);
        });
    }

    static getChannel(): Channel {
        return RabbitmqClient.amqpChannel;
    }

    static consume<EventType>(queue: string, callback: (arg0: EventType) => void){
        RabbitmqClient.amqpChannel.assertQueue(queue, {
            durable: true,
            // deadLetterExchange: 'DLX-COMMENTS',
            // messageTtl: 30000
        });

        RabbitmqClient.amqpChannel.consume(queue, (msg)=> {
            if(msg){
                // const secs: EventType = JSON.parse(msg.content.toString());
                // await callback(secs);
                // RabbitmqClient.amqpChannel.ack(msg);
                try {
                    const secs: EventType = JSON.parse(msg.content.toString());
                    RabbitmqClient.amqpChannel.ack(msg);
                    callback(secs);
                }catch (e){
                    RabbitmqClient.amqpChannel.nack(msg,false,false);
                    console.log(e);
                }
            }
        }, {
            noAck: false
        });
    }
    static async sendToQueue<EventType>(queue: string, data: EventType): Promise<void> {
        await RabbitmqClient.sendTextToQueue(queue, JSON.stringify(data))
    }
    static async sendTextToQueue(queue: string, data: string): Promise<void> {
        await RabbitmqClient.amqpChannel.assertQueue(queue, {
            durable: true
        });
        await RabbitmqClient.amqpChannel.sendToQueue(queue, Buffer.from(data), {
            persistent: true
        });
    }
    static async sendToInflux(point: Point): Promise<void>{
        const input = point.toLineProtocol();
        if(input)
            await RabbitmqClient.sendTextToQueue(config.rabbitmq.queues.influx,input)
    }
}