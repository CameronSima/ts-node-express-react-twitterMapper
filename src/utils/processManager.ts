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

    public getMiningData() {
        if (this.minerCurrentProcess == undefined) {
            let ms = new MiningStatus
            ms.status = "Miner is not currently running."
            return ms;
        } else {
            return this.minerCurrentProcess.getMiningStatus();
        }
    }

    public async getTweetsToSentimentize() {
        let tweets = await this.processor.getUnSentimentizedTweets();
        return tweets;
    }

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

    private passDataToNLTK(data: Array<JSON>) {
        this.nltk.send(JSON.stringify(data));
    }
    public endNLTKProcess() {
        this.nltk = undefined;
    }

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