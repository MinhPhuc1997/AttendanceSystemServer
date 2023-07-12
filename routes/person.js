const express = require('express')
const router = express.Router()
const { sqlConfig, sql } = require('../models/sql');
var db = require('../models/db');
const fs = require('fs');
const axios = require('axios');

const utils = require("../utils/tool")
router.get('/', (req, res) => {
    db.query('CALL SP_getPerson(?)', ['0'], (err, results) => {
        res.status(200).send(JSON.stringify({ status: 200, error: null, success: true, response: results[0] }))
    })
})

router.post('/getPersonSync', async (req, res) => {

    const { personNO, personName, phone, post, organize, listOrganize, imageType, department, country, arrayPost } = req.body;

    const MSQL = `SELECT PersonNo FROM control_person `;
    var MSSQL = 'select A.PER_PERSONOID,A.PER_ID,A.PER_NAME,A.SEX_ID,A.PostID,A.POLITICS,A.CALL,B.PostName from PER_PERSON AS A LEFT JOIN UCML_Post AS B ON A.PostID = B.PostID where PER_STATUS=1 ';

    var strlistpost = '';
    var strpost = '';
    var strcontry = ''
    var strphone = ''

    if (organize != '') {
        if (arrayPost.length < 3 && arrayPost.length > 1) {
            strlistpost = `AND A.PostID = ${arrayPost[1].PostID}`
        }

        if ((arrayPost.length) > 2) {
            strlistpost = 'AND ( ';
            arrayPost.map((item, i) => {
                if (i != 0) {
                    strlistpost = strlistpost + `A.PostID = ${item.PostID}`;
                    if (i < arrayPost.length - 1) {
                        strlistpost = strlistpost + ' OR '
                    }
                }
            })
            strlistpost = strlistpost + ' )';
        }
    }

    // if (post != '') {
    //     strpost = ` AND A.PostID='${post}'`
    // }

    // if (country != '0') {
    //     strcontry = ` AND POLITICS = ${country} `
    // }

    // if (phone != '') {
    //     strphone = ` AND CALL LIKE '%${phone}%'`
    // }
    // MSSQL = MSSQL + ` AND PER_ID like N'%${personNO.toString().trim()}%' AND PER_NAME like N'%${personName.toString().trim()}%'` + strpost + strcontry + strphone + strlistpost;

    var ListPersonMSQL = [];
    var ListPersonMSSQL = [];
    var listResult = [];
   
    try {
        await sql.connect(sqlConfig);
        ListPersonMSSQL = await sql.query(MSSQL);

        Promise.all([ListPersonMSSQL]).then(() => {
            //  res.send(ListPersonMSSQL.recordsets[0])
        })
     
        db.query(MSQL, async (err, result) => {
            ListPersonMSQL = result; 
            // console.log(ListPersonMSQL)
            // res.send(ListPersonMSQL)
            if (ListPersonMSSQL.recordsets[0].length > 0 && ListPersonMSQL.length > 0) {
                const personlist = ListPersonMSSQL.recordsets[0];
                for (let index = 0; index < personlist.length; index++) {
                    const e = personlist[index];
                    var check = checkExist(e.PER_ID, ListPersonMSQL);
                    if(check==false){
                        Person_ID = e.PER_PERSONOID;
                        const img = await utils.tool.getImgeFromID(Person_ID.toLowerCase());
                    
                            if (imageType == '1') {
                                if (img != '') { 
                                    listResult.push({
                                        PER_ID: e.PER_ID,
                                        PER_NAME: e.PER_NAME,
                                        CALL: e.CALL,
                                        PostID: e.PostID,
                                        SEX_ID: (e.SEX_ID == 'L') ? 0 : 1,
                                        image: img,
                                        type: check,
                                        postName: e.PostName
                                    })
                                }
                            } else if (imageType == '2') {
                                if (img == '') {
                                    listResult.push({
                                        PER_ID: e.PER_ID,
                                        PER_NAME: e.PER_NAME,
                                        CALL: e.CALL,
                                        PostID: e.PostID,
                                        SEX_ID: (e.SEX_ID == 'L') ? 0 : 1,
                                        image: img,
                                        type: check,
                                        postName: e.PostName
                                    }) 
                                }
        
                            } else {
                                listResult.push({
                                    PER_ID: e.PER_ID,
                                    PER_NAME: e.PER_NAME,
                                    CALL: e.CALL,
                                    PostID: e.PostID,
                                    SEX_ID: (e.SEX_ID == 'L') ? 0 : 1,
                                    image: img,
                                    type: check,
                                    postName: e.PostName
                                })
                            }
                       
                    }
                   
                }
            }
            res.send(JSON.stringify({
                success: true,
                code: 0,
                length: listResult.length,
                response: listResult
            }))

        })

    } catch (error) {
        console.log(error)
    }

    function checkExist(ID, List) {
        var inPos = List.findIndex(e => e.PersonNo.trim() == ID.trim());
        if (inPos == -1) {
            return false;
        } else {
            return true;
        }
    }
})

