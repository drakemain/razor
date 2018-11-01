import * as mongo from 'mongodb';

const dbPath = 'mongodb://localhost:27017/razor';

export async function hash(url: string): Promise<string> {
    return (async (): Promise<string> => {
        const client = await mongo.MongoClient.connect(dbPath, {useNewUrlParser: true});
        const db = client.db();
        const collection = db.collection('urls');
        let hash: string;

        try {
            hash = await fetch(url, collection);

            if (!hash) {
                console.log('no existing entry found');
                hash = await insert(url, collection);
            }
        } catch (e) {
            console.error(e);
        } finally {
            client.close();
        }

        return hash;
    })();
}

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
    console.log('created new entry');

    return (async (): Promise<string> => {
            const result = await collection.insertOne({url});
            return result.insertedId.toString();
    })();
};

