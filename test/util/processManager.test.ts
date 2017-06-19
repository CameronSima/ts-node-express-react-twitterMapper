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
    
})