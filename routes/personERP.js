const express = require('express')
const router = express.Router()
const { sqlConfig, sql } = require('../models/sql');
var db = require('../models/db');
const fs = require('fs');
const axios = require('axios');

const utils = require("../utils/tool")

router.post('/', async (req, res) => {

    const { connectNo, department, personNO, personName, phone, sex, statusAttend, statusConnect } = req.body;


    var ResultArr = [];
    var ListERP = []
    var ListPerCount = []

    var strPerNo = '';
    var strPerName = '';
    var strDep = '';
    var strsex = '';
    var strphone = ''

    if (personNO != '') {
        strPerNo = `AND PersonNo LIKE '%${personNO.toString().trim()}%'`;
    }

    if (personName != '') {
        strPerName = `AND PersonName LIKE '%${personName.toString().trim()}%'`;
    }

    if (department != '' && department != '5a9dc528-e7ad-4952-9f21-a885b6564a1c') {
        strDep = `AND RID LIKE '%${department.toString().trim()}%'`;
    }

    if (sex != '2') {
        strsex = `AND Gender = '${sex}'`;
    }

    if (phone != '') {
        strphone = `AND Tel1 LIKE '%${phone.toString().trim()}%'`;
    }

    const mysql = `SELECT PersonNo,PersonName,Gender,DATE(EnterTime) AS EnterTime, Tel1 , RFullPath FROM control_person WHERE  IsIssueCard = '1' and Status ='0' ${strPerNo} ${strPerName} ${strDep} ${strsex} ${strphone}`;
    const mysql_count = `SELECT  PersonNO,Count(PersonNO) as Count FROM boxdoor_door_record  where PersonNO <> '' GROUP BY PersonNO`;
    const sqltr = `SELECT PER_ID FROM PER_PERSON`;

    await sql.connect(sqlConfig);
    const result = await sql.query(sqltr);
    ListERP = result.recordset;

    db.query(mysql_count, (err, results) => {
        ListPerCount = results;
    })

    db.query(mysql, (err, results) => {

        results.map(e => {

            const cNo = (checkExistItem(ListERP, e.PersonNo)) ? e.PersonNo : '';


            ResultArr.push({
                PER_ID: e.PersonNo,
                PER_NAME: e.PersonName,
                RID: e.RID,
                Gender: e.Gender,
                EnterTime: e.EnterTime,
                Tel1: e.Tel1,
                RFullPath: e.RFullPath,
                record: getCountRecord(ListPerCount, e.PersonNo),
                CardType: checkCardType(e.PersonNo),
                connect: checkExistItem(ListERP, e.PersonNo),
                connectNo: cNo
            });



        })
        if (statusConnect == '1') {
            ResultArr = ResultArr.filter(e => e.connect == true)
        }

        if (statusConnect == '0') {
            ResultArr = ResultArr.filter(e => e.connect == false)
        }

        if (statusAttend == '1') {
            ResultArr = ResultArr.filter(e => e.record > 0)
        }

        if (statusAttend == '0') {
            ResultArr = ResultArr.filter(e => e.record == 0)
        }


        res.status(200).send(JSON.stringify({
            status: 200,
            error: null,
            success: true,
            response: ResultArr
        }))
    })
})

router.get('/PersonList', async (req, res) => {

    var ResultArr = [];
    var ListERP = []
    var ListJL = []
    const mysql = `SELECT PersonNo FROM control_person WHERE Status ='0'`;

    const sqltr = `SELECT PER_ID,PER_NAME FROM PER_PERSON`;

    await sql.connect(sqlConfig);
    const result = await sql.query(sqltr);
    ListERP = result.recordset;

    db.query(mysql, (err, results) => {

        ListJL = results;
        ListERP.map(e => {

            if (checkExist(ListJL, e.PER_ID) == false) {
                ResultArr.push({
                    value: e.PER_ID,
                    title: e.PER_NAME
                })
            }
        })

        res.status(200).send(JSON.stringify({
            status: 200,
            error: null,
            success: true,
            response: ResultArr
        }))

    })

    function checkExist(list, item) {
        // ListJL = results;
        var inPos = list.findIndex(e => e.PersonNo == item);
        if (inPos > 0) {
            return true;
        } else {
            return false;
        }
    }

})

