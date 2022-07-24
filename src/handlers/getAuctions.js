import AWS from "aws-sdk";
import middy from "@middy/core";
import httpJsonBodyParser from "@middy/http-json-body-parser";
import httpErrorHandler from "@middy/http-error-handler";
import httpEventNormalizer from "@middy/http-event-normalizer";
import creatError from "http-errors";

const dynamodb = new AWS.DynamoDB.DocumentClient();

async function getAuctions(event, context) {

    let auctions;
  try {
   const results = await dynamodb
      .scan({
        TableName: process.env.AUCTIONS_TABLE_NAME,
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

export const handler = middy(getAuctions)
  .use(httpJsonBodyParser())
  .use(httpErrorHandler())
  .use(httpEventNormalizer());
