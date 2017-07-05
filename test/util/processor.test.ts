import { default as Processor } from '../../src/utils/processor';

let processor = new Processor("db");

describe('Processor tests', () => {

    it('Can filter array of cities to one in the US', () => {
       let cities = [{country: 'US', city: 'New York'}, {country: 'CA'}];
       let city = processor.filterResultCities(cities);
       expect(city.country).toEqual('US')

    })

    it('', () => {
        

    })

})
