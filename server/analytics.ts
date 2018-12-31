import { updateAnalytics } from './db';

const collection = 'analytics';

export const clickThrough = (hash: string) => {
    updateAnalytics({hash, clickThrough: 1, hashRequest: 0}, collection);
};

export const hashRequest = (hash: string) => {
    updateAnalytics({hash, clickThrough: 0, hashRequest: 1}, collection);
};