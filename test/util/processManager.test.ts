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
        expect(pm.startMiningProcess()).toEqual(expect.stringMatching(/[0-9]+/))
    })

    it('can kill a mining process', () => {
        let pm = ProcessManager.getInstance();
        expect(pm.terminateMiner()).toEqual("Miner stopped")
    })

    it('Can run a python script', () => {
        let pm = ProcessManager.getInstance();
        let responseId = pm.startNLTKProcess();
        pm.test()

        expect(responseId).toEqual(expect.stringMatching(/[0-9]+/));
    })

    it('can send data to python script', () => {
        let data = JSON.parse(JSON.stringify([{ hello: 'world'}]));
        let pm = ProcessManager.getInstance();
        pm.startNLTKProcess();
        pm.pipeToNLTK(data);

    })

    // it('can read from a python script', () => {
    //     let data = JSON.parse(JSON.stringify([{ hello: 'world'}]));
    //     let pm = ProcessManager.getInstance();
    //     pm.startNLTKProcess();
    //     pm.pipeToNLTK(data);
    // })
    
})