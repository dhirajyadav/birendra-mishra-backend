export default ({ env }) => {
  const client = env('DATABASE_CLIENT', 'sqlite');
  const connection = client === 'postgres'
    ? { connectionString: env('DATABASE_URL'), host: env('DATABASE_HOST', '127.0.0.1'), port: env.int('DATABASE_PORT', 5432), database: env('DATABASE_NAME', 'birendra_mishra'), user: env('DATABASE_USERNAME', 'postgres'), password: env('DATABASE_PASSWORD', ''), ssl: env.bool('DATABASE_SSL', false) && { rejectUnauthorized: env.bool('DATABASE_SSL_REJECT_UNAUTHORIZED', true) }, schema: env('DATABASE_SCHEMA', 'public') }
    : { filename: env('DATABASE_FILENAME', '.tmp/data.db') };
  return { connection: { client, connection, useNullAsDefault: client === 'sqlite', acquireConnectionTimeout: env.int('DATABASE_CONNECTION_TIMEOUT', 60000) } };
};
