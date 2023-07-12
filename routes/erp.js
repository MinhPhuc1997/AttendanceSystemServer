const express = require('express')
const router = express.Router()
const {sqlConfig, sql} = require('../models/sql');
var db = require('../models/db');
const fs = require('fs');
const axios = require('axios');
var exp = require("../utils/export.js");

router.get('/exportWhseAction', async (req, res) => {
    await sql.connect(sqlConfig)
    var result = await sql.query("select * from V_Whse_action_detail where action_code ='WSO-230000335'")
    console.log(result)
    return ""
})

router.get('/exportWhseActionNew', async (req, res) => {
    const {vatNo, productNo, updateTime_begin, updateTime_end} = req.query;
    await sql.connect(sqlConfig)
    str = "select * from V_Pro_Final_In_Details"

    if (updateTime_begin!=null){
        str= str + ` WHERE update_time>= '${updateTime_begin}' and update_time<='${updateTime_end}'`
    }
    if (vatNo){
        str=str +" AND vat_no like '"+vatNo+"'"
    }
    if (vatNo){
        str=str +" AND productNo like '"+productNo+"'"
    }
    var result = await sql.query(str)
    const date2 = new Date();
    for (i=0;i<result.recordsets[0].length;i++){
        let item = result.recordsets[0][i];
        const date1 = new Date(item.time_first_import);
        item.day = (item.fabric_state!=7)?0: diffDays(date1, date2)
    }
    return ""
})

function diffDays(date1, date2) {
    // Convert both dates to milliseconds
    const date1Ms = date1.getTime();
    const date2Ms = date2.getTime();

    // Calculate the difference in milliseconds
    const diffMs = Math.abs(date2Ms - date1Ms);

    // Convert the difference to days
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    return diffDays;
}

