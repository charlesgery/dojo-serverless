// @ts-nocheck
import { DynamoDBStreamEvent } from 'aws-lambda';
import { Converter } from 'aws-sdk/clients/dynamodb';
import { getAllConnections } from '@libs/connections';
import { sendMessageToConnection } from '@libs/websocket';
import { Item } from '@libs/types';
import { Virus } from '../virus/types';
import { success } from '@libs/response';
import { DynamoDB } from 'aws-sdk';
import { ApiGatewayManagementApi } from 'aws-sdk';

const documentClient = new DynamoDB.DocumentClient();

const sendMessageToEachConnection = async (message: any): Promise<void> => {
    // TODO use sendMessageToConnection for each connection

    const { Items = [] } = await documentClient
    .query({
      TableName: 'dojo-serverless-table',
      KeyConditionExpression: 'partitionKey = :partitionKey',
      ExpressionAttributeValues: { ':partitionKey': 'Connection' },
    })
    .promise();


    const sendMessageToClient = async (url :string, connectionId: string, payload: string) => {
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
    };
  
    Items.forEach(connection => {
        sendMessageToClient(connection.endpoint, connection.sortKey, message);
    })
};

const isVirus = (item: Item): item is Virus => item.partitionKey === 'Virus';

export const main = async (event: DynamoDBStreamEvent): Promise<void> => {
    // TODO for each record, if it's an insertion of virus, sendMessageToEachConnection

    event.Records.forEach(record => {
      if(record.eventName === 'INSERT'){
        const item = DynamoDB.Converter.unmarshall(record.dynamodb?.NewImage);
        if(isVirus(item)){
          sendMessageToEachConnection(item.sortKey);
        } 
      }
    })

    return success({});
    
};
