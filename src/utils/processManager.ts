import { spawn, fork, ChildProcess } from 'child_process';
import { default as Processor } from './processor';
import { default as Miner } from './miner';
let PythonShell = require('python-shell');
let node_cron = require('node-cron');

export default class ProcessManager {
    private static _instance: ProcessManager = new ProcessManager();
    private processes: Array<any>;
    private minerCurrentProcess: Miner;
    // private nltk: ChildProcess;
    private nltk: any;
    private processor: Processor;

    constructor() {
        if (ProcessManager._instance) {
            throw new Error("Process manager is a singleton. Cannot create new instance.")
        }
        ProcessManager._instance = this;
        this.processor = new Processor(process.env.SAVE_FORMAT || "database");
        this.processes = [];
        this.scheduleNLTK();
    }
    public static getInstance(): ProcessManager {
        return ProcessManager._instance;
    }

    endAll() {
        this.processes.forEach((process) => {
            process.kill('SIGHUP')
        })
    }

    stopMiner() {
        this.minerCurrentProcess.terminate();
        this.minerCurrentProcess = undefined;
        return "Miner stopped."
    }

    startMiner() {
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

    async getTweetsToSentimentize() {
        let tweets = await this.processor.getUnSentimentizedTweets();
        return tweets;
    }

    startNLTKProcess(data: Array<JSON>): string {
        if (this.nltk == undefined) {
            this.nltk = new PythonShell('/src/scripts/sentimentAnalyzer.py');  
            this.passDataToNLTK(data);
            this.setNLTKListeners();
            
        }
            return "00"
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
            console.log('finished');
            this.nltk = undefined;
        });
    }

    passDataToNLTK(data: Array<JSON>) {
        this.nltk.send(JSON.stringify(data));
    }
    endNLTKProcess() {
        this.nltk = undefined;
    }

    async scheduleNLTK() {
        let tweets = await this.getTweetsToSentimentize();
        node_cron.schedule('*/10 * * * * *', () => {  
            if (tweets) {
                this.startNLTKProcess(tweets);
            }
        });
    }
}