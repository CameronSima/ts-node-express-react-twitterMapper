import { spawn, fork, ChildProcess } from 'child_process';
import { default as Processor } from './processor';
import { default as Miner } from './miner';
const pythonShell =  require('python-shell');

export default class ProcessManager {
    private static _instance: ProcessManager = new ProcessManager();
    private processes: Array<any>;
    private miner: ChildProcess;
    private minerCurrentProcess: Miner;
    private nltk: ChildProcess;
    private processor: Processor;

    constructor() {
        if (ProcessManager._instance) {
            throw new Error("Process manager is a singleton. Cannot create new instance.")
        }
        ProcessManager._instance = this;
        this.processor = new Processor(process.env.SAVE_FORMAT || "database");
        this.processes = [];
    }
    public static getInstance(): ProcessManager {
        return ProcessManager._instance;
    }

    endAll() {
        this.processes.forEach((process) => {
            process.kill('SIGHUP')
        })
    }

    // terminateMiner(): string {
    //     if (this.miner != undefined) {
    //         this.miner.kill();
    //     }
    //     return "Miner stopped";
    // }

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

    async sentimentizeTweets() {
        let tweets = await this.processor.getUnSentimentizedTweets();



    }

    // startMiningProcess(): string {
    //     let result;
    //     if (this.miner == undefined) {
    //         this.miner = fork(__dirname + '/miner.js', [], { execPath: 'ts-node'});
    //         this.setMinerHandlers();
    //         result = this.miner.pid.toString();
    //     } else {
    //         result = "Miner already in progess."
    //     }
    //     return result
    // }

    // setMinerHandlers() {
    //     this.miner.on('close', (code, signal) => {
    //         this.miner = undefined;
    //     })
    // }

    startNLTKProcess(data: Array<JSON>): string {
        this.nltk = spawn('python', [__dirname + '/../scripts/sentimentAnalyzer.py']);
        this.setNLTKListeners(data)
        return this.nltk.pid.toString();
    }

    setNLTKListeners(data: Array<JSON>) {
        this.nltk.stdout.on('data', function(data){
        dataString += data.toString();
        });
        py.stdout.on('end', function(){
        console.log('Sum of numbers=',dataString);
        });
        py.stdin.write(JSON.stringify(data));
        py.stdin.end();
    }

    // test() {
    //     var spawn = require('child_process').spawn,
    //         py    = spawn('python', ['/Users/cameronsima/dev/ts-node-twitter-sentimentmap/src/scripts/sentimentAnalyzer.py']),
    //         data = [1,2,3,4,5,6,7,8,9],
    //         dataString = '';

    //     py.stdout.on('data', (data: any) => {
    //     console.log(data)
    //     });
    //     py.stdout.on('end', () => {
    //     console.log('Sum of numbers=',dataString);
    //     });
    //     py.stdin.write(JSON.stringify(data));
    //     py.stdin.end();
    // }

    // pipeToNLTK(data: Array<JSON>) {

    //     this.nltk.stdin.write(JSON.stringify(data))
    //     this.nltk.stdin.end();
    // }


}