router.post('/createSync', async (req, res) => {

    const { personNo, personName, sex, phone, image } = req.body;
    
    let newName = utils.tool.removeAccents(personName)
    console.log( newName);
    db.query(`CALL SP_InsertPerson(?,?,?,?,?)`, [personNo, newName, sex, phone, ''], async (error, result) => {
        if (error) return res.send(JSON.stringify({
            success: false,
            code: 123,
            message: error.message
        }));
        const name = result[0][0].PGUID_;
        const url = 'http://192.168.5.2:3000/api/image'
        const listIm = image.split('.');

        if (image != '') {
            var date = new Date();
            var month = date.getUTCMonth() + 1;
            var month_ = (month < 10) ? `0${month}` : month;
            var year = date.getUTCFullYear();
            var image_ = `down/head/${year}/${month_}/${name}_.${listIm[1]}`

            db.query(`CALL SP_UpdatePerson(?,?,?,?,?,?)`, [personNo, toNonAccentVietnamese(personName), sex, phone, image_, name], (error, result) => {
                if (error)
                    console.log(error)
            })
            const data = {
                "ListImage": [{
                    "path": `http://192.168.5.1:81/File/Images/PER_PERSON_PHOTO/00000000-0000-0000-0000-000000000001${image}`,
                    "postion": `D:/dataJielink/FileSavePath/head/${year}/${month_}/${name}_.${listIm[1]}`
                }]
            };
            let resss = await axios.post(url, data)
            Promise.all([resss]).then(() => {

            })
        }

    })
    res.send(JSON.stringify({
        success: true,
        code: 0,
        message: ''
    }));
})

function toNonAccentVietnamese(str) {
    str = str.replace(/A|Á|À|Ã|Ạ|Â|Ấ|Ầ|Ẫ|Ậ|Ă|Ắ|Ằ|Ẵ|Ặ/g, "A");
    str = str.replace(/à|á|ạ|ả|ã|â|ầ|ấ|ậ|ẩ|ẫ|ă|ằ|ắ|ặ|ẳ|ẵ/g, "a");
    str = str.replace(/E|É|È|Ẽ|Ẹ|Ê|Ế|Ề|Ễ|Ệ/, "E");
    str = str.replace(/è|é|ẹ|ẻ|ẽ|ê|ề|ế|ệ|ể|ễ/g, "e");
    str = str.replace(/I|Í|Ì|Ĩ|Ị/g, "I");
    str = str.replace(/ì|í|ị|ỉ|ĩ/g, "i");
    str = str.replace(/O|Ó|Ò|Õ|Ọ|Ô|Ố|Ồ|Ỗ|Ộ|Ơ|Ớ|Ờ|Ỡ|Ợ/g, "O");
    str = str.replace(/ò|ó|ọ|ỏ|õ|ô|ồ|ố|ộ|ổ|ỗ|ơ|ờ|ớ|ợ|ở|ỡ/g, "o");
    str = str.replace(/U|Ú|Ù|Ũ|Ụ|Ư|Ứ|Ừ|Ữ|Ự/g, "U");
    str = str.replace(/ù|ú|ụ|ủ|ũ|ư|ừ|ứ|ự|ử|ữ/g, "u");
    str = str.replace(/Y|Ý|Ỳ|Ỹ|Ỵ/g, "Y");
    str = str.replace(/ỳ|ý|ỵ|ỷ|ỹ/g, "y");
    str = str.replace(/Đ/g, "D");
    str = str.replace(/đ/g, "d");
    // Some system encode vietnamese combining accent as individual utf-8 characters
    str = str.replace(/\u0300|\u0301|\u0303|\u0309|\u0323/g, ""); // Huyền sắc hỏi ngã nặng 
    str = str.replace(/\u02C6|\u0306|\u031B/g, ""); // Â, Ê, Ă, Ơ, Ư
    return str;
}

router.post('/updateSync', async (req, res) => {

    const { personNo, personName, sex, phone, image } = req.body;
    db.query(`SELECT PGUID FROM control_person WHERE PersonNo ='${personNo}'`, async (error, result) => {
        if (error) return res.send(JSON.stringify({
            success: false,
            code: 123,
            message: error.message
        }))

        const name = result[0].PGUID;
        const url = 'http://192.168.5.2:3000/api/image'

        if (image != '') {
            const listIm = image.split('.');
            var date = new Date();
            var month = date.getUTCMonth() + 1;
            var month_ = (month < 10) ? `0${month}` : month;
            var year = date.getUTCFullYear();
            var image_ = `down/head/${year}/${month_}/${name}_.${listIm[1]}`
            db.query(`CALL SP_UpdatePerson(?,?,?,?,?,?)`, [personNo, toNonAccentVietnamese(personName), sex, phone, image_, name], (error, result) => {
                if (error)
                    console.log(error)

            })
            const data = {
                "ListImage": [{
                    "path": `http://192.168.5.1:81/File/Images/PER_PERSON_PHOTO/00000000-0000-0000-0000-000000000001${image}`,
                    "postion": `D:/dataJielink/FileSavePath/head/${year}/${month_}/${name}_.${listIm[1]}`
                }]
            };
            let resss = await axios.post(url, data)
            Promise.all([resss]).then(() => { })

        } else {
            db.query(`CALL SP_UpdatePerson(?,?,?,?,?,?)`, [personNo, personName, sex, phone, '', name], (error, result) => {
                if (error)
                    console.log(error)

            })
        }

    });
    res.status(200).send(JSON.stringify({
        success: true,
        code: 0,
        message: ''
    }));

})



module.exports = router;