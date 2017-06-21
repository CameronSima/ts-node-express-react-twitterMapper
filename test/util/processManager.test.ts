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

    it('can start a Python process and return it\'s process id', () => {
        let pm = ProcessManager.getInstance();
        let pythonProcessId = pm.startNLTKProcess(new Array<JSON>);
        expect(pythonProcessId).toMatch(/[0-9]+/)
    })

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
        let pythonProcessId = pm.startNLTKProcess(data);
        expect(pythonProcessId).toMatch(/[0-9]+/)
        // pm.startNLTKProcess(JSON.parse(JSON.stringify(someData)), (res)=>{
        //     console.log("RSULT: " + res)
        // });
    })


    // it('can read from a python script', () => {
    //     let data = JSON.parse(JSON.stringify([{ hello: 'world'}]));
    //     let pm = ProcessManager.getInstance();
    //     pm.startNLTKProcess();
    //     pm.pipeToNLTK(data);
    // })
    
})