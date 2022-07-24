import AWS from "aws-sdk";
import creatError from "http-errors";
import commonMiddleware from "../lib/commonMiddleware";

const dynamodb = new AWS.DynamoDB.DocumentClient();

async function getAuctions(event, context) {
  let auctions;

  const { status } = event.queryStringParameters;
  try {
    const results = await dynamodb
      .query({
        TableName: process.env.AUCTIONS_TABLE_NAME,
        IndexName: "byStatusAndEndDate",
        KeyConditionExpression: "#status = :status",
        ExpressionAttributeValues: {
          ":status": status,
        },
        ExpressionAttributeNames: {
          "#status": "status",
        },
      })
      .promise();

    auctions = results.Items;
  } catch (error) {
    console.log(error);
    throw new creatError.InternalServerError(error);
  }

  return {
    statusCode: 200,
    body: JSON.stringify(auctions),
  };
}

export const handler = commonMiddleware(getAuctions);
