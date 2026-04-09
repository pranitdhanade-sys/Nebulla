const test = require('node:test');
const assert = require('node:assert/strict');
const { mapDatabaseStartupError } = require('../src/db-errors');

const config = {
  user: 'root',
  host: 'localhost',
  port: 3306,
  database: 'nebulla_arcade'
};

test('maps ETIMEDOUT to actionable message', () => {
  const message = mapDatabaseStartupError({ code: 'ETIMEDOUT' }, config);
  assert.match(message, /Connection timed out/);
  assert.match(message, /XAMPP MySQL/);
});

test('maps ECONNREFUSED to actionable message', () => {
  const message = mapDatabaseStartupError({ code: 'ECONNREFUSED' }, config);
  assert.match(message, /Connection refused/);
});

test('maps unknown errors with original message', () => {
  const message = mapDatabaseStartupError({ code: 'OTHER', message: 'boom' }, config);
  assert.match(message, /boom/);
});
