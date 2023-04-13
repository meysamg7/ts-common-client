import {DataSource, EntityTarget, MongoEntityManager} from "typeorm";
import config from "./config";
import {MongoConnectionOptions} from "typeorm/driver/mongodb/MongoConnectionOptions";

// @ts-ignore
const databaseConfig: MongoConnectionOptions = {
    type: "mongodb",
    logging: ["error","query"],
    ...config.mongoDB,
    // url: 'mongodb://mongerNft:MedfkNfjt%408!fEe@localhost:27027/?authSource=admin&readPreference=primary&appname=MongoDB%20Compass&ssl=false'
};
export class MongoClient {
    private static dataSource: DataSource;
    private static mongoManager: MongoEntityManager | PromiseLike<MongoEntityManager>;

    static async init(): Promise<void> {
        if (typeof MongoClient.dataSource === 'undefined' || !MongoClient.dataSource.isInitialized) {
            MongoClient.dataSource = new DataSource(databaseConfig);
            await MongoClient.dataSource.initialize();
            console.log("Connected to mongoDB successfully");
        }
        MongoClient.mongoManager = await MongoClient.dataSource.mongoManager;
    }

    static getManager(): MongoEntityManager{
        return MongoClient.mongoManager as MongoEntityManager;
    }

    static getRepository<T>(entity: EntityTarget<T>) {
        return MongoClient.dataSource.getMongoRepository(entity)
    }
}