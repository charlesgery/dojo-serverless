import { APIGatewayProxyHandler } from 'aws-lambda';
import { DynamoDB } from 'aws-sdk';
import { ApiGatewayManagementApi } from 'aws-sdk';

import { success } from '@libs/response';
import uuid from 'uuid';

const documentClient = new DynamoDB.DocumentClient();

export const main: APIGatewayProxyHandler = async () => {

  const { Items = [] } = await documentClient
    .query({
      TableName: 'dojo-serverless-table',
      KeyConditionExpression: 'partitionKey = :partitionKey',
      ExpressionAttributeValues: { ':partitionKey': 'Connection' },
    })
    .promise();


  const sendMessageToClient = async (url :string, connectionId: string, payload: string) =>
  new Promise((resolve, reject) => {
    const apigatewaymanagementapi = new ApiGatewayManagementApi({
      apiVersion: '2018-11-29',
      endpoint: url,
    });
    apigatewaymanagementapi.postToConnection(
      {
        ConnectionId: connectionId, // connectionId of the receiving ws-client
        Data: JSON.stringify(payload),
      },
      (err, data) => {
        if (err) {
          console.log('err is', err);
          reject(err);
        }
        resolve(data);
      }
    );
  });

  Items.forEach(connection => {
      sendMessageToClient(connection.endpoint, connection.sortKey, uuid());
  })

  return success({ });

};
