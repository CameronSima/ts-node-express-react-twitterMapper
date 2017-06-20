import * as mongoose from "mongoose";

export type TweetModel = mongoose.Document & {
    tweetId: string,
    location: string,
    text: string,
    date: string,
    geo: string,
    coordinates: string
    hashtags: Array<Object>
    setimentData: Array<number>
};

const tweetSchema = new mongoose.Schema({
    tweetId: String,
    location: String,
    text: String,
    date: String,
    geo: String,
    coordinates: String,
    hashtags: Array,
    sentimentData: Array
})

const Tweet = mongoose.model("Tweet", tweetSchema);
export default Tweet;