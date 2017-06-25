import * as mongoose from "mongoose";
import Processor from '../utils/processor';

export type TweetModel = mongoose.Document & {
    tweetId: string,
    location: string,
    text: string,
    date: string,
    geo: string,
    coordinates: string
    hashtags: Array<Object>
    sentimentData: Object,
    latLng: Object,
};

const tweetSchema = new mongoose.Schema({
    tweetId: String,
    location: String,
    text: String,
    date: String,
    geo: String,
    coordinates: String,
    hashtags: Array,
    sentimentData: Object,

    // Updated using data from cities.txt
    latLng: {
        lat: Number,
        lng: Number
    }
})

const Tweet = mongoose.model("Tweet", tweetSchema);
export default Tweet;