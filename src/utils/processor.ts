
import * as fs from "fs";
import { default as Tweet } from "../models/Tweet";
const winston = require("winston");

winston.add(
  winston.transports.File, {
    filename: '../logs/processor.log',
    level: 'info',
    json: true,
    eol: 'n', 
    timestamp: true
  }
)

export default class Processor {
    save: Function;
    constructor(saveFormat: string) {
        this.getSaveFormat(saveFormat);
    }

    public async getUnSentimentizedTweets() {
        return new Promise((resolve, reject) => {
            Tweet.find({
                sentimentData: null
            })
            .limit(2000)
            .then((docs) => {
                resolve(docs)
            })
            .catch((err) => {
                reject(err)
            })
        })
    }
    public async writeToJsonFile(data: Array<JSON>) {
        return new Promise((resolve, reject) => {
            fs.appendFile("../data/tweets.json", JSON.stringify(data), (err: any) => {
                if (err)
                    reject(winston.log(err));
            });
            resolve();
        })
    }

    public async writeToDb(data: Array<JSON>) {
        let tweetObs = this.jsonToObjects(data);
        return new Promise((resolve, reject) => {
            Tweet.insertMany(tweetObs, (err, docs) => {
                if (err)
                    reject(err);
                resolve(docs);
            })
                
        })
    }

    public jsonToObjects(data: Array<any>) {
        return data.map((tweet) => {
             return new Tweet({
                tweetId: tweet.id,
                location: tweet.user['location'],
                text: tweet['text'],
                date: tweet['created_at'],
                geo: tweet['geo'],
                coordinates: tweet['coordinates'],
                hashtags: tweet.entities['hashtags']
            })
        })
    }

    getSaveFormat(format: string) {
        if (format == "database" || "db") {
            this.save = this.writeToDb
        } else {
            this.save = this.writeToJsonFile;
        } 
    }
}