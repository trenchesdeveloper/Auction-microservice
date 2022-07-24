import AWS from "aws-sdk";
import creatError from "http-errors";
import commonMiddleware from "../lib/commonMiddleware";

const dynamodb = new AWS.DynamoDB.DocumentClient();

export async function getAuctionById(id) {
  let auction;
  try {
    const result = await dynamodb
      .get({
        TableName: process.env.AUCTIONS_TABLE_NAME,
        Key: { id },
      })
      .promise();

    auction = result.Item;

    if (!auction) {
      throw new creatError.NotFound(`Auction with id ${id} not found`);
    }

    return auction;
  } catch (error) {
    console.log(error);
    throw new creatError.InternalServerError(error);
  }
}

async function getAuction(event, context) {
  const { id } = event.pathParameters;

    const auction = await getAuctionById(id);

  return {
    statusCode: 200,
    body: JSON.stringify(auction),
  };
}

export const handler = commonMiddleware(getAuction);
