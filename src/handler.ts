import { APIGatewayProxyHandler } from 'aws-lambda';
import { MongoClient } from 'mongodb';
import 'source-map-support/register';

const DB_NAME = "plantdata";
const COLLECTION_NAME = "plantdata";

let client: MongoClient | null = null;

export const plantdata: APIGatewayProxyHandler = (_event, context, callback) => {
  (async () => {
    // See https://docs.atlas.mongodb.com/best-practices-connecting-to-aws-lambda/
    context.callbackWaitsForEmptyEventLoop = false
    if (client === null || !client.isConnected()) {
      client = await MongoClient.connect(process.env.URL as string, { useUnifiedTopology: true });
    }
    // access plant data
    const db = client.db(DB_NAME);
    const coll = db.collection(COLLECTION_NAME);

    const result = await coll.aggregate([
      // Restrict results to the last 3 weeks
      {
        "$match": {
          "meta.time": {"$gte": new Date(new Date().getTime() - (3 * 7 * 24 * 60 * 60 * 1000))}
        }
      },
      // Rename our fields and remove unnecessary ones
      { "$project": {
          "datetime": "$meta.time",
          "ophelia": "$data.soil.0x26",
          "elinor": "$data.soil.0x24",
          "temp": "$data.climate.tempurature",
          "pressure": "$data.climate.pressure",
          "humidity": "$data.humidity",
          "light": "$data.lux",
        }
      },
      // Group by buckets of 2 hours
      { "$group": {
          "_id": {
            "$floor": {
              "$divide": [
                { "$toLong": "$datetime" },
                7.2e6 // 2 hours in milliseconds
              ]
            }
          },
          "datetime": { "$first": "$datetime" },
          "ophelia": { "$avg": "$ophelia" },
          "elinor": { "$avg": "$elinor" },
          "temp": { "$avg": "$temp" },
          "pressure": { "$avg": "$pressure" },
          "humidity": { "$avg" : "$humidity" },
          "light": { "$avg": "$light" },
        }
      },
      // Sort chronologically
      {
        "$sort": {
          "datetime": 1
        }
      },
      // Change output to be separate arrays
      { "$group": {
          "_id": 1,
          "datetime": { "$push": "$datetime" },
          "ophelia": { "$push": "$ophelia" },
          "elinor": { "$push": "$elinor" },
          "temp": { "$push": "$temp" },
          "pressure": { "$push": "$pressure" },
          "humidity": { "$push": "$humidity" },
          "light": { "$push": "$light" },
        }
      }
    ]).toArray();

    callback(null, {
      statusCode: 200,
      body: JSON.stringify({
        message: result,
      }),
      headers: {
        'Access-Control-Allow-Origin': 'https://mirrorkey.dev',
      },
    });
    
  })()
}
