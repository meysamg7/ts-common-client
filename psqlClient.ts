import {DataSource, EntityTarget} from "typeorm";
import {PostgresConnectionOptions} from "typeorm/driver/postgres/PostgresConnectionOptions";
import config from "./config";

// @ts-ignore
const postgresDataSource: PostgresConnectionOptions = {
    type: "postgres",
    logging: ["error"],
    ...config.psqlDB
};

export class PsqlClient {
    private static dataSource: DataSource;

    static async init(): Promise<DataSource> {
        if (typeof PsqlClient.dataSource === 'undefined' || !PsqlClient.dataSource.isInitialized) {
            PsqlClient.dataSource = new DataSource(postgresDataSource);
            await PsqlClient.dataSource.initialize();
            console.log("Connected to psql db successfully");
        }
        return PsqlClient.dataSource;
    }

    static getRepository<T>(entity: EntityTarget<T>){
        return PsqlClient.dataSource.getRepository(entity);
    }
}