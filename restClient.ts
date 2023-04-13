import axios from 'axios';
import config from "./config";
import {StatusCodes} from "http-status-codes";
import {RestMethodType} from "./dto/type";

export class RestClient {
    private static apiAdd = config.apiGatewayAddress;

    static async sendApiRequest<Type>(endPoint: string, method: RestMethodType = RestMethodType.GET, data: any={}): Promise<Type|void>{
        try {
            const req:any = {
                method,
                url:`${RestClient.apiAdd}/${endPoint}`,
                data
            }
            const result = await axios(req);
            if ((result.status === StatusCodes.OK || result.status === StatusCodes.CREATED || result.status === StatusCodes.ACCEPTED)) {
                return typeof result.data.data !== 'undefined' ? result.data.data: null;
            }

            console.log(`api-gateway response from endpoint: ${endPoint} field with code: ${result.status}`);
            console.log(result.data.status);
        } catch (e) {
            console.error(`don't able to get response from api-gateway properly in endpoint: ${endPoint}`);
            console.error(`---------------- parameters ---------------`);
            console.error(data);
            console.error(e);
        }
    }
}