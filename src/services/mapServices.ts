import { default as Tweet } from '../models/Tweet';
import TweetOb from '../dao/tweet';
import Processor from '../utils/processor';

export default class MapServices<Tweet> {

    processor: Processor;
    constructor() {
        this.processor = new Processor(null);
    }
    public getData() {

       return Tweet.find( {
           latLng: { $ne: null }
       })
       .limit(1000)
        .select("sentimentData latLng hashtags")
    }
}