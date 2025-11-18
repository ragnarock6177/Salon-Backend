const dotenv = require('dotenv');
const path = require('path');

// const envFile = process.env.NODE_ENV === "production" ? ".env.production" : ".env.development";
const env = ".env.production"
dotenv.config({ path: path.resolve(process.cwd(), env) });

const shared = {
    client: 'mysql2',
    pool: {
        min: 0,
        max: 5,                // reduce if server can't handle many connections
        acquireTimeoutMillis: 10000, // how long to wait for a free connection
        idleTimeoutMillis: 30000
    },
    migrations: {
        directory: path.resolve(__dirname, './src/migrations'),
    },
    seeds: {
        directory: path.resolve(__dirname, './src/seeds'),
    },
};

const development = {
    ...shared,
    connection: {
        host: process.env.DB_HOST,
        port: process.env.DB_PORT || 3306,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
    },
};

const production = {
    ...shared,
    connection: {
        host: process.env.DB_HOST,
        port: process.env.DB_PORT,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
    },
};

module.exports = {
    development,
    production,
};
