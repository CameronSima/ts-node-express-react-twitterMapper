import { spawn, fork, ChildProcess } from 'child_process';
import { default as Processor } from './processor';
import  MiningStatus  from "./miningStatus";
import { default as Miner } from './miner';
let PythonShell = require('python-shell');
let node_cron = require('node-cron');

export default class ProcessManager {
    private static _instance: ProcessManager = new ProcessManager();
    private minerCurrentProcess: Miner;
    private nltk: any;
    private processor: Processor;

    constructor() {
        if (ProcessManager._instance) {
            throw new Error("Process manager is a singleton. Cannot create new instance.")
        }
        ProcessManager._instance = this;
        this.processor = new Processor(process.env.SAVE_FORMAT || "database");
        
        if (process.env.NODE_ENV != "test") {
            this.scheduleNLTK();
        }
        
    }
    public static getInstance(): ProcessManager {
        return ProcessManager._instance;
    }

    // Start the Twitter miner, which will return all tweets in the continental
    // US (1340 mile radius from the center of the country). The miner will 
    // continue to mine 100 tweets roughly every 5 seconds until explicitly
    //shut down.
    public startMiner() {
        if (this.minerCurrentProcess == undefined) {
            this.minerCurrentProcess = new Miner({ 
            count: 100, 
            geocode: "39.828200,-98.579500,1340mi"
        }, this.processor)
            this.minerCurrentProcess.mine();
            return "Miner started."
        } else {
            return "Miner already running."
        }
    }

    public stopMiner() {
        this.minerCurrentProcess.terminate();
        this.minerCurrentProcess = undefined;
        return "Miner stopped."
    }

    // Return current status on the miner instance (API calls left, time
    // to rate-limit window reset, API call frequency).
    public getMiningData() {
        if (this.minerCurrentProcess == undefined) {
            let ms = new MiningStatus
            ms.status = "Miner is not currently running."
            return ms;
        } else {
            return this.minerCurrentProcess.getMiningStatus();
        }
    }

    // Return a batch of up to 250 tweets that have been saved to the db
    // but have not yet been processed by the Python NLTK script.
    public async getTweetsToSentimentize() {
        let tweets = await this.processor.getUnSentimentizedTweets();
        return tweets;
    }

    // If the python child process is not already currently running,
    // start the Python script in a child process, pass it a batch of 
    // data to be processed via stdin, and set listeners for recieving 
    // data from it and for on process end.
    public startNLTKProcess(data: Array<JSON>): string {
        if (this.nltk == undefined) {
            this.nltk = new PythonShell('/src/scripts/sentimentAnalyzer.py');  
            this.passDataToNLTK(data);
            this.setNLTKListeners();
        } else {
            return "Python process is already running."
        }
            return "Python process started."
    }

    // Set listeners for child process for data from stdout and process end.
    private setNLTKListeners() {
        this.nltk.on('message', (data: any) => {
        const tweet = JSON.parse(data);
        this.processor.updateTweet(tweet);

        });
        this.nltk.end((err:any) => {
            if (err){
                throw err;
            };
            console.log('Python process finished.');
            this.endNLTKProcess();
        });
    }

    // Pass JSON-stringified tweets via stdin to the Python child process
    // via stdin, which will populate the sentimentData field on each.
    private passDataToNLTK(data: Array<JSON>) {
        this.nltk.send(JSON.stringify(data));
    }
    public endNLTKProcess() {
        this.nltk = undefined;
    }

    // Query the db for data to be processed every 6 seconds. If there are
    // more than 50 returned, start the child process running the Python
    // script to process them.
    private scheduleNLTK() {
        node_cron.schedule('*/6 * * * * *', async () => {  
            let tweets = <Array<JSON>>await this.getTweetsToSentimentize();
            if (tweets.length > 50) {
                console.log(this.startNLTKProcess(tweets));
            } else {
                console.log("No unprocessed tweets.")
            }
        });
    }
}