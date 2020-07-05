import { APIGatewayProxyHandler } from 'aws-lambda';
import { MongoClient } from 'mongodb';
import 'source-map-support/register';

const DB_NAME = "plantdata";
const COLLECTION_NAME = "plantdata";

export const hello: APIGatewayProxyHandler = async (event, _context) => {

  const client = await MongoClient.connect(process.env.URL as string);
  const db = client.db(DB_NAME);
  const coll = db.collection(COLLECTION_NAME);

  const result = await coll.aggregate([
    { "$project": {
        "datetime": "$meta.time",
        "ophelia": "$data.soil.0x24",
        "elinor": "$data.soil.0x26",
      }
    },
    { "$group": {
        "_id": {
          "$floor": {
            "$divide": [
              { "$toLong": "$datetime" },
              7.2e6
            ]
          }
        },
        "datetime": { "$first": "$datetime" },
        "ophelia": { "$avg": "$ophelia" },
        "elinor": { "$avg": "$elinor" },
      }
    },
    {
      "$sort": {
        "datetime": 1
      }
    }
  ]).limit(100).toArray();

  return {
    statusCode: 200,
    body: JSON.stringify({
      message: result,
      input: event,
    }, null, 2),
  };
}
