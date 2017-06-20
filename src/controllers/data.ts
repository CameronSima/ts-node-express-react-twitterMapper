import {Request, Response} from "express";
import { default as Tweet } from '../models/Tweet';

export let getAll = (req: Request, res: Response) => {
    Tweet.find()
    .then((data) => {
        res.json(data)
    })
}

export let getConsole = (req: Request, res: Response) => {
    interface consoleResponse {
        tweetCount: number,
        topHashtags: Array<string>,
        topLocation: string
    };
    let response:  consoleResponse;

    Tweet.find({
        text: { $ne: null}
    })
    .count()
    .then((count) => {
        response.tweetCount = count;
        res.json(response)
    })

}