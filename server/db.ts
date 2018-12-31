import * as mongo from 'mongodb';

const dbPath = process.env.DB || 'mongodb://localhost:27017/razor';

class UrlSchema {
    url: string;
    _id: mongo.ObjectID;
}

class AnalyticsSchema {
    hash: string;
    clickThrough: number;
    hashRequest: number;
}

export const fetchUrlEntry = async (queryFilter: object, collectionName: string): Promise<UrlSchema> => {
    const client = await mongo.MongoClient.connect(dbPath, {useNewUrlParser: true});
    const db = client.db();
    const collection = db.collection(collectionName);

    return (async (): Promise<UrlSchema> => {
        const result = await collection.findOne(queryFilter);

        if (!result) {
            // throw error?
            return undefined;
        }

        client.close();

        return result;
    })();
};

export const insert = async (url: string, collectionName: string): Promise<string> => {
    const client = await mongo.MongoClient.connect(dbPath, {useNewUrlParser: true});
    const db = client.db();
    const collection = db.collection(collectionName);

    return (async (): Promise<string> => {
        const result = await collection.insertOne({url});
        client.close();
        return result.insertedId.toString();
    })();
};

export const updateAnalytics = (schema: AnalyticsSchema, collectionName: string) => {
    (async () => {
        const client = await mongo.MongoClient.connect(dbPath, {useNewUrlParser: true});
        const db = client.db();

        const result = await db.collection('analytics').updateOne(
            {_id: mongo.ObjectID.createFromHexString(schema.hash)},
            {$inc: {hashRequest: schema.hashRequest, clickThrough: schema.clickThrough}},
            {upsert: true}
        );
    })();
};

const fetchAnalyticsEntry = async (hash: string, collectionName: string = 'analytics'): Promise<AnalyticsSchema> => {
    const client = await mongo.MongoClient.connect(dbPath, {useNewUrlParser: true});
    const db = client.db();
    const collection = db.collection(collectionName);
    const result = await collection.findOne({hash});

    return result;
};