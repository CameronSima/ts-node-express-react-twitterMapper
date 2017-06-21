export interface Tweet {
    _id: String,
    tweetId: String,
    location: String,
    text: String,
    date: String,
    geo: String,
    coordinates: String,
    hashtags: Array<String>,
    sentimentData: Object
}