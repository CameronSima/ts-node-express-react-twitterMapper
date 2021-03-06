let winston = require("winston");
let fs = require("fs");
let Twitter = require('twitter');
import { Request, Response } from "express";
import { default as Processor } from "./processor";
import * as Tweet from "../models/Tweet";
import  MiningStatus  from "./miningStatus";
import * as settings from "../settings";

export default class Miner {

    private twitterClient: any;
    private rateLimit: any;
    private apiCallsRemaining: number;
    public apiCallInterval: number;
    private timeToReset: number;
    private searchParams: Object;
    private tweets: Array<JSON>;
    private processor: Processor;
    private kill: Boolean;

    constructor(searchParams: Object, processor: Processor) {

        this.twitterClient = new Twitter({
            consumer_key: process.env.CONSUMER_KEY || 
            settings.default.twitterCredentials.consumer_key,
            consumer_secret: process.env.CONSUMER_SECRET || 
            settings.default.twitterCredentials.consumer_secret,
            access_token_key: process.env.ACESS_TOKEN_KEY || 
            settings.default.twitterCredentials.access_token_key,
            access_token_secret: process.env.ACESS_TOKEN_SECRET || 
            settings.default.twitterCredentials.access_token_secret
        });

        this.searchParams = searchParams;
        this.processor = processor;

        // winston.add(
        //     winston.transports.File, 
        //     { 
        //         filename: "../logs/miner.log"
        //     });
    }

    // One loop of the tweet mining process. Collect api rate-limit state
    // from the rate-limit endpoint, then call the endpoint for returning
    // tweets at the optimal interval.
    public async mine() {

        if (this.kill) {
            return "Miner stopped";
        } else {
            await this.getRateLimit();
            this.getApiCallState();
            this.printApiCallState();
            this.callApi(() => {
                setTimeout(this.mine.bind(this), this.apiCallInterval)
            })
        }
    }

    private getApiCallState() {
        this.getApiCallsRemaining();
        this.getTimeToRateLimitReset();
        this.getCallInterval();
    }

    printApiCallState() {
        console.log("\nCalls left: " + this.apiCallsRemaining + 
                    "\nTime to reset: " + (this.timeToReset / 60000) + 
                    "\ninterval: " + this.apiCallInterval / 1000);
    }

    // Call twitter endpoint for returning tweets, then save them to the db.
    private async callApi(next: Function) {
        await this.getTweets();
        this.processor.save(this.tweets);
        next();
    }

    private getTweets() {
        return new Promise((resolve, reject) => {
            this.twitterClient.get("search/tweets", this.searchParams, 
            (err: string, tweets: any, res: any) => {
                if (err)
                    reject(winston.log(err));
                resolve(this.tweets = tweets.statuses);
            });
        })

    }

    private getRateLimit() {
        return new Promise((resolve, reject) => {
            this.twitterClient.get("application/rate_limit_status", 
            (err: string, status: any, res: any) => {
                if (err)
                    reject(winston.log(err));
                resolve(this.rateLimit = status.resources.search["/search/tweets"]);
            });
        })

    }

    private getApiCallsRemaining() {
        this.apiCallsRemaining = this.rateLimit.remaining;
    }

   private  getTimeToRateLimitReset() {
    
        // ms until rate-limit reset 
        this.timeToReset = Math.abs((this.rateLimit.reset * 1000) - (new Date).getTime());
    }

    private getCallInterval() {

        // If there are is only 1 api call allowed left or if the projected 
        // interval is less than 1 second, set timeout interval to the time
        // left until our rate-limit is reset. Else, return optimal
        // time between calls.
        let interval = this.timeToReset / this.apiCallsRemaining;
        if (this.apiCallsRemaining < 2 || interval < 1000) {
            this.apiCallInterval = this.timeToReset;
        } else {
            this.apiCallInterval = interval;
        }
    }

    // Mining status for frontend output.
    getMiningStatus(): MiningStatus {
        let ms = new MiningStatus;
        ms.callsleft = this.apiCallsRemaining;
        ms.timeToReset = this.timeToReset / 60000;
        ms.interval = this.apiCallInterval / 1000;
        ms.status = "Miner is Running.";
        return ms;
    }

    public terminate() {
        this.kill = true;
    }
}
