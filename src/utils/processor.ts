
import * as fs from "fs";
import { default as Tweet, TweetModel } from "../models/Tweet";
import * as async from 'async';
const winston = require("winston");
const csv = require('csvtojson');
const placename = require('placename');

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
            .limit(250)
            .then((docs) => {
                return resolve(docs)
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

    public async updateTweet(tweet: any) {
        await this.setCoords(tweet);
        console.log(tweet)
        this.setProcessedFields(tweet);

        // if (tweet.latLng == undefined) {
        //     Tweet.findByIdAndRemove(tweet._id);
        // } else {
        //     this.setProcessedFields(tweet);
        // }
    }

    setProcessedFields(tweet: TweetModel) {
        Tweet.findOneAndUpdate(
            { _id: tweet._id},
            { $set: { sentimentData: tweet.sentimentData,
                      latLng: tweet.latLng
            }},
            (err, doc) => {
                if (err)
                    console.log(err)
            })
    }

    setCoords(tweet: any) {
        return new Promise((resolve, reject) => {
            try {
                placename(tweet.location, (err: string, result: any) => {
                    if (tweet.location) {
                        const city = this.filterResultCities(result);
                        if (city != undefined) {
                            tweet.latLng = {};
                            tweet.latLng.lat = city.lat;
                            tweet.latLng.lng = city.lon;
                        }
                    }
                    resolve();
                })
            } catch(err) {
                resolve();
                // No valid location was supplied         
            }
        })
    }

    filterResultCities(cities: Array<any>) {
        if (cities && cities.length) {
            return cities.filter((city) => {
                return city.country == 'US';
            })[0]
        }
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