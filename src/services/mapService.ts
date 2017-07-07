import { default as Tweet } from '../models/Tweet';
import Processor from '../utils/processor';
const _ = require('lodash');

export default class MapService<Tweet> {

    processor: Processor;
    constructor() {
        this.processor = new Processor(null);
    }
    public getData() {

       return Tweet.find({
           latLng: { $ne: null }
       })
       //.limit(200000)
        .select("sentimentData latLng text hashtags")
    }


}