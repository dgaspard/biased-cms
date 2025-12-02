import path from 'path';

export default ({ env }) => {
    console.log('*** BIASED CMS PRODUCTION DB CONFIG LOADED ***');
    console.log('[DB CONFIG] DATABASE_CLIENT =', env('DATABASE_CLIENT', 'sqlite'));
    console.log('[DB CONFIG] NODE_ENV =', process.env.NODE_ENV);
    return {
        connection: {
            client: 'postgres',
            connection: {
                host: env('DATABASE_HOST'),
                port: env.int('DATABASE_PORT', 5432),
                database: env('DATABASE_NAME'),
                user: env('DATABASE_USERNAME'),
                password: env('DATABASE_PASSWORD'),
                ssl: env.bool('DATABASE_SSL', true)
                    ? {
                        rejectUnauthorized: env.bool('DATABASE_SSL_REJECT_UNAUTHORIZED', true),
                    }
                    : false,
            },
            pool: {
                min: env.int('DATABASE_POOL_MIN', 2),
                max: env.int('DATABASE_POOL_MAX', 10),
            },
            debug: false,
        },
    };
};
