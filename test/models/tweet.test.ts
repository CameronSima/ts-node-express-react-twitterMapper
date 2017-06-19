import { default as Tweet } from '../..//src/models/Tweet';

describe('Tweet model tests', () => {
    it('should create a new Tweet', () => {
        const tweet = new Tweet({
            tweetId: "12345",
            location: "Philadelphia, PA",
            text: "This is a new tweet!",
            date: "Mon Sep 24 03:35:21 +0000 2012",
            geo: null
        })

        tweet.validate((err) => {
            expect(err).toBeNull();
            expect("12345").toEqual(tweet['tweetId'])
            expect(tweet['_id']).toBeDefined()
        })
    })
})