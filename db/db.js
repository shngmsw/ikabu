const { Pool } = require('pg');
require('dotenv').config();
const local_pool = new Pool({
    connectionString: process.env.DATABASE_LOCAL_URL,
    ssl: false,
});
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: true,
    ssl: {
        require: true,
        rejectUnauthorized: false,
    },
});

/**
 * Postgresクラス
 */
class Postgres {
    /**
     * Poolからclientを取得
     * @return {Promise<void>}
     */
    async init() {
        if (process.env.DATABASE_URL) {
            this.client = await pool.connect();
        } else {
            this.client = await local_pool.connect();
        }
    }

    /**
     * SQLを実行
     * @param query
     * @param params
     * @return {Promise<*>}
     */
    async execute(query, params = []) {
        return (await this.client.query(query, params)).rows;
    }

    /**
     * 取得したクライアントを解放してPoolに戻す
     * @return {Promise<void>}
     */
    async release() {
        await this.client.release(true);
    }

    /**
     * Transaction Begin
     * @return {Promise<void>}
     */
    async begin() {
        await this.client.query('BEGIN');
    }

    /**
     * Transaction Commit
     * @return {Promise<void>}
     */
    async commit() {
        await this.client.query('COMMIT');
    }

    /**
     * Transaction Rollback
     * @return {Promise<void>}
     */
    async rollback() {
        await this.client.query('ROLLBACK');
    }
}

/**
 * Postgresのインスタンスを返却
 * @return {Promise<Postgres>}
 */
const getClient = async () => {
    const postgres = new Postgres();
    await postgres.init();
    return postgres;
};

module.exports.getPostgresClient = getClient;
