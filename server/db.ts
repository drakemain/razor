import * as mongo from 'mongodb';

const dbPath = process.env.DB || 'mongodb://localhost:27017/razor';
const urlCollection = 'urls';
const analyticsCollection = 'analytics';

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

export const getAllUrls = async () => {
    const client = await mongo.MongoClient.connect(dbPath, {useNewUrlParser: true});
    const db = client.db();
    const collection = db.collection(urlCollection);

    const result: mongo.Cursor<UrlSchema> = await collection.find({});
    return result;
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

        client.close();
    })();
};

export const fetchAnalyticsEntry = async (hash: string | mongo.ObjectID, collectionName: string = 'analytics'): Promise<AnalyticsSchema> => {
    let _id;
    if (typeof(hash) === 'string') {
        _id = mongo.ObjectID.createFromHexString(hash);
    } else {
        _id = hash;
    }

    const client = await mongo.MongoClient.connect(dbPath, {useNewUrlParser: true});
    const db = client.db();
    const collection = db.collection(collectionName);
    const result = await collection.findOne({_id});

    client.close();

    return result;
};