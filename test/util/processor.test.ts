import { default as Processor } from '../../src/utils/processor';

describe('Processor tests', () => {
    it('Turns json data to mongodb model', () => {
        expect(1).toBe(1);
    })

    it('can return a city JOSON object containing lat and lng from a city name', () => {
        const proc = new Processor("file");
        const city = "Philadelphia";
        console.log(proc.getCoords(city))
        

    })

})
