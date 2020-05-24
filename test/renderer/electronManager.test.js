const { assert } = require('chai');
const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');

// Chai and Chai as Promised are helper packages to help have our tests written in a bit more fluently instead of the older Assert style.
chai.should();
chai.use(chaiAsPromised);

before(() => {
    // our custom logic
});

after(() => {
    // our custom logic
});


describe('Check for renderer Process', () => {
  it('Check in renderer process', () => {
    assert.equal(process.type, 'renderer');
  })
});
