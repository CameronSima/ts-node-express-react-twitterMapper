import * as mongoose from "mongoose";

export type TweetModel = mongoose.Document & {
    tweetId: string,
    location: string,
    text: string,
    date: string,
    geo: string,
    coordinates: string
    hashtags: Array<Object>
};

const tweetSchema = new mongoose.Schema({
    tweetId: String,
    location: String,
    text: String,
    date: String,
    geo: String,
    coordinates: String,
    hashtags: Array
})

const Tweet = mongoose.model("Tweet", tweetSchema);
export default Tweet;