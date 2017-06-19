import { spawn, fork, ChildProcess } from 'child_process';
import { default as Processor } from './processor';

export default class ProcessManager {

    private static _instance: ProcessManager = new ProcessManager();

    private processes: Array<any>;

    private miner: ChildProcess;
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

    terminateMiner(): string {
        this.miner.kill();
        return "Miner stopped";
    }

    startMiningProcess(): string {
        this.miner = fork(__dirname + '/../scripts/miner.ts', [],{ execPath: 'ts-node'});
        return this.handleNewProcess(this.miner, this.handleGetTweets)
    }

    startNLTKProcess(tweets: Array<JSON>): string {
        this.nltk = spawn('python', [ __dirname + '../scripts/sentimentAnalyzer.py']);
        this.nltk.stdin.write(JSON.stringify(tweets));
        this.nltk.stdin.end();
        return this.handleNewProcess(this.nltk, this.handleNLTKProcessedTweets)
    }


    handleNewProcess(process: ChildProcess, handler: Function): string {
        if (process != null) {
            this.processes.push(process);
            this.setMessageListener(process, handler);
            return process.pid.toString();
        } else {
            return "Error occured starting process " + process.pid.toString();
        }
    }

    setMessageListener(process: ChildProcess, handler: Function) {
        process.on('message', (msg) => {
            handler(msg);
        })
    }

    handleGetTweets(tweets: Array<JSON>) {
        this.startNLTKProcess(tweets);
    }

    handleNLTKProcessedTweets(NLTKProcessedTweets: Array<JSON>) {
        this.processor.writeToDb(NLTKProcessedTweets);
    }
}