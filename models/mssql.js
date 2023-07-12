const sql = require("mssql");
let mssql = require('./mssql-pool-management.js')

let exampleDBConfigA = {
    user: "sa",
    password: 'ucml',
    database: "eWDFS_YNYX",
    server: '192.168.5.2',
};
let exampleDBConfigB = {
    user: "sa",
    password: 'ucml',
    database: "MITACOSQL",
    server: '192.168.5.2',
};


// Request 1
try {
    let sqlPool = await mssql.GetCreateIfNotExistPool(exampleDBConfigA)
    let request = new sql.Request(sqlPool)

    request.query('select 1 as number', (err, result) => {
        // ... error checks

        console.log(result.recordset[0].number) // return 1

        // ...
    })
}
catch (error) {
    //error handling
}



// Request 2
try {
    let sqlPool = await mssql.GetCreateIfNotExistPool(exampleDBConfigB)
    let request = new sql.Request(sqlPool)

    request.query('select 1 as number', (err, result) => {
        // ... error checks

        console.log(result.recordset[0].number) // return 1

        // ...
    })
}
catch (error) {
    //error handling
}