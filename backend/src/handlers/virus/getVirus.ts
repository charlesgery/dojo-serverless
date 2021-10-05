import { APIGatewayProxyHandler } from 'aws-lambda';
import uuid from 'uuid';

import { success } from '@libs/response';

export const main: APIGatewayProxyHandler = async (event) => {


    console.log(event);

    if(event.queryStringParameters){
        if('id' in event.queryStringParameters){
            return(success([{ id: event.queryStringParameters.id}]));
        }
    }

    return(success(
        [
            { id: uuid() },
            { id: uuid() },
            { id: uuid() },
            { id: uuid() },
        ]
    ));

  };
