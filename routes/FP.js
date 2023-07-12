const express = require('express')
const router = express.Router();
var fs = require('fs');
var db = require('../models/db');
var utils = require("../utils/tool.js");
var exp = require("../utils/export.js");
const { sqlConfigMCC, sqlMCC } = require('../models/sql');


router.get('/test', async (req, res) => {
    res.send("asd")
})

router.get('/year', async (req, res) => {
    try {
        const sqltr = `SELECT DISTINCT YEAR(NgayCham) as YEAR from CheckInOut ORDER BY  YEAR(NgayCham) ASC`;
        await sqlMCC.connect(sqlConfigMCC)
        var data = await sqlMCC.query(sqltr);
        res.send(JSON.stringify({ success: true, code: 0, message: "", response: data.recordset }));
        sqlMCC.close();
    } catch (error) {
        console.log(error)
        res.send(JSON.stringify({ success: true, code: 0, message: "", response: res }));
    }
})

router.get('/month', async (req, res) => {
    try {
        const { year } = req.query;

        const sqltr = `SELECT DISTINCT MONTH(NgayCham) AS MONTH FROM CheckInOut WHERE YEAR(NgayCham) = '${year}' ORDER BY  MONTH(NgayCham) ASC`;

        await sqlMCC.connect(sqlConfigMCC)
        var data = await sqlMCC.query(sqltr);
        sqlMCC.close();
        res.send(JSON.stringify({ success: true, code: 0, message: "", response: data.recordset }));

    } catch (error) {
        res.send({ success: false, code: 101, message: error, response: result });
    }
})

router.get('/department', async (req, res) => {

    const sqltr = `SELECT CONGTY.MaCongTy,TenCongTy,KHUVUC.MaKhuVuc,TenKhuVuc,MaPhongBan,TenPhongBan FROM CONGTY 
    LEFT JOIN KHUVUC ON CONGTY.MaCongTy =KHUVUC.MaCongTy
    LEFT JOIN PHONGBAN on KHUVUC.MaKhuVuc = PHONGBAN.MaKhuVuc`

    try {
        await sqlMCC.connect(sqlConfigMCC)
        var data = await sqlMCC.query(sqltr);
        const r = data.recordset;
        const treedata = [];
        const company = [];



        r.map((e) => {

            const companyNo = e.MaCongTy;
            const companyName = e.TenCongTy;

            if (company.length > 0) {
                const index = company.findIndex((element) => element.value == companyNo);
                if (index == -1) {
                    company.push({
                        title: companyName,
                        value: companyNo,
                        key: companyNo,
                        children: []
                    })
                    treedata.push({
                        title: companyName,
                        value: companyNo,
                        key: companyNo,
                        children: []
                    })
                }

            } else {
                company.push({
                    title: companyName,
                    value: companyNo,
                    key: companyNo,
                    children: []
                })
                treedata.push({
                    title: companyName,
                    value: companyNo,
                    key: companyNo,
                    children: []
                })
            }
        });

        company.map((e, i) => {
            const organize = [];
            const or = r.filter(l => l.MaCongTy == e.value);

            or.map((e) => {
                const organizeNo = e.MaKhuVuc;
                const organizeName = e.TenKhuVuc;

                if (organize.length > 0) {
                    const index = organize.findIndex((element) => element.value == organizeNo);
                    if (index == -1) {
                        organize.push({
                            title: organizeName,
                            value: organizeNo,
                            key: organizeNo,
                            children: []
                        })
                    }
                } else {
                    organize.push({
                        title: organizeName,
                        value: organizeNo,
                        key: organizeNo,
                        children: []
                    })
                }
            })
            e.children = organize;
        })

        company.map((e, i) => {
            const organizeList = e.children;

            organizeList.map((el) => {
                const department = [];
                const or = r.filter(l => l.MaKhuVuc == el.value);

                or.map((element) => {
                    const departmentNo = element.MaPhongBan;
                    const departmentName = element.TenPhongBan;
                    if (departmentNo != null && departmentName != null) {
                        if (department.length > 0) {
                            const index = department.findIndex((element) => element.value == departmentNo);
                            if (index == -1) {
                                department.push({
                                    title: departmentName,
                                    value: departmentNo,
                                    key: departmentNo,

                                })
                            }
                        } else {
                            department.push({
                                title: departmentName,
                                value: departmentNo,
                                key: departmentNo,
                            })
                        }
                    }

                })


                el.children = department;
            })
        })
        sqlMCC.close();
        res.send(JSON.stringify({ success: true, code: 0, message: "", response: company }));
    } catch (error) {
        console.log(error)
        res.send({ success: false, code: 101, message: error, response: '' });
    }
})



module.exports = router;