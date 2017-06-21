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


    // it('can read from a python script', () => {
    //     let data = JSON.parse(JSON.stringify([{ hello: 'world'}]));
    //     let pm = ProcessManager.getInstance();
    //     pm.startNLTKProcess();
    //     pm.pipeToNLTK(data);
    // })
    
})