router.get('/department', async (req, res) => {

    const res_ = res;
    var arr = []
    const mysql_count = `SELECT * FROM control_role_group WHERE Status = 0 and RGCode ='2033559983'`;
    getDepartment(mysql_count)


    function getDepartment(mysql) {

        db.query(mysql, (err, results) => {

            if (results.length != undefined) {
                for (let index = 0; index < results.length; index++) {
                    const element = results[index];
                    arr.push({
                        RGGUID: element.RGGUID,
                        RGCode: element.RGCode,
                        Name: element.RGName,
                        parentID: element.ParentId
                    })
                }
            }

            if (results.length > 0) {
                var mystr = '';
                results.map((e, i) => {
                    mystr = mystr + `SELECT * FROM control_role_group  WHERE Status = 0 and ParentId ='${e.RGGUID}'`
                    if (i < (results.length - 1)) {
                        mystr = mystr + ' UNION '
                    }
                })

                getDepartment(mystr);
            }
            const a = uuid().toLocaleUpperCase();
            if (results.length == 0) {
                res_.status(200).send(JSON.stringify({
                    status: 200,
                    error: a,
                    success: true,
                    response: arr
                }))
            }

        })
    }

})

router.post('/changeperson', async (req, res) => {

    const { personNo, N_PersonNo, N_PersonName, Type, user_id } = req.body;

    db.query('CALL SP_UpdatePersonNo(?,?,?,?,?)', [personNo, N_PersonNo, N_PersonName, Type, user_id], (err, result) => {

        if (err) return res.send(JSON.stringify({ success: false, code: 204, message: err.message }));

        res.send(JSON.stringify({ success: true, code: 0, message: '' }));
    })
})

function checkExistItem(list, item) {
    var inPos = -1;
    inPos = list.findIndex(e => e.PER_ID == item);
    if (inPos == -1) {
        return false;
    }
    return true;
}

function checkCardType(PersonNo) {
    return (PersonNo.length < 9) ? false : true;
}

function getCountRecord(list, PersonNo) {
    var count = 0;
    list.map(e => {
        if (e.PersonNO == PersonNo) {
            count = e.Count;
        }
    })
    return count;
}

router.post("/insertNewPerson", async (req, res) => {

    const { PER_ID_, PER_NAME_, SEX_, COUNTRY_, CALL_, OLD_ID, Type, user_id } = req.body;
    var UID = uuid().toLocaleUpperCase();
    if (!OLD_ID) { return res.send(JSON.stringify({ success: false, code: 205, message: error })); }
    if (!PER_ID_) { return res.send(JSON.stringify({ success: false, code: 205, message: error })); }
    if (!PER_NAME_) { return res.send(JSON.stringify({ success: false, code: 205, message: error })); }
    if (!SEX_) { return res.send(JSON.stringify({ success: false, code: 205, message: error })); }
    if (!COUNTRY_) { return res.send(JSON.stringify({ success: false, code: 205, message: error })); }
    if (!Type) { return res.send(JSON.stringify({ success: false, code: 205, message: error })); }
    if (!user_id) { return res.send(JSON.stringify({ success: false, code: 205, message: error })); }

    try {
        var sqltr = `INSERT INTO PER_PERSON(PER_PERSONOID,USER_ID,PER_ID,PER_NAME,SEX_ID,POLITICS,CALL,PER_STATUS) VALUES ('${UID}','ADMIN','${PER_ID_}','${PER_NAME_}','${SEX_}','${COUNTRY_}',${CALL_},'1')`;
        console.log(sqltr)
        await sql.connect(sqlConfig);
        const result = await sql.query(sqltr);



        console.log(OLD_ID, PER_ID_)
        console.log('change person No')
        db.query('CALL SP_UpdatePersonNo(?,?,?,?,?)', [OLD_ID, PER_ID_, PER_NAME_, Type, user_id], (err, result) => {
            if (err) return res.send(JSON.stringify({ success: false, code: 204, message: err.message }));

            res.send(JSON.stringify({ success: true, code: 0, message: result }));
        })


    } catch (error) {
        console.log(error)
        res.send(JSON.stringify({ success: false, code: 204, message: error }));
    }

})

router.get('/getlistsync', (req, res) => {
    try {
        const mysql = 'SELECT  * from sys_person_sysnc'
        db.query(mysql, (err, result) => {
            res.send(JSON.stringify({ success: true, code: 0, response: result }));
        })
    } catch (error) {
        res.send(JSON.stringify({ success: false, code: 209, message: error }));
    }

})

function uuid() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}



module.exports = router;
