'use strict';

describe('Volatilities E2E Tests:', function () {
  describe('Test Volatilities page', function () {
    it('Should report missing credentials', function () {
      browser.get('http://localhost:3001/volatilities');
      expect(element.all(by.repeater('volatility in volatilities')).count()).toEqual(0);
    });
  });
});
