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

    let getTweetCount = (next: Function) => {
         Tweet.find({
             text: { $ne: null }
             })
         .count()
         .then((count) => {
             console.log(count)
             next(null, count.toLocaleString());
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
        count: getTweetCount,
        collectionSize: getCollectionMb
    }, (err, results) => {
        res.json(results)
    })
}
