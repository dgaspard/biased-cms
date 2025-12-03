import path from 'path';

export default ({ env }) => {
  const client = env('DATABASE_CLIENT', 'sqlite');

  console.log('*** BIASED CMS DATABASE CONFIG LOADED ***');
  console.log('[DB CONFIG] DATABASE_CLIENT =', client);
  console.log('[DB CONFIG] NODE_ENV =', process.env.NODE_ENV);

  // SQLite for local development
  if (client === 'sqlite') {
    return {
      connection: {
        client: 'sqlite',
        connection: {
          filename: path.join(__dirname, '..', '..', '.tmp', 'data.db'),
        },
        useNullAsDefault: true,
      },
    };
  }

  // PostgreSQL for production
  return {
    connection: {
      client: 'postgres',
      connection: {
        host: env('DATABASE_HOST'),
        port: env.int('DATABASE_PORT', 5432),
        database: env('DATABASE_NAME'),
        user: env('DATABASE_USERNAME'),
        password: env('DATABASE_PASSWORD'),
        // SSL: false for Cloud SQL private IP, true for public IP
        ssl: env.bool('DATABASE_SSL', false)
          ? {
            rejectUnauthorized: env.bool('DATABASE_SSL_REJECT_UNAUTHORIZED', true),
          }
          : false,
      },
      pool: {
        min: env.int('DATABASE_POOL_MIN', 2),
        max: env.int('DATABASE_POOL_MAX', 10),
      },
    },
  };
};
