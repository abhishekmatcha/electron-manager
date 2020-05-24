'use strict';

const electron = require('electron');
const chai = require('chai');
const electronManager = require('../../lib');

describe('ElectronManager', function () {
  describe('.init()', function () {
    it('should be a function', function () {
      chai.expect(typeof (electronManager.init)).to.equals('function');
    });

    it('should set the node environment flag', function () {
      electronManager.init({ isDev: true });
      chai.expect(process.env.EM_IS_DEV).to.equal('true');
    });
  });
})
