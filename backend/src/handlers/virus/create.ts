import { APIGatewayProxyHandler } from 'aws-lambda';
import { DynamoDB } from 'aws-sdk';

import { success } from '@libs/response';
import uuid from 'uuid';

const documentClient = new DynamoDB.DocumentClient();

export const main: APIGatewayProxyHandler = async () => {


  const virusId = uuid();

  await documentClient
    .put({
      TableName: 'dojo-serverless-table',
      Item: { partitionKey: 'Virus', sortKey: virusId },
    })
    .promise();



  return success({ id: virusId });

};
