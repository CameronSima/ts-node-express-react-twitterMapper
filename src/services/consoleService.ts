import { default as Tweet } from '../models/Tweet';
import * as async from 'async';
export default class consoleService {
    
    public getConsole(next: Function) {
        async.parallel({
            count: this.getTotalTweetCount,
            unSentimentizedTweetCount: this.getUnSentimentizedTweetCount,
            sentimentizedTweetCount: this.getSentimentizedTweetCount,
            geoCoded: this.getGeoCoded,
            collectionSize: this.getCollectionSize,       
        }, (err, results) => {
            if (err)
                console.log(err);
            next(results);
        });
    }

    getGeoCoded(next: Function) {
        Tweet.find({
            latLng: { $ne: null }
        })
        .count()
        .then((count) => next(null, count))
    }

    getCollectionSize(next: Function) {
         // size to Mb
         Tweet.collection.stats({ scale: 1024 * 1024 })
         .then((stats) => {
             next(null, stats.storageSize + " MB");
         }) 
    }

    getTotalTweetCount(next: Function) {
         Tweet.find({
             text: { $ne: null }
             })
         .count()
         .then((count) => {
             next(null, count.toLocaleString());
         })
    }

    getSentimentizedTweetCount(next: Function) {
         Tweet.find({
             sentimentData: { $ne: null }
         })
         .count()
         .then((count) => {
             next(null, count.toLocaleString());
         })
    }

    getUnSentimentizedTweetCount(next: Function) {
        Tweet.find({
            sentimentData: null
        })
        .count()
        .then((count) => {
            next(null, count)
        })
    }
}