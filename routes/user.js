const express = require('express');
const router = express.Router();
var db = require("../models/db");

router.post('/login', async (req, res) => {

    const { username, password } = req.body;

    if (!username || !password)
        return res
            .status(200)
            .json({
                success: false,
                code: -1,
                message: 'Missing username and/or password'
            })

    try {
        db.query('CALL SP_LoginWeb(?,?)', [username, password], (err, result) => {
            if (result!=null && result.length>0&& result[0].length) {
                res.status(200).json({
                    success: true,
                    message: '',
                    code: 0,
                    admin: result[0][0].admin,
                    data: {
                        permissions: [{ id: 'queryForm', operation: ['add', 'edit'] }],
                        roles: [{ id: 'test', operation: ['add', 'edit', 'delete'] }],

                        message: '你好，欢迎回来',
                        user: {
                            name: result[0][0].fullname,
                            avatar: result[0][0].avatar,
                            address: '',
                            position: ''
                        },
                        token: 'Authorization:' + Math.random(),
                        expireAt: new Date(new Date().getTime() + result[0][0].expireAt * 60 * 1000)
                    }
                })
            } else {
                res
                    .status(200)
                    .json({
                        success: false,
                        code: -1,
                        message: 'Plase check your username or password'
                    })
            }
        })


    } catch (error) {

        res.status(200).json({ success: false, code: -1, message: 'Internal server error' })
    }
})

router.post('/routes', (req, res) => {
    (req.body.admin == 1) ? res.send({
        code: 1,
        data: [{
            router: 'root',
            children: [
                {
                    router: 'AttendanceData',
                    children: ['QueryData']
                },

                {
                    router: 'EditData',
                    children: ['repairs', 'repairs1', 'QueryRepair',]
                },
                {
                    router: 'sync',
                    children: ['person', 'personERP'] //'personERP'
                },
            ]
        }]
    }) : res.send({
        code: 1,
        data: [{
            router: 'root',
            children: [
                {
                    router: 'AttendanceData',
                    children: ['QueryData']
                },
                {
                    router: 'sync',
                    children: ['person', 'personERP']
                },
            ]
        }]
    })
})

module.exports = router