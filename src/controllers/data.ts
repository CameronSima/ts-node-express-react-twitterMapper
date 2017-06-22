import {Request, Response} from "express";
import { default as Tweet } from '../models/Tweet';
import { default as ConsoleResponse } from '../utils/consoleResponse';
import * as async from 'async';

export let getAll = (req: Request, res: Response) => {
    Tweet.find()
    .then((data) => {
        res.json(data)
    })
}

export let getConsole = (req: Request, res: Response) => {
    //Tweet.remove({}, ()=> {})

    let getTotalTweetCount = (next: Function) => {
         Tweet.find({
             text: { $ne: null }
             })
         .count()
         .then((count) => {
             next(null, count.toLocaleString());
         })
    }

    let getSentimentizedTweetCount = (next: Function) => {
         Tweet.find({
             sentimentData: { $ne: null }
             })
         .count()
         .then((count) => {
             next(null, count.toLocaleString());
         })
    }

    let getUnSentimentizedTweetCount = (next: Function) => {
        Tweet.find({
            sentimentData: null
        })
        .count()
        .then((count) => {
            next(null, count)
        })
    }

    let getCollectionMb = (next: Function) => {
         // size to Mb
         Tweet.collection.stats({ scale: 1024 * 1024 })
         .then((stats) => {
             next(null, stats.storageSize + " MB");
         }) 
    }

    async.parallel({
        count: getTotalTweetCount,
        unSentimentizedTweetCount: getUnSentimentizedTweetCount,
        sentimentizedTweetCount: getSentimentizedTweetCount,
        collectionSize: getCollectionMb,
    }, (err, results) => {
        res.json(results)
    })
}
