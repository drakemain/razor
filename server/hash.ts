import * as mongo from 'mongodb';

const dbPath = 'mongodb://localhost:27017/razor';

export const hash = async (url: string): Promise<string> => {
    const client = await mongo.MongoClient.connect(dbPath, {useNewUrlParser: true});
    const db = client.db();
    const collection = db.collection('urls');
    let hash: string;

    try {
        hash = await fetch(url, collection);

        if (!hash) {
            hash = await insert(url, collection);
        }
    } catch (e) {
        console.error(e);
    } finally {
        client.close();
    }

    return hash;
};

export const getUrl = async (hash: string): Promise<string> => {
    const client = await mongo.MongoClient.connect(dbPath, {useNewUrlParser: true});
    const db = client.db();
    const collection = db.collection('urls');

    try {
        const obj = await collection.findOne(mongo.ObjectID.createFromHexString(hash));
        return obj.url;
    } catch (e) {
        console.error(`URL Fetch Error:  ${e}`);
    } finally {
        client.close();
    }
};

const fetch = async (url: string, collection: mongo.Collection): Promise<string> => {
    return (async (): Promise<string> => {
        const result = await collection.findOne({url});

        if (!result) {
            return undefined;
        }

        return result._id.toString();
    })();
};

const insert = async (url: string, collection: mongo.Collection): Promise<string> => {
    return (async (): Promise<string> => {
        const result = await collection.insertOne({url});
        return result.insertedId.toString();
    })();
};

