import { fetchUrlEntry, insert } from './db';
import * as mongo from 'mongodb';

export const hash = async (url: string): Promise<string> => {
    const collectionName = 'urls';
    const fetchResult = await fetchUrlEntry({url}, collectionName);
    let hash: string;

    if (!fetchResult) {
        hash = await insert(url, collectionName);
    } else {
        hash = fetchResult._id.toString();
    }

    return hash;
};

export const getUrl = async (hash: string): Promise<string> => {
    const obj = await fetchUrlEntry({_id: mongo.ObjectID.createFromHexString(hash)}, 'urls');
    return obj.url;
};
