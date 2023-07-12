var mysql = require('mysql');
var utils = require('../utils/tool');

var db_config = {
    host: "192.168.5.2",
    port: "3306",
    user: "jieLink",
    password: "js*168",
    database: "db_newg3_main"
}

var connection = mysql.createConnection(db_config);

function handleDisconnect() {
    connection = mysql.createConnection(db_config); 
    connection.connect((err) => {
        if (err) {
          //  console.log('error when connecting to db:', err);
            setTimeout(handleDisconnect, 2000);
        }
        setup();
    });

    connection.on('error', function (err) {
      //  console.log('db error', err);
        if (err.code === 'PROTOCOL_CONNECTION_LOST') {
            handleDisconnect();
        } else {
            throw err;
        }
    });
}

handleDisconnect();

function setup() {
    let sql = `CALL SP_GetProcedure()`;
    connection.query(sql, (err, results) => {
        global.sp_query = utils.tool.getDataFromAray(results[0], 'sp_query');
        global.sp_user = utils.tool.getDataFromAray(results[0], 'sp_user');
        global.sp_datadetail = utils.tool.getDataFromAray(results[0], 'sp_detail');
        global.sp_shift = utils.tool.getDataFromAray(results[0], 'sp_shift');
        global.sp_shiftAdd = utils.tool.getDataFromAray(results[0], 'sp_shiftAdd');
        global.sp_shiftEdit = utils.tool.getDataFromAray(results[0], 'sp_shiftEdit');
        global.sp_shiftDel = utils.tool.getDataFromAray(results[0], 'sp_shiftDel');
        global.sp_cardoffset = utils.tool.getDataFromAray(results[0], 'sp_cardoffset');
        global.sp_listoffset = utils.tool.getDataFromAray(results[0], 'sp_listoffset');
        global.sp_deleteoffset=utils.tool.getDataFromAray(results[0], 'sp_deleteoffset');
        global.sp_devicesinfo = utils.tool.getDataFromAray(results[0], 'sp_devicesinfo');
        global.sp_DGUID = utils.tool.getDataFromAray(results[0], 'sp_DGUID');
        global.sp_updateRecord = utils.tool.getDataFromAray(results[0], 'sp_updateRecord');
    })
}

module.exports = connection;