router.get('/exportCPInventoryMain', async (req, res) => {

    const {vatNo, fabName, salPoNo, custCode, type} = req.query;
    let clause = ""
    if (vatNo != undefined) {
        clause = clause + " AND a.vat_no like '" + vatNo + "'"
    }
    if (fabName != undefined) {
        if (clause.length > 0) {
            clause = clause + " AND ";
        }
        clause = clause + " b.fab_name like '" + fabName + "'";
    }
    if (salPoNo != undefined) {
        if (clause.length > 0) {
            clause = clause + " AND ";
        }
        clause = clause + " b.sal_po_no like '" + salPoNo + "'";
    }
    if (custCode != undefined) {
        if (clause.length > 0) {
            clause = clause + " AND ";
        }
        clause = clause + " b.cust_code = '" + custCode + "'";
    }
    let sqlStr = "SELECT a.vat_no,\n" +
        "count(a.product_no) as pids_no,\n" +
        "sum(a.net_weight) as net_weigth,\n" +
        "sum(a.gross_weight) as gross_weight,\n" +
        "STUFF ((SELECT  ',' +  convert(VARCHAR, log.store_load) from  whse_finished_fabric_shot log \n" +
        "WHERE log.vat_no = a.vat_no GROUP BY  log.store_load FOR XML PATH('')),1,1,'') store_load,\n" +
        "STUFF ((SELECT  ',' +  convert(VARCHAR, log.store_local) from  whse_finished_fabric_shot log \n" +
        "WHERE log.vat_no = a.vat_no GROUP BY  log.store_local FOR XML PATH('')),1,1,'') store_local,\n" +
        "(SELECT TOP 1 create_time from whse_finished_fabric_shot h WHERE h.vat_no = a.vat_no ORDER BY create_time DESC  ) import_time,\n" +
        "(SELECT TOP 1 creator from whse_finished_fabric_shot h WHERE h.vat_no = a.vat_no ORDER BY create_time DESC  ) creator,\n" +
        "(SELECT TOP 1 update_time from whse_finished_fabric_shot h WHERE h.vat_no = a.vat_no ORDER BY update_time DESC  ) update_time,\n" +
        "(SELECT TOP 1 updator from whse_finished_fabric_shot h WHERE h.vat_no = a.vat_no ORDER BY update_time DESC  ) updator,\n" +
        "b.sal_po_no,\n" +
        "(SELECT cust_name from Bas_customer p WHERE p.cust_code = b.cust_code) cust_code,\n" +
        "b.color_name,\n" +
        "b.create_time,\n" +
        "b.delive_date,\n" +
        "b.fab_name,\n" +
        "b.sal_type\n" +
        "from whse_finished_fabric_shot a\n" +
        "LEFT JOIN pro_bleadye_run_job b ON a.vat_no = b.vat_no and a.fabric_state = 7\n" +
        "WHERE  a.fabric_state = 7 and b.del_flag=0 " + clause + " \n" +
        "GROUP BY a.vat_no,b.fab_name,b.color_name, b.sal_po_no,b.create_time,b.delive_date,b.cust_code,b.sal_type\n";

    let sqlStr2 = "SELECT \n" +
        "a.vat_no,\n" +
        "a.product_no,\n" +
        "a.net_weight,\n" +
        "a.gross_weight,\n" +
        "a.store_load,\n" +
        "a.store_local,\n" +
        "a.create_time as import_time,\n" +
        "a.creator,\n" +
        "a.update_time,\n" +
        "a.updator,\n" +
        "b.sal_po_no,\n" +
        "c.cust_name as cust_code,\n" +
        "b.color_name,\n" +
        "b.create_time,\n" +
        "b.delive_date,\n" +
        "b.fab_name,\n" +
        "b.sal_type\n" +
        "from whse_finished_fabric_shot a\n" +
        "LEFT JOIN pro_bleadye_run_job b ON a.vat_no = b.vat_no and a.fabric_state = 7\n" +
        "LEFT JOIN Bas_customer c on b.cust_code = c.cust_code\n" +
        "WHERE  a.fabric_state = 7 " + clause
    try {
        let str = (type == 1) ? sqlStr : sqlStr2
        console.log(str)
        await sql.connect(sqlConfig)
        var respon = await sql.query(str)
        let data = respon.recordsets[0];
        data.map((e, i) => {
            e.index = i + 1;
            e.salType = e.sal_type == "big" ? "大货" : e.sal_type == "sample" ? "办单" : ""
        });
        if (type == 2) {
            data.map((e, i) => {
                //  console.log(e)
                e.pid_no = Number(e.product_no.slice(-3));
            });
        }

        sql.close();

        const path = "./files";
        let date_ob = new Date();
        let date = ("0" + date_ob.getDate()).slice(-2);
        let month = ("0" + (date_ob.getMonth() + 1)).slice(-2);
        let year = date_ob.getFullYear();
        let hours = date_ob.getHours();
        let minutes = date_ob.getMinutes();
        let seconds = date_ob.getSeconds();
        var t = year + month + date + hours + minutes + seconds

        try {
            if (type == 1) {
                const datas = await exp.export.CPInventoryMain(data).workbook.xlsx.writeFile(`${path}/data${t}.xlsx`)
                    .then(() => {
                        res.send({
                            status: "success",
                            message: "file successfully downloaded",
                            path: `${t}.xlsx`,
                        });
                    });
            } else {
                const datas = await exp.export.CPInventoryDetail(data).workbook.xlsx.writeFile(`${path}/data${t}.xlsx`)
                    .then(() => {
                        res.send({
                            status: "success",
                            message: "file successfully downloaded",
                            path: `${t}.xlsx`,
                        });
                    });
            }


        } catch (err) {
            console.log(err)
            res.send({
                status: "error",
                message: "Something went wrong",
            });
        }

    } catch (err) {
        console.log(err)
    }
})


router.get('/downloadExcel', async (req, res) => {

    let {name} = req.query
    const path = "./files";
    if (!req.query.path) return res.send(JSON.stringify({success: false, error: 109, message: "Dont found path"}))

    const file = `${path}/data${req.query.path}`;
    if (name === undefined) {
        name = "报告";
    }
    res.download(
        file,
        name + req.query.path,
        (err) => {
            if (err) {
                res.send({
                    error: err,
                    message: "Problem downloading the file"
                })
            }
        });

    fs.stat(file, function (err, stats) {

        if (err) return;

        fs.unlink(file, function (err) {
            if (err) return;
        });
    });
})
module.exports = router;
