const sql = require('mssql/msnodesqlv8');
require('dotenv').config();

const config = {
    connectionString:
        `Driver={ODBC Driver 17 for SQL Server};` +
        `Server=${process.env.DB_SERVER};` +
        `Database=${process.env.DB_NAME};` +
        `Trusted_Connection=yes;` +
        `TrustServerCertificate=yes;`
};

const poolPromise = new sql.ConnectionPool(config)
    .connect()
    .then(pool => {
        console.log('Connected to SQL Server.');
        return pool;
    })
    .catch(error => {
        console.error('Database connection failed:', error);
        throw error;
    });

module.exports = {
    sql,
    poolPromise
};
