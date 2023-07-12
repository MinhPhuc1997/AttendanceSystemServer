const express = require('express')
const router = express.Router()

var db = require('../models/db');

router.get('/', (req, res) => {
    try {
        if(!global.sp_shift) return res.status(500).json({ success: false, message: 'Internal server error', error:201 })
        db.query(sp_shift, (err, results) => {
            if (err) throw err;
            res.send(JSON.stringify({ status: 200, error: null, response: results[0] }));
        })
    } catch (error) {
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
})

router.post('/add', (req, res) => {
 

    const { name, timstart, timeend, timebreak, timekeepstart1, timekeepstart2, timekeepstart3, timekeepstart4, timekeepend1, timekeepend2, timekeepend3, timekeepend4, nightshift, note } = req.body;

    if (!name) return res.status(400).json({ success: false, message: 'name shift is required' })
    if (!timekeepstart1) return res.status(400).json({ success: false, message: 'Timekeeping start 1 is required' })
    if (!timekeepstart4) return res.status(400).json({ success: false, message: 'Timekeeping start 1 is required' })
    if (!timekeepend1) return res.status(400).json({ success: false, message: 'Timekeeping end 4 is required' })
    if (!timekeepend4) return res.status(400).json({ success: false, message: 'Timekeeping end 4 is required' })

    try {
        if(!global.sp_shiftAdd) return res.status(500).json({ success: false, message: 'Internal server error', error:202 })
        db.query(global.sp_shiftAdd, [name, timstart, timeend, timebreak, timekeepstart1, timekeepstart2, timekeepstart3, timekeepstart4, timekeepend1, timekeepend2, timekeepend3, timekeepend4, nightshift, note], (err, result) => {
            if (err) throw err;
            
            res.json({ success: true, message: 'Insert new row sucessfully!' })
        })
    } catch (error) {
        res.status(500).json({ success: false, message: 'Internal server error' })
    }

})

router.post('/update', (req, res) => {

    const { id,name, timstart, timeend, timebreak, timekeepstart1, timekeepstart2, timekeepstart3, timekeepstart4, timekeepend1, timekeepend2, timekeepend3, timekeepend4, nightshift, note } = req.body;

    if (!name) return res.status(400).json({ success: false, message: 'name shift is required' })
    if (!timekeepstart1) return res.status(400).json({ success: false, message: 'Timekeeping start 1 is required' })
    if (!timekeepstart4) return res.status(400).json({ success: false, message: 'Timekeeping start 1 is required' })
    if (!timekeepend1) return res.status(400).json({ success: false, message: 'Timekeeping end 4 is required' })
    if (!timekeepend4) return res.status(400).json({ success: false, message: 'Timekeeping end 4 is required' })
    try {
        if(!global.sp_shiftEdit) return res.status(500).json({ success: false, message: 'Internal server error', error:203 })
        db.query(global.sp_shiftEdit, [id,name, timstart, timeend, timebreak, timekeepstart1, timekeepstart2, timekeepstart3, timekeepstart4, timekeepend1, timekeepend2, timekeepend3, timekeepend4, nightshift, note], (err, result) => {
            if (err) throw err;
            
            res.json({ success: true, message: 'Update new row sucessfully!'})
        })
    } catch (error) {
        res.status(500).json({ success: false, message: 'Internal server error' })
    }
})

router.post('/delete', (req, res) => {
    

    try {
        const { id } = req.body;
        if (!id) return res.status(400).json({ success: false, message: 'shift id is required' })

        if(!global.sp_shiftDel) return res.status(500).json({ success: false, message: 'Internal server error', error:204 })
        db.query(global.sp_shiftDel, [id], (err, result) => {
            if (err) throw err;
           
            res.json({ success: true, message: 'Delete new row sucessfully!' })
        })
    } catch (error) {
        res.status(500).json({ success: false, message: 'Internal server error' })
    }
})

module.exports = router;