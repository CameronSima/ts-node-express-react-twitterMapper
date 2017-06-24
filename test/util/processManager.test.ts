import { default as ProcessManager } from '../../src/utils/processManager';

describe('Process Manager Tests', () => {

    it('There can be only one!', () => {
        function instantiate() {
            let proc = new ProcessManager;
        }
        expect(instantiate).toThrowError("Process manager is a singleton. Cannot create new instance.")
    })

    it('Can start a miner process', () => {
        let pm = ProcessManager.getInstance();
        expect(pm.startMiner()).toEqual("Miner started.")
    })

    it('can kill a mining process', () => {
        let pm = ProcessManager.getInstance();
        expect(pm.stopMiner()).toEqual("Miner stopped.")
    })

    it('can start a Python process and return a message', () => {

        let pm = ProcessManager.getInstance();
        let message = pm.startNLTKProcess(new Array<JSON>);
        expect(message).toEqual("Python process started.");
        pm.endNLTKProcess();

    });

    it('can pass JSON to the Python process', () => {
        let someData1 = {
            tweetId: "df34ff54",
            location: "Philadelphia, PA",
            text: "I love cookies!",
            date: "June 21, 2017",
            geo: null,
            coordinates: null,
            hashtags: ["#poop"],
            sentimentData: null
        }
        let someData2 = {
            tweetId: "df34f4",
            location: "New York, NY",
            text: "I hate ice cream!",
            date: "May 1, 2014",
            geo: null,
            coordinates: null,
            hashtags: ["#peepee"],
            sentimentData: null
        }

        let data = JSON.parse(JSON.stringify([someData1, someData2]));
        let pm = ProcessManager.getInstance();
        let message = pm.startNLTKProcess(data);
        expect(message).toMatch("Python process started.");
        pm.endNLTKProcess();
    })


    it('return tweets that need to be processed by the nltk script', () => {
        let pm = ProcessManager.getInstance();
        pm.getTweetsToSentimentize()
        .then((tweets) => {
            expect(tweets).toBeDefined()
            expect(tweets[0].sentimentData).toBeNull()
        });
    });

    it('can get twitter miner status', () => {
        let pm = ProcessManager.getInstance();
        let status = pm.getMiningData();
        expect(status).toBeDefined();
    })
    
})