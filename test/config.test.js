const test = require('node:test');
const assert = require('node:assert/strict');
const { loadConfig, getNumber } = require('../src/config');

test('getNumber returns fallback for invalid values', () => {
  assert.equal(getNumber(undefined, 3306), 3306);
  assert.equal(getNumber('x', 3306), 3306);
  assert.equal(getNumber('-1', 3306), 3306);
});

test('loadConfig reads env and applies defaults', () => {
  const config = loadConfig({
    MYSQL_HOST: '127.0.0.1',
    MYSQL_PORT: '3307',
    MYSQL_USER: 'root',
    MYSQL_PASSWORD: 'pw',
    MYSQL_DATABASE: 'test_db',
    PORT: '4000',
    SESSION_SECRET: 'abc',
    MYSQL_CONNECT_TIMEOUT: '12000'
  });

  assert.equal(config.host, '127.0.0.1');
  assert.equal(config.port, 3307);
  assert.equal(config.portApp, 4000);
  assert.equal(config.database, 'test_db');
  assert.equal(config.mysqlConnectTimeout, 12000);
});
