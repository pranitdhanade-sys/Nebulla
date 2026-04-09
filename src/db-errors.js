function mapDatabaseStartupError(error, config) {
  if (!error) {
    return 'Unknown database startup error.';
  }

  const base = `MySQL startup error for ${config.user}@${config.host}:${config.port}/${config.database}`;

  switch (error.code) {
    case 'ETIMEDOUT':
      return `${base}. Connection timed out. Check that XAMPP MySQL is running and reachable.`;
    case 'ECONNREFUSED':
      return `${base}. Connection refused. MySQL is not listening on that host/port.`;
    case 'ER_ACCESS_DENIED_ERROR':
      return `${base}. Access denied. Verify MYSQL_USER and MYSQL_PASSWORD.`;
    case 'ENOTFOUND':
      return `${base}. Host not found. Verify MYSQL_HOST.`;
    default:
      return `${base}. ${error.message || 'Unexpected error.'}`;
  }
}

module.exports = {
  mapDatabaseStartupError
};
