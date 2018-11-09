import * as mongo from 'mongodb';

const dbPath = process.env.DB || 'mongodb://localhost:27017/razor';

class Schema {
    url: string;
    _id: mongo.ObjectID;
}

export const fetch = async (queryFilter: object, collectionName: string): Promise<Schema> => {
    const client = await mongo.MongoClient.connect(dbPath, {useNewUrlParser: true});
    const db = client.db();
    const collection = db.collection(collectionName);

    return (async (): Promise<Schema> => {
        const result = await collection.findOne(queryFilter);

        if (!result) {
            // throw error?
            return undefined;
        }

        client.close();

        return result
        ;
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