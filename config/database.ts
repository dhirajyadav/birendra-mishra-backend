import path from 'path';
import fs from 'fs';

function getProjectRoot(startDir: string): string {
  let dir = startDir;
  while (dir !== path.dirname(dir)) {
    if (fs.existsSync(path.join(dir, 'package.json'))) {
      return dir;
    }
    dir = path.dirname(dir);
  }
  return startDir;
}

export default ({ env }: { env: any }) => {
  const client = env('DATABASE_CLIENT', 'sqlite');

  if (client === 'postgres') {
    return {
      connection: {
        client: 'postgres',
        connection: {
          host: env('DATABASE_HOST', '127.0.0.1'),
          port: env.int('DATABASE_PORT', 5432),
          database: env('DATABASE_NAME', 'birendra_mishra_db'),
          user: env('DATABASE_USERNAME', 'postgres'),
          password: env('DATABASE_PASSWORD', ''),
          ssl: env.bool('DATABASE_SSL', false) && {
            rejectUnauthorized: env.bool('DATABASE_SSL_REJECT_UNAUTHORIZED', false),
          },
          schema: env('DATABASE_SCHEMA', 'public'),
        },
        pool: {
          min: env.int('DATABASE_POOL_MIN', 2),
          max: env.int('DATABASE_POOL_MAX', 10),
          acquireTimeoutMillis: env.int('DATABASE_POOL_ACQUIRE_TIMEOUT', 30000),
          idleTimeoutMillis: env.int('DATABASE_POOL_IDLE_TIMEOUT', 30000),
        },
      },
    };
  }

  if (client === 'mysql') {
    return {
      connection: {
        client: 'mysql',
        connection: {
          host: env('DATABASE_HOST', '127.0.0.1'),
          port: env.int('DATABASE_PORT', 3306),
          database: env('DATABASE_NAME', 'birendra_mishra_db'),
          user: env('DATABASE_USERNAME', 'root'),
          password: env('DATABASE_PASSWORD', ''),
          ssl: env.bool('DATABASE_SSL', false),
        },
        pool: {
          min: env.int('DATABASE_POOL_MIN', 2),
          max: env.int('DATABASE_POOL_MAX', 10),
        },
      },
    };
  }

  // SQLite for local testing / development
  const projectRoot = getProjectRoot(__dirname);
  const dbFile = env('DATABASE_FILENAME', '.tmp/data.db');
  return {
    connection: {
      client: 'sqlite',
      connection: {
        filename: path.isAbsolute(dbFile) ? dbFile : path.resolve(projectRoot, dbFile),
      },
      useNullAsDefault: true,
    },
  };
};
