const jestConfig = require('./jest.config');

jestConfig.testRegex = '\\.(int-test)\\.js$';

module.exports = jestConfig;
