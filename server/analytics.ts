import { updateAnalytics, fetchAnalyticsEntry, getAllUrls } from './db';
import { ObjectID } from 'mongodb';

const collection = 'analytics';

class Analytics {
    hash: string;
    url: string;
    hashRequests: number;
    clicks: number;
}

export const clickThrough = (hash: string) => {
    updateAnalytics({hash, clickThrough: 1, hashRequest: 0}, collection);
};

export const hashRequest = (hash: string) => {
    updateAnalytics({hash, clickThrough: 0, hashRequest: 1}, collection);
};

export const getEntry = (hash: string | ObjectID) => {
    return fetchAnalyticsEntry(hash);
};

export const getAll = async (): Promise<Analytics[]> => {
    const urls = await getAllUrls();
    const arr = await urls.toArray();

    urls.close();

    const data: Analytics[] = [];

    for (const i of arr) {
        const urlAnalytics = await getEntry(i._id);

        console.log(urlAnalytics);

        if (urlAnalytics) {
            data.push({
                hash: i._id.toHexString(),
                url: i.url,
                hashRequests: urlAnalytics.hashRequest,
                clicks: urlAnalytics.clickThrough
            });
        }
    }

    return data;
};