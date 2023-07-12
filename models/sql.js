var sql = require("mssql");
var sqlMCC = require("mssql");
const sqlConfig = {
    user: "sa",
    password: 'ucml',
    database: "eWDFS_YNYX",
    server: '192.168.5.2',
    port: 1433,
    stream: false,
    options: {
        encrypt: false,
        trustServerCertificate: true,
    },
}

const sqlConfigMCC = {
    user: "sa",
    password: 'ucml',
    database: "MITACOSQL",
    server: '192.168.5.2',
    port: 1433,
    stream: false,
    options: {
        encrypt: false,
        trustServerCertificate: true,
    },
}


const pool = new sql.ConnectionPool(sqlConfig).connect();
const poolMCC = new sql.ConnectionPool(sqlConfigMCC).connect();
module.exports = {
    poolMCC,
    pool,
    sqlConfig,
    sqlConfigMCC,
    sql,
    sqlMCC
}