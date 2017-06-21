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
 
    let response = new ConsoleResponse;

    async.parallel( {
        count: function(next) {
            Tweet.find({
                text: { $ne: null }
                })
            .count()
            .then((count) => {
                next(null, count);
            })
        },
        collectionSize: function(next) {
            
            // size to Mb
            Tweet.collection.stats({ scale: 1024 * 1024 })
            .then((stats) => {
                next(null, stats.storageSize + " MB")
            })
        }
    }, function(err, results) {
        res.json(results)
    })
}