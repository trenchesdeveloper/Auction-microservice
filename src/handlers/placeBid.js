import AWS from "aws-sdk";
import creatError from "http-errors";
import validator from "@middy/validator";
import commonMiddleware from "../lib/commonMiddleware";
import { getAuctionById } from "./getAuction";
import placeBidSchema from "../lib/schemas/placeBidSchema";

const dynamodb = new AWS.DynamoDB.DocumentClient();

async function placeBid(event, context) {
  const { id } = event.pathParameters;
  const { amount } = event.body;

  const auction = await getAuctionById(id);

  if (auction.status !== "OPEN") {
    throw new creatError.Forbidden(`You cannot bid on a closed auction`);
  }

  if (amount <= auction.highestBid.amount) {
    throw new creatError.Forbidden(
      `Bid must be higher than ${auction.highestBid.amount}`
    );
  }

  const params = {
    TableName: process.env.AUCTIONS_TABLE_NAME,
    Key: { id },
    UpdateExpression: "set highestBid.amount = :amount",
    ExpressionAttributeValues: {
      ":amount": amount,
    },
    ReturnValues: "ALL_NEW",
  };

  let updatedAuction;
  try {
    const result = await dynamodb.update(params).promise();

    updatedAuction = result.Attributes;
  } catch (error) {
    console.log(error);
    throw new creatError.InternalServerError(error);
  }

  return {
    statusCode: 200,
    body: JSON.stringify(updatedAuction),
  };
}

export const handler = commonMiddleware(placeBid).use(
  validator({
    inputSchema: placeBidSchema,
    ajvOptions: {
      useDefaults: true,
      strict: false,
    },
  })
);
