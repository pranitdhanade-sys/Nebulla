function getNumber(value, fallback) {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

function loadConfig(env = process.env) {
  return {
    host: env.MYSQL_HOST || 'localhost',
    port: getNumber(env.MYSQL_PORT, 3306),
    user: env.MYSQL_USER || 'root',
    password: env.MYSQL_PASSWORD || '',
    database: env.MYSQL_DATABASE || 'nebulla_arcade',
    portApp: getNumber(env.PORT, 3000),
    sessionSecret: env.SESSION_SECRET || 'replace_me',
    mysqlConnectTimeout: getNumber(env.MYSQL_CONNECT_TIMEOUT, 10000)
  };
}

module.exports = {
  loadConfig,
  getNumber
};
