const express = require('express')
const router = express.Router();
var fs = require('fs');
var db = require('../models/db');
var utils = require("../utils/tool.js");
var exp = require("../utils/export.js");
const {sqlConfig, sql, sqlConfigMCC, sqlMCC} = require('../models/sql');
const e = require('express');
const {tool} = require("../utils/tool");

router.post('/calculate', async (req, res) => {
    processDataEx(req, res);
})

function processDataEx(req, res) {
    var ress = res;
    var arrayDataAttenedance = [];
    var arrResult = [];
    var arrPerson = [];

    try {
        let {
            daystart,
            dayend,
            personNO,
            personName,
            status,
            type,
            shift,
            country,
            organize
        } = req.body;

        if (!daystart || !dayend) return res.status(400).json({success: false, message: 'Date is required'})

        if (!type) return res.status(400).json({success: false, message: 'Type is required'})

        if (Date.parse(daystart) != isNaN && Date.parse(dayend) != isNaN) {

            var m_date_end = utils.tool.addDate(dayend, 3);

            personNO = (personNO == "" && country == 1) ? "ST" : personNO;

            db.query(global.sp_query, [daystart, m_date_end, `%${personNO.toString().trim()}%`, type], async (err, results) => {
                if (err) throw err;
                arrayDataAttenedance = results[0];
                await sql.connect(sqlConfig)
                var strPer = "WITH recursive_menu AS (\n" +
                    "  SELECT UCML_OrganizeOID, OrgName\n" +
                    "  FROM UCML_Organize\n" +
                    "  WHERE ParentOID = '" + organize + "' OR UCML_OrganizeOID ='" + organize + "'\n" +
                    "  UNION ALL\n" +
                    "  SELECT m.UCML_OrganizeOID, m.OrgName\n" +
                    "  FROM UCML_Organize m\n" +
                    "  JOIN recursive_menu rm ON rm.UCML_OrganizeOID = m.ParentOID\n" +
                    ")\n" +
                    "SELECT DISTINCT a.PER_ID,a.PER_NAME,a.OrgName  FROM PER_PERSON a \n" +
                    "INNER JOIN recursive_menu b ON a.UCML_Organize_FK = b.UCML_OrganizeOID\n" +
                    "WHERE a.POLITICS =" + country + " AND a.PER_STATUS<>3  AND a.PER_ID like '%" + personNO + "%' AND a.PER_NAME like '%" + personName + "%'";

                var res = await sql.query(strPer);

                arrPerson = res.recordsets[0];

                var sqltr = 'SELECT PER_SHIFT.PS_INC,PS_BATTH,PS_TYPE,PS_CLASS,PS_SEQ1,PS_SEQ2,PS_SEQ3,IS_SELECT1 ,IS_SELECT2,IS_SELECT3 ,PS_WORKHOUR1,PS_WORKHOUR2,PS_WORKHOUR3, PS_OFFWORK1,PS_OFFWORK2,PS_OFFWORK3,PS_MINUUES_A1,PS_MINUUES_A2,PS_MINUUES_A3,PS_MINUUES_B1,PS_MINUUES_B2,PS_MINUUES_B3,PS_MINUUES_C1,PS_MINUUES_C2,PS_MINUUES_C3,PER_ID,IS_CrossDay1,IS_CrossDay2,IS_CrossDay3 , CodeName,  PS_DATE ,PER_SCHEDUE.SYS_Created' +
                    ` FROM PER_SHIFT,PER_SCHEDUE,CodeValue WHERE  PER_SHIFT.PS_INC = PER_SCHEDUE.PS_INC AND PS_DATE <= '${dayend}' and  PS_DATE > ='${daystart}' and CodeTableID ='eWDFS_12'  and CodeID = PS_TYPE`;
                if (personNO) {
                    sqltr = sqltr + ` AND PER_ID like N'%${personNO.toString().trim()}%'`
                }
                if (shift) {
                    sqltr = sqltr + ` AND PS_BATTH = '${shift}'`
                }

                sqltr = sqltr + ` ORDER BY PS_DATE,PER_SCHEDUE.SYS_Created DESC`
                console.log(sqltr)
                var res = await sql.query(sqltr)
                resultTime = res.recordsets[0]


                sqlholidaystr = `SELECT FORMAT (PH_DATE, 'yyyy-MM-dd') as date FROM PER_PUBLICHOLIDAY`;

                sqlholidayApply = `SELECT PER_ID,FORMAT(HA_SDATE,'yyyy-MM-dd') as HA_SDATE,FORMAT (HA_EDATE,'yyyy-MM-dd') as HA_EDATE ,HA_DAYS,HA_STIME FROM PER_HOLIDAYAPPLY WHERE PER_ID like N'%${personNO.toString().trim()}%'`


                var hol = await sql.query(sqlholidaystr)
                var res_HA = await sql.query(sqlholidayApply)

                const holiday = hol.recordsets[0];

                const Array_HA = res_HA.recordsets[0]

                const sqlOrg = 'SELECT postID,PostName ,OrgNo, ORGName,Text1 from UCML_Post LEFT JOIN UCML_Organize ON UCML_Post.UCML_DivisionOID=UCML_Organize.UCML_OrganizeOID';
                const org = await sql.query(sqlOrg)
                const orgList = org.recordsets[0];

                sql.close();
                // FP -- config
                const dayyend = utils.tool.addDate(dayend, 2)
                // const FPStr = `SELECT NHANVIEN.MaNhanVien,NgayCham,  FORMAT (GioCham, 'HH:mm:ss ') as Time FROM NHANVIEN,CheckInOut WHERE MaNhanVien LIKE '%${personNO.toString().trim()}%' AND TenNhanVien LIKE '%%'  AND CheckInOut.MaChamCong=NHANVIEN.MaChamCong
                // AND NgayCham >='${daystart}' AND NgayCham<='${dayyend}'`

                try {
                    arrPerson.map(element => {
                        var start = new Date(daystart);
                        var end = new Date(dayend);
                        var loop = new Date(start);

                        while (loop <= end) {
                            var dt = new Date(loop)
                            MM = (dt.getMonth() + 1) < 10 ? `0${(dt.getMonth() + 1)}` : (dt.getMonth() + 1);
                            //  console.log('lenmon', mon < 10)
                            var date = dt.getFullYear() + '-' + MM + '-' + (dt.getDate());
                            var date2 = dt.getFullYear() + '-' + (dt.getMonth() + 1) + '-' + (dt.getDate());
                            //   console.log(holiday.findIndex(e => Date(e) == Date(date)))
                            const hols = checkDateInList(holiday, date);
                            const PER_HA = checkDateApplyInList(Array_HA, date, element.PER_ID);

                            var resultTimeOnePerson = resultTime.filter(e => (e.PS_DATE.getFullYear() + '-' + (e.PS_DATE.getMonth() + 1) + '-' + e.PS_DATE.getDate()) == date2 && e.PER_ID == element.PER_ID);

                            if (resultTimeOnePerson.length > 0) {
                                resultTimeOnePerson.sort((a, b) => {
                                    return a.SYS_Created > b.SYS_Created ? -1 : 1
                                })
                            }
                            var ShiftID = '';
                            var ShiftName = '';
                            var TimeKeepStart1 = '';
                            var TimeKeepEnd1 = '';
                            var TimeKeepStart2 = '';
                            var TimeKeepEnd2 = '';
                            var TimeKeepStart3 = '';
                            var TimeKeepEnd3 = '';
                            var TimeKeepStart4 = '';
                            var TimeKeepEnd4 = '';
                            var TimeKeepStart5 = '';
                            var TimeKeepEnd5 = '';
                            var TimeKeepStart6 = '';
                            var TimeKeepEnd6 = '';
                            var TimeLate1 = '';
                            var TimeLate2 = '';

                            var TimeKeepEnd1_ = '';
                            var TimeKeepEnd2_ = '';
                            var TimeKeepEnd3_ = '';
                            var TimeKeepEnd4_ = '';
                            var TimeKeepEnd5_ = '';
                            var TimeKeepEnd6_ = '';

                            var TimeHolidayApply1 = '';
                            var TimeHolidayApply2 = '';
                            var TimeHolidayApply3 = '';

                            var timestart1 = global.timeEmpty;
                            var timestart2 = global.timeEmpty;
                            var timestart3 = global.timeEmpty;
                            var timeend1 = global.timeEmpty;
                            var timeend2 = global.timeEmpty;
                            var timeend3 = global.timeEmpty;

                            var PS_WORKHOUR1 = '';
                            var PS_OFFWORK1 = '';
                            var PS_WORKHOUR2 = '';
                            var PS_OFFWORK2 = '';
                            var PS_WORKHOUR3 = '';
                            var PS_OFFWORK3 = '';

                            var IS_CrossDay1 = null;
                            var IS_CrossDay2 = null;
                            var IS_CrossDay3 = null;


                            if (resultTimeOnePerson.length > 0) {

                                resultTimeOnePerson = resultTimeOnePerson[0];

                                if (resultTimeOnePerson.IS_SELECT1) {
                                    PS_WORKHOUR1 = new Date(resultTimeOnePerson.PS_WORKHOUR1.toUTCString());
                                    PS_OFFWORK1 = new Date(resultTimeOnePerson.PS_OFFWORK1.toUTCString());

                                    TimeKeepStart1 = utils.tool.subTime(PS_WORKHOUR1.getUTCHours(), PS_WORKHOUR1.getUTCMinutes(), resultTimeOnePerson.PS_MINUUES_A1);
                                    TimeKeepEnd1 = utils.tool.addTime(PS_WORKHOUR1.getUTCHours(), PS_WORKHOUR1.getUTCMinutes(), resultTimeOnePerson.PS_MINUUES_B1);

                                    TimeKeepStart2 = utils.tool.subTime(PS_OFFWORK1.getUTCHours(), PS_OFFWORK1.getUTCMinutes(), 0);
                                    TimeKeepEnd2 = utils.tool.addTime(PS_OFFWORK1.getUTCHours(), PS_OFFWORK1.getUTCMinutes(), resultTimeOnePerson.PS_MINUUES_C1);

                                    TimeKeepEnd1_ = utils.tool.addTime(PS_WORKHOUR1.getUTCHours(), PS_WORKHOUR1.getUTCMinutes(), 0);
                                    TimeKeepEnd2_ = utils.tool.addTime(PS_OFFWORK1.getUTCHours(), PS_OFFWORK1.getUTCMinutes(), 0);
                                    if (PER_HA) {
                                        TimeHolidayApply1 = utils.tool.addTime(PS_WORKHOUR1.getUTCHours(), PS_WORKHOUR1.getUTCMinutes(), 0);
                                    }

                                }

                                if (resultTimeOnePerson.IS_SELECT2) {
                                    PS_WORKHOUR2 = new Date(resultTimeOnePerson.PS_WORKHOUR2.toUTCString());
                                    PS_OFFWORK2 = new Date(resultTimeOnePerson.PS_OFFWORK2.toUTCString());

                                    TimeKeepStart3 = utils.tool.subTime(PS_WORKHOUR2.getUTCHours(), PS_WORKHOUR2.getUTCMinutes(), resultTimeOnePerson.PS_MINUUES_A2);
                                    TimeKeepEnd3 = utils.tool.addTime(PS_WORKHOUR2.getUTCHours(), PS_WORKHOUR2.getUTCMinutes(), resultTimeOnePerson.PS_MINUUES_B2);

                                    TimeKeepStart4 = utils.tool.subTime(PS_OFFWORK2.getUTCHours(), PS_OFFWORK2.getUTCMinutes(), 0);


                                    TimeKeepEnd3_ = utils.tool.addTime(PS_WORKHOUR2.getUTCHours(), PS_WORKHOUR2.getUTCMinutes(), 0);
                                    TimeKeepEnd4_ = utils.tool.addTime(PS_OFFWORK2.getUTCHours(), PS_OFFWORK2.getUTCMinutes(), 0);

                                    TimeKeepEnd4 = utils.tool.addTime(PS_OFFWORK2.getUTCHours(), PS_OFFWORK2.getUTCMinutes(), resultTimeOnePerson.PS_MINUUES_C2);

                                    if (PER_HA) {
                                        TimeHolidayApply2 = utils.tool.addTime(PS_OFFWORK2.getUTCHours(), PS_OFFWORK2.getUTCMinutes(), 0);
                                    }
                                    //   console.log(TimeKeepStart3, TimeKeepEnd3)
                                }

                                if (resultTimeOnePerson.IS_SELECT3) {
                                    PS_WORKHOUR3 = new Date(resultTimeOnePerson.PS_WORKHOUR3.toUTCString());
                                    PS_OFFWORK3 = new Date(resultTimeOnePerson.PS_OFFWORK3.toUTCString());

                                    TimeKeepStart5 = utils.tool.subTime(PS_WORKHOUR3.getUTCHours(), PS_WORKHOUR3.getUTCMinutes(), resultTimeOnePerson.PS_MINUUES_A3);
                                    TimeKeepEnd5 = utils.tool.addTime(PS_WORKHOUR3.getUTCHours(), PS_WORKHOUR3.getUTCMinutes(), resultTimeOnePerson.PS_MINUUES_B3);

                                    TimeKeepStart6 = utils.tool.subTime(PS_OFFWORK3.getUTCHours(), PS_OFFWORK3.getUTCMinutes(), 0);

                                    TimeKeepEnd5_ = utils.tool.addTime(PS_WORKHOUR3.getUTCHours(), PS_WORKHOUR3.getUTCMinutes(), 0);
                                    TimeKeepEnd6_ = utils.tool.addTime(PS_OFFWORK3.getUTCHours(), PS_OFFWORK3.getUTCMinutes(), 0);

                                    TimeKeepEnd6 = utils.tool.addTime(PS_OFFWORK3.getUTCHours(), PS_OFFWORK3.getUTCMinutes(), resultTimeOnePerson.PS_MINUUES_C3);

                                    if (PER_HA) {
                                        TimeHolidayApply3 = utils.tool.addTime(PS_OFFWORK3.getUTCHours(), PS_OFFWORK3.getUTCMinutes(), 0);
                                    }

                                }

                                IS_CrossDay1 = resultTimeOnePerson.IS_CrossDay1;
                                IS_CrossDay2 = resultTimeOnePerson.IS_CrossDay2;
                                IS_CrossDay3 = resultTimeOnePerson.IS_CrossDay3;

                                ShiftName = resultTimeOnePerson.CodeName,
                                    ShiftID = resultTimeOnePerson.PS_BATTH,
                                    TimeLate2 = PS_WORKHOUR2.getUTCHours() + ':' + PS_WORKHOUR2.getUTCMinutes();
                                TimeLate1 = PS_WORKHOUR1.getUTCHours() + ':' + PS_WORKHOUR1.getUTCMinutes();

                                var dataTime = {
                                    TimeKeepStart1: TimeKeepStart1,
                                    TimeKeepStart2: TimeKeepStart2,
                                    TimeKeepStart3: TimeKeepStart3,
                                    TimeKeepStart4: TimeKeepStart4,
                                    TimeKeepStart5: TimeKeepStart5,
                                    TimeKeepStart6: TimeKeepStart6,
                                    TimeKeepEnd1: TimeKeepEnd1,
                                    TimeKeepEnd2: TimeKeepEnd2,
                                    TimeKeepEnd3: TimeKeepEnd3,
                                    TimeKeepEnd4: TimeKeepEnd4,
                                    TimeKeepEnd5: TimeKeepEnd5,
                                    TimeKeepEnd6: TimeKeepEnd6,
                                    IS_CrossDay1: IS_CrossDay1,
                                    IS_CrossDay2: IS_CrossDay2,
                                    IS_CrossDay3: IS_CrossDay3,
                                }

                                let PersonData = arrayDataAttenedance.filter(e => e.PersonNO.trim() == element.PER_ID.trim());


                                timestart1 = utils.tool.getTime(PersonData, [], element.PER_ID, loop, 1, dataTime, '');

                                timeend1 = utils.tool.getTime(PersonData, [], element.PER_ID, loop, 2, dataTime, '');
                                timestart2 = utils.tool.getTime(PersonData, [], element.PER_ID, loop, 3, dataTime, '');

                                timeend2 = utils.tool.getTime(PersonData, [], element.PER_ID, loop, 4, dataTime, '');
                                timestart3 = utils.tool.getTime(PersonData, [], element.PER_ID, loop, 5, dataTime, '');

                                timeend3 = utils.tool.getTime(PersonData, [], element.PER_ID, loop, 6, dataTime, '');

                                if (timeend1 == timestart2) {
                                    timestart2 = "";
                                }
                                if (timeend2 == timestart3) {
                                    timestart3 = "";
                                }

                                if (utils.tool.CheckNoonTime(timeend1, timestart2)) {
                                    var temptime = timeend1;
                                    timeend1 = timestart2;
                                    timestart2 = temptime;
                                }

                                if (utils.tool.convertTimeToMinutes(timeend1) == utils.tool.convertTimeToMinutes(timestart2)) {
                                    timeend1 = ''
                                }
                                // if (element.PER_ID="ST0035"){
                                //     console.log(utils.tool.formatDate(loop.toUTCString()),timestart1,timeend1,timestart2,timeend2)
                                // }

                            }

                            if (!true) {
                                if (timestart1 != timeEmpty || timestart2 != timeEmpty || timestart3 != timeEmpty || timeend1 != timeEmpty || timeend2 != timeEmpty || timeend3 != timeEmpty) {
                                    const organ = findDepartment(orgList, element.PostID);
                                    arrResult.push({
                                        Date: utils.tool.formatDate(loop.toUTCString()),
                                        PersonNO: element.PER_ID,
                                        PersonName: element.PER_NAME,
                                        Organize: organ.organize,
                                        Department: element.OrgName,
                                        PostName: element.PostName,
                                        PostID: element.PostID,
                                        ShiftID: ShiftID,
                                        shiftName: ShiftName,
                                        Time1: utils.tool.FormatTime(((PER_HA) ? TimeHolidayApply1 : timestart1)),
                                        Time2: utils.tool.FormatTime((PER_HA) ? '' : timeend1),
                                        Time3: utils.tool.FormatTime((PER_HA) ? '' : timestart2),
                                        Time4: utils.tool.FormatTime((PER_HA) ? '' : timeend2),
                                        Time5: utils.tool.FormatTime((PER_HA) ? '' : timestart3),
                                        Time6: utils.tool.FormatTime((PER_HA) ? '' : timeend3),
                                        Type: type,
                                        Status: (PER_HA) ? 0 : (hols) ? 0 : (timestart1 == timeEmpty || ((resultTimeOnePerson.IS_SELECT3) ? timeend3 : timeend2) == timeEmpty) ? 1 : 0,
                                        late1: (resultTimeOnePerson.length == 0) ? false : utils.tool.checklate(timestart1, TimeLate1),
                                        late2: (resultTimeOnePerson.length == 0) ? false : utils.tool.checklate(timestart2, TimeLate2),
                                        IS_CrossDay1: IS_CrossDay1,
                                        IS_CrossDay2: IS_CrossDay2,
                                        IS_CrossDay3: IS_CrossDay3,

                                        TimeKeepStart1: TimeKeepStart1,
                                        TimeKeepStart2: TimeKeepStart2,
                                        TimeKeepStart3: TimeKeepStart3,
                                        TimeKeepStart4: TimeKeepStart4,
                                        TimeKeepStart5: TimeKeepStart5,
                                        TimeKeepStart6: TimeKeepStart6,

                                        TimeKeepEnd1: TimeKeepEnd1_,
                                        TimeKeepEnd2: TimeKeepEnd2,
                                        TimeKeepEnd3: TimeKeepEnd3_,
                                        TimeKeepEnd4: TimeKeepEnd4,
                                        TimeKeepEnd5: TimeKeepEnd5_,
                                        TimeKeepEnd6: TimeKeepEnd6,
                                        Holiday: hols,
                                        HolidayApply: PER_HA

                                    })
                                }
                            } else {
                                const organ = findDepartment(orgList, element.PostID);
                                let check1 = (resultTimeOnePerson.IS_SELECT3 != true) ? true : (timeend1 == timeEmpty || timestart2 == timeEmpty) ? true : Math.abs(utils.tool.convertTimeToMinutes(timeend1) - utils.tool.convertTimeToMinutes(timestart2)) <= 30
                                let check2 = (resultTimeOnePerson.IS_SELECT3 != true) ? true : (timeend2 == timeEmpty || timestart3 == timeEmpty) ? true : (Math.abs(utils.tool.convertTimeToMinutes(timeend2) - utils.tool.convertTimeToMinutes(timestart3)) <= 30)
                                let check3 = timestart1 != "" && timeend1 != "" && timestart2 != "" && timeend2 != "";
                                let check4 = (resultTimeOnePerson.IS_SELECT3 != true) ? true : (timestart3 != "" && timeend3 != "");
                                let value1 = ShiftID == 'B' ? 690 : 1380;
                                let value2 = ShiftID == 'B' ? 1020 : 300;
                                let check5 = (resultTimeOnePerson.IS_SELECT3 != true) ? true : (!check1) ? true : (utils.tool.convertTimeToMinutes(timeend1) < value1) && (utils.tool.convertTimeToMinutes(timestart2) > value1) ? false : true
                                let check6 = (resultTimeOnePerson.IS_SELECT3 != true) ? true : (!check2) ? true : (utils.tool.convertTimeToMinutes(timeend2) < value2) && (utils.tool.convertTimeToMinutes(timestart3) > value2) ? false : true
                                let note = "";
                                if (!check1 || !check2) {
                                    note = note + "休息时过了30分钟";
                                }
                                if (!check3 || !check4) {
                                    note = (note === "") ? note + ",缺勤" : note + "缺勤"
                                }
                                if (!check5 || !check6) {
                                    note = (note === "") ? note + ",提前考勤" : note + "提前考勤"
                                }
                                let d = new Date(utils.tool.formatDate(loop.toUTCString()));
                                let Day = d.getDay();
                                if (ShiftID == 'A' && Day == 0) {
                                    note='星期日';
                                    check1=true;
                                    check2=true;
                                    check3=true;
                                    check4=true;
                                    check5=true;
                                    check6=true;
                                }
                                arrResult.push({
                                    Date: utils.tool.formatDate(loop.toUTCString()),
                                    PersonNO: element.PER_ID,
                                    PersonName: element.PER_NAME,
                                    Organize: organ.organize,
                                    Department: element.OrgName,
                                    PostName: element.PostName,
                                    PostID: element.PostID,
                                    ShiftID: ShiftID,
                                    shiftName: ShiftName,
                                    Time1: utils.tool.FormatTime(((PER_HA) ? TimeHolidayApply1 : timestart1)),
                                    Time2: utils.tool.FormatTime((PER_HA) ? '' : timeend1),
                                    Time3: utils.tool.FormatTime((PER_HA) ? '' : timestart2),
                                    Time4: utils.tool.FormatTime((PER_HA) ? '' : timeend2),
                                    Time5: utils.tool.FormatTime((PER_HA) ? '' : timestart3),
                                    Time6: utils.tool.FormatTime((PER_HA) ? '' : timeend3),
                                    Type: type,
                                    Note: note,
                                    Status: (PER_HA) ? 0 : (hols) ? 0 : (check1 && check2 && check3 && check4 && check5 && check6) ? 0 : 1,
                                    late1: (resultTimeOnePerson.length == 0) ? false : utils.tool.checklate(timestart1, TimeLate1),
                                    late2: (resultTimeOnePerson.length == 0) ? false : utils.tool.checklate(timestart2, TimeLate2),

                                    IS_CrossDay1: IS_CrossDay1,
                                    IS_CrossDay2: IS_CrossDay2,
                                    IS_CrossDay3: IS_CrossDay3,

                                    TimeKeepStart1: TimeKeepStart1,
                                    TimeKeepStart2: TimeKeepStart2,
                                    TimeKeepStart3: TimeKeepStart3,
                                    TimeKeepStart4: TimeKeepStart4,
                                    TimeKeepStart5: TimeKeepStart5,
                                    TimeKeepStart6: TimeKeepStart6,

                                    TimeKeepEnd1: TimeKeepEnd1_,
                                    TimeKeepEnd2: TimeKeepEnd2,
                                    TimeKeepEnd3: TimeKeepEnd3_,
                                    TimeKeepEnd4: TimeKeepEnd4,
                                    TimeKeepEnd5: TimeKeepEnd5_,
                                    TimeKeepEnd6: TimeKeepEnd6,

                                    Holiday: hols,
                                    HolidayApply: PER_HA
                                })
                            }

                            var newDate = loop.setDate(loop.getDate() + 1);
                            loop = new Date(newDate);
                        }
                    });
                    sql.close();

                    if (status != '') {
                        if (status < 2) {
                            ress.send(JSON.stringify({
                                status: 200,
                                error: null,
                                response: arrResult.filter(e => (e.Status == status) && ((shift != '') ? e.ShiftID == shift : true))
                            }));
                        } else {

                            ress.send(JSON.stringify({
                                status: 200,
                                error: null,
                                response: arrResult.filter(e => (e.late1 == true || e.late2 == true) && ((shift != '') ? e.ShiftID == shift : true))
                            }));
                        }
                    } else {
                        ress.send(JSON.stringify({
                            status: 200,
                            error: null,
                            response: arrResult.filter(e => (shift != '') ? e.ShiftID == shift : true)
                        }));
                    }

                } catch (err) {
                    console.log(err)
                    return ress.status(500).json({success: false, message: 'Internal server error', error: '101'})
                }

            })

        } else {
            return ress.status(500).json({success: false, message: 'Internal server error', error: '102'})
        }
    } catch (error) {

        return ress.status(500).json({success: false, message: 'Internal server error', error: '103'});
    }

}

function processData(req, res, all) {

    var ress = res;
    var arrayDataAttenedance = [];
    var arrResult = [];
    var arrPerson = [];

    try {
        const {
            daystart,
            dayend,
            personNO,
            personName,
            status,
            type,
            shift,
            post,
            arrayPost,
            country,
            organize
        } = req.body;

        if (!daystart || !dayend) return res.status(400).json({success: false, message: 'Date is required'})

        if (!type) return res.status(400).json({success: false, message: 'Type is required'})

        if (Date.parse(daystart) != isNaN && Date.parse(dayend) != isNaN) {

            var m_date_end = utils.tool.addDate(dayend, 3);

            db.query(global.sp_query, [daystart, m_date_end, `%${personNO.toString().trim()}%`, type], async (err, results) => {
                if (err) throw err;
                arrayDataAttenedance = results[0];

                await sql.connect(sqlConfig)

                var strlistpost = '';
                var strpost = ''

                if (organize != '') {
                    if (arrayPost.length < 3 && arrayPost.length > 1) {
                        strlistpost = `AND A.PostID = ${arrayPost[1].PostID}`
                    }

                    if ((arrayPost.length) > 2) {
                        strlistpost = 'AND ( ';
                        arrayPost.map((item, i) => {
                            //  console.log(i)
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

                if (post != '') {
                    strpost = ` AND A.PostID='${post}'`
                }

                if (country != '') {
                    strcontry = ` AND POLITICS = ${country}`
                }

                var sqlPersonStr = 'select PER_ID,PER_NAME,OrgName,B.PostName,A.PostID from PER_PERSON AS A LEFT JOIN UCML_Post AS B ON A.PostID = B.PostID where PER_STATUS=1 ';

                sqlPersonStr = sqlPersonStr + ` AND PER_ID like N'%${personNO.toString().trim()}%' AND PER_NAME like N'%${personName.toString().trim()}%'` + strpost + strcontry + strlistpost + ' ORDER BY PER_ID ASC';
                //   console.log(sqlPersonStr)
                var res = await sql.query(sqlPersonStr);
                arrPerson = res.recordsets[0];
                // console.log(sqlPersonStr)
                var sqltr = 'SELECT PER_SHIFT.PS_INC,PS_BATTH,PS_TYPE,PS_CLASS,PS_SEQ1,PS_SEQ2,PS_SEQ3,IS_SELECT1 ,IS_SELECT2,IS_SELECT3 ,PS_WORKHOUR1,PS_WORKHOUR2,PS_WORKHOUR3, PS_OFFWORK1,PS_OFFWORK2,PS_OFFWORK3,PS_MINUUES_A1,PS_MINUUES_A2,PS_MINUUES_A3,PS_MINUUES_B1,PS_MINUUES_B2,PS_MINUUES_B3,PS_MINUUES_C1,PS_MINUUES_C2,PS_MINUUES_C3,PER_ID,IS_CrossDay1,IS_CrossDay2,IS_CrossDay3 , CodeName,  PS_DATE ' +
                    `FROM PER_SHIFT,PER_SCHEDUE,CodeValue WHERE  PER_SHIFT.PS_INC = PER_SCHEDUE.PS_INC AND PS_DATE <= '${dayend}' and  PS_DATE > ='${daystart}' and CodeTableID ='eWDFS_12'  and CodeID = PS_TYPE`;
                if (personNO) {
                    sqltr = sqltr + ` AND PER_ID like N'%${personNO.toString().trim()}%'`
                }
                if (shift) {
                    sqltr = sqltr + ` AND PS_BATTH = '${shift}'`
                }


                var res = await sql.query(sqltr)
                resultTime = res.recordsets[0]

                sqlholidaystr = `SELECT FORMAT (PH_DATE, 'yyyy-MM-dd') as date FROM PER_PUBLICHOLIDAY`;

                sqlholidayApply = `SELECT PER_ID,FORMAT(HA_SDATE,'yyyy-MM-dd') as HA_SDATE,FORMAT (HA_EDATE,'yyyy-MM-dd') as HA_EDATE ,HA_DAYS,HA_STIME FROM PER_HOLIDAYAPPLY WHERE PER_ID like N'%${personNO.toString().trim()}%'`


                var hol = await sql.query(sqlholidaystr)
                var res_HA = await sql.query(sqlholidayApply)


                const holiday = hol.recordsets[0];

                const Array_HA = res_HA.recordsets[0]

                const sqlOrg = 'SELECT postID,PostName ,OrgNo, ORGName,Text1 from UCML_Post LEFT JOIN UCML_Organize ON UCML_Post.UCML_DivisionOID=UCML_Organize.UCML_OrganizeOID';
                const org = await sql.query(sqlOrg)
                const orgList = org.recordsets[0];

                sql.close();
                // FP -- config
                const dayyend = utils.tool.addDate(dayend, 2)
                const FPStr = `SELECT NHANVIEN.MaNhanVien,NgayCham,  FORMAT (GioCham, 'HH:mm:ss ') as Time FROM NHANVIEN,CheckInOut WHERE MaNhanVien LIKE '%${personNO.toString().trim()}%' AND TenNhanVien LIKE '%%'  AND CheckInOut.MaChamCong=NHANVIEN.MaChamCong
                AND NgayCham >='${daystart}' AND NgayCham<='${dayyend}'`

                // console.log(FPStr)

                new sqlMCC.ConnectionPool(sqlConfigMCC).connect().then(pool => {
                    return pool.query(FPStr)
                }).then(result => {
                    const FPList = result.recordsets[0];

                    try {
                        arrPerson.map(element => {
                            var start = new Date(daystart);
                            var end = new Date(dayend);
                            var loop = new Date(start);

                            while (loop <= end) {

                                var dt = new Date(loop)

                                MM = (dt.getMonth() + 1) < 10 ? `0${(dt.getMonth() + 1)}` : (dt.getMonth() + 1);

                                //  console.log('lenmon', mon < 10)
                                var date = dt.getFullYear() + '-' + MM + '-' + (dt.getDate());
                                var date2 = dt.getFullYear() + '-' + (dt.getMonth() + 1) + '-' + (dt.getDate());

                                //   console.log(holiday.findIndex(e => Date(e) == Date(date)))
                                const hols = checkDateInList(holiday, date);
                                const PER_HA = checkDateApplyInList(Array_HA, date, element.PER_ID);

                                var resultTimeOnePerson = resultTime.filter(e => (e.PS_DATE.getFullYear() + '-' + (e.PS_DATE.getMonth() + 1) + '-' + e.PS_DATE.getDate()) == date2 && e.PER_ID == element.PER_ID);

                                var ShiftID = '';
                                var ShiftName = '';
                                var TimeKeepStart1 = '';
                                var TimeKeepEnd1 = '';
                                var TimeKeepStart2 = '';
                                var TimeKeepEnd2 = '';
                                var TimeKeepStart3 = '';
                                var TimeKeepEnd3 = '';
                                var TimeKeepStart4 = '';
                                var TimeKeepEnd4 = '';
                                var TimeKeepStart5 = '';
                                var TimeKeepEnd5 = '';
                                var TimeKeepStart6 = '';
                                var TimeKeepEnd6 = '';
                                var TimeLate1 = '';
                                var TimeLate2 = '';

                                var TimeKeepEnd1_ = '';
                                var TimeKeepEnd2_ = '';
                                var TimeKeepEnd3_ = '';
                                var TimeKeepEnd4_ = '';
                                var TimeKeepEnd5_ = '';
                                var TimeKeepEnd6_ = '';

                                var TimeHolidayApply1 = '';
                                var TimeHolidayApply2 = '';
                                var TimeHolidayApply3 = '';


                                var timestart1 = global.timeEmpty;
                                var timestart2 = global.timeEmpty;
                                var timestart3 = global.timeEmpty;
                                var timeend1 = global.timeEmpty;
                                var timeend2 = global.timeEmpty;
                                var timeend3 = global.timeEmpty;

                                var PS_WORKHOUR1 = '';
                                var PS_OFFWORK1 = '';
                                var PS_WORKHOUR2 = '';
                                var PS_OFFWORK2 = '';
                                var PS_WORKHOUR3 = '';
                                var PS_OFFWORK3 = '';

                                var IS_CrossDay1 = null;
                                var IS_CrossDay2 = null;
                                var IS_CrossDay3 = null;

                                if (resultTimeOnePerson.length > 0) {

                                    resultTimeOnePerson = resultTimeOnePerson[0];

                                    if (resultTimeOnePerson.IS_SELECT1) {
                                        PS_WORKHOUR1 = new Date(resultTimeOnePerson.PS_WORKHOUR1.toUTCString());
                                        PS_OFFWORK1 = new Date(resultTimeOnePerson.PS_OFFWORK1.toUTCString());

                                        TimeKeepStart1 = utils.tool.subTime(PS_WORKHOUR1.getUTCHours(), PS_WORKHOUR1.getUTCMinutes(), resultTimeOnePerson.PS_MINUUES_A1);
                                        TimeKeepEnd1 = utils.tool.addTime(PS_WORKHOUR1.getUTCHours(), PS_WORKHOUR1.getUTCMinutes(), resultTimeOnePerson.PS_MINUUES_B1);

                                        TimeKeepStart2 = utils.tool.subTime(PS_OFFWORK1.getUTCHours(), PS_OFFWORK1.getUTCMinutes(), 0);
                                        TimeKeepEnd2 = utils.tool.addTime(PS_OFFWORK1.getUTCHours(), PS_OFFWORK1.getUTCMinutes(), resultTimeOnePerson.PS_MINUUES_C1);

                                        TimeKeepEnd1_ = utils.tool.addTime(PS_WORKHOUR1.getUTCHours(), PS_WORKHOUR1.getUTCMinutes(), 0);
                                        TimeKeepEnd2_ = utils.tool.addTime(PS_OFFWORK1.getUTCHours(), PS_OFFWORK1.getUTCMinutes(), 0);
                                        if (PER_HA) {
                                            TimeHolidayApply1 = utils.tool.addTime(PS_WORKHOUR1.getUTCHours(), PS_WORKHOUR1.getUTCMinutes(), 0);
                                        }

                                    }

                                    if (resultTimeOnePerson.IS_SELECT2) {
                                        PS_WORKHOUR2 = new Date(resultTimeOnePerson.PS_WORKHOUR2.toUTCString());
                                        PS_OFFWORK2 = new Date(resultTimeOnePerson.PS_OFFWORK2.toUTCString());

                                        TimeKeepStart3 = utils.tool.subTime(PS_WORKHOUR2.getUTCHours(), PS_WORKHOUR2.getUTCMinutes(), resultTimeOnePerson.PS_MINUUES_A2);
                                        TimeKeepEnd3 = utils.tool.addTime(PS_WORKHOUR2.getUTCHours(), PS_WORKHOUR2.getUTCMinutes(), resultTimeOnePerson.PS_MINUUES_B2);

                                        TimeKeepStart4 = utils.tool.subTime(PS_OFFWORK2.getUTCHours(), PS_OFFWORK2.getUTCMinutes(), 0);


                                        TimeKeepEnd3_ = utils.tool.addTime(PS_WORKHOUR2.getUTCHours(), PS_WORKHOUR2.getUTCMinutes(), 0);
                                        TimeKeepEnd4_ = utils.tool.addTime(PS_OFFWORK2.getUTCHours(), PS_OFFWORK2.getUTCMinutes(), 0);

                                        TimeKeepEnd4 = utils.tool.addTime(PS_OFFWORK2.getUTCHours(), PS_OFFWORK2.getUTCMinutes(), resultTimeOnePerson.PS_MINUUES_C2);

                                        if (PER_HA) {
                                            TimeHolidayApply2 = utils.tool.addTime(PS_OFFWORK2.getUTCHours(), PS_OFFWORK2.getUTCMinutes(), 0);
                                        }
                                        //  console.log(TimeKeepStart3, TimeKeepEnd3)
                                    }

                                    if (resultTimeOnePerson.IS_SELECT3) {
                                        PS_WORKHOUR3 = new Date(resultTimeOnePerson.PS_WORKHOUR3.toUTCString());
                                        PS_OFFWORK3 = new Date(resultTimeOnePerson.PS_OFFWORK3.toUTCString());

                                        TimeKeepStart5 = utils.tool.subTime(PS_WORKHOUR3.getUTCHours(), PS_WORKHOUR3.getUTCMinutes(), resultTimeOnePerson.PS_MINUUES_A3);
                                        TimeKeepEnd5 = utils.tool.addTime(PS_WORKHOUR3.getUTCHours(), PS_WORKHOUR3.getUTCMinutes(), resultTimeOnePerson.PS_MINUUES_B3);

                                        TimeKeepStart6 = utils.tool.subTime(PS_OFFWORK3.getUTCHours(), PS_OFFWORK3.getUTCMinutes(), 0);

                                        TimeKeepEnd5_ = utils.tool.addTime(PS_WORKHOUR3.getUTCHours(), PS_WORKHOUR3.getUTCMinutes(), 0);
                                        TimeKeepEnd6_ = utils.tool.addTime(PS_OFFWORK3.getUTCHours(), PS_OFFWORK3.getUTCMinutes(), 0);

                                        TimeKeepEnd6 = utils.tool.addTime(PS_OFFWORK3.getUTCHours(), PS_OFFWORK3.getUTCMinutes(), resultTimeOnePerson.PS_MINUUES_C3);

                                        if (PER_HA) {
                                            TimeHolidayApply3 = utils.tool.addTime(PS_OFFWORK3.getUTCHours(), PS_OFFWORK3.getUTCMinutes(), 0);
                                        }

                                    }

                                    IS_CrossDay1 = resultTimeOnePerson.IS_CrossDay1;
                                    IS_CrossDay2 = resultTimeOnePerson.IS_CrossDay2;
                                    IS_CrossDay3 = resultTimeOnePerson.IS_CrossDay3;

                                    ShiftName = resultTimeOnePerson.CodeName,
                                        ShiftID = resultTimeOnePerson.PS_BATTH,
                                        TimeLate2 = PS_WORKHOUR2.getUTCHours() + ':' + PS_WORKHOUR2.getUTCMinutes();
                                    TimeLate1 = PS_WORKHOUR1.getUTCHours() + ':' + PS_WORKHOUR1.getUTCMinutes();

                                    var dataTime = {
                                        TimeKeepStart1: TimeKeepStart1,
                                        TimeKeepStart2: TimeKeepStart2,
                                        TimeKeepStart3: TimeKeepStart3,
                                        TimeKeepStart4: TimeKeepStart4,
                                        TimeKeepStart5: TimeKeepStart5,
                                        TimeKeepStart6: TimeKeepStart6,
                                        TimeKeepEnd1: TimeKeepEnd1,
                                        TimeKeepEnd2: TimeKeepEnd2,
                                        TimeKeepEnd3: TimeKeepEnd3,
                                        TimeKeepEnd4: TimeKeepEnd4,
                                        TimeKeepEnd5: TimeKeepEnd5,
                                        TimeKeepEnd6: TimeKeepEnd6,
                                        IS_CrossDay1: IS_CrossDay1,
                                        IS_CrossDay2: IS_CrossDay2,
                                        IS_CrossDay3: IS_CrossDay3,
                                    }

                                    let PersonData = arrayDataAttenedance.filter(e => e.PersonNO.trim() == element.PER_ID.trim());

                                    timestart1 = utils.tool.getTime(PersonData, FPList, element.PER_ID, loop, 1, dataTime, '');
                                    timeend1 = utils.tool.getTime(PersonData, FPList, element.PER_ID, loop, 2, dataTime, '');

                                    timestart2 = utils.tool.getTime(PersonData, FPList, element.PER_ID, loop, 3, dataTime, '');
                                    timeend2 = utils.tool.getTime(PersonData, FPList, element.PER_ID, loop, 4, dataTime, '');

                                    if (timeend1 == timestart2) {
                                        timestart2 = "";
                                    }

                                    timestart3 = utils.tool.getTime(PersonData, FPList, element.PER_ID, loop, 5, dataTime, timeend2);
                                    timeend3 = utils.tool.getTime(PersonData, FPList, element.PER_ID, loop, 6, dataTime, '');

                                    if (utils.tool.CheckNoonTime(timeend1, timestart2)) {
                                        var temptime = timeend1;
                                        timeend1 = timestart2;
                                        timestart2 = temptime;
                                    }

                                    if (utils.tool.convertTimeToMinutes(timeend1) == utils.tool.convertTimeToMinutes(timestart2)) {
                                        timeend1 = ''
                                    }

                                }
                                //  console.log(element.orgName,all)
                                if (!all) {
                                    if (timestart1 != timeEmpty || timestart2 != timeEmpty || timestart3 != timeEmpty || timeend1 != timeEmpty || timeend2 != timeEmpty || timeend3 != timeEmpty) {
                                        const organ = findDepartment(orgList, element.PostID);
                                        arrResult.push({
                                            Date: utils.tool.formatDate(loop.toUTCString()),
                                            PersonNO: element.PER_ID,
                                            PersonName: element.PER_NAME,
                                            PostID: element.PostID,
                                            ShiftID: ShiftID,
                                            shiftName: ShiftName,
                                            Time1: utils.tool.FormatTime(((PER_HA) ? TimeHolidayApply1 : timestart1)),
                                            Time2: utils.tool.FormatTime((PER_HA) ? '' : timeend1),
                                            Time3: utils.tool.FormatTime((PER_HA) ? '' : timestart2),
                                            Time4: utils.tool.FormatTime((resultTimeOnePerson.IS_SELECT3) ? ((PER_HA) ? TimeHolidayApply3 : timeend3) : ((PER_HA) ? TimeHolidayApply2 : timeend2)),
                                            Type: type,
                                            Status: (PER_HA) ? 0 : (hols) ? 0 : (timestart1 == timeEmpty || ((resultTimeOnePerson.IS_SELECT3) ? timeend3 : timeend2) == timeEmpty) ? 1 : 0,
                                            late1: (resultTimeOnePerson.length == 0) ? false : utils.tool.checklate(timestart1, TimeLate1),
                                            late2: (resultTimeOnePerson.length == 0) ? false : utils.tool.checklate(timestart2, TimeLate2),
                                            IS_CrossDay1: IS_CrossDay1,
                                            IS_CrossDay2: IS_CrossDay2,
                                            IS_CrossDay3: IS_CrossDay3,

                                            TimeKeepStart1: TimeKeepStart1,
                                            TimeKeepStart2: TimeKeepStart2,
                                            TimeKeepStart3: TimeKeepStart3,
                                            TimeKeepStart4: TimeKeepStart4,
                                            TimeKeepStart5: TimeKeepStart5,
                                            TimeKeepStart6: TimeKeepStart6,

                                            TimeKeepEnd1: TimeKeepEnd1_,
                                            TimeKeepEnd2: TimeKeepEnd2,
                                            TimeKeepEnd3: TimeKeepEnd3_,
                                            TimeKeepEnd4: TimeKeepEnd4,
                                            TimeKeepEnd5: TimeKeepEnd5_,
                                            TimeKeepEnd6: TimeKeepEnd6,
                                            Holiday: hols,
                                            HolidayApply: PER_HA,
                                            Department: element.OrgName,

                                        })
                                    }
                                } else {
                                    const organ = findDepartment(orgList, element.PostID);
                                    arrResult.push({

                                        Date: utils.tool.formatDate(loop.toUTCString()),
                                        PersonNO: element.PER_ID,
                                        PersonName: element.PER_NAME,
                                        PostName: element.PostName,
                                        PostID: element.PostID,
                                        ShiftID: ShiftID,
                                        shiftName: ShiftName,
                                        Time1: utils.tool.FormatTime(((PER_HA) ? TimeHolidayApply1 : timestart1)),
                                        Time2: utils.tool.FormatTime((PER_HA) ? '' : timeend1),
                                        Time3: utils.tool.FormatTime((PER_HA) ? '' : timestart2),
                                        Time4: utils.tool.FormatTime((resultTimeOnePerson.IS_SELECT3) ? ((PER_HA) ? TimeHolidayApply3 : timeend3) : ((PER_HA) ? TimeHolidayApply2 : timeend2)),
                                        Type: type,
                                        Status: (PER_HA) ? 0 : (hols) ? 0 : (timestart1 == timeEmpty || ((resultTimeOnePerson.IS_SELECT3) ? timeend3 : timeend2) == timeEmpty) ? 1 : 0,
                                        late1: (resultTimeOnePerson.length == 0) ? false : utils.tool.checklate(timestart1, TimeLate1),
                                        late2: (resultTimeOnePerson.length == 0) ? false : utils.tool.checklate(timestart2, TimeLate2),

                                        IS_CrossDay1: IS_CrossDay1,
                                        IS_CrossDay2: IS_CrossDay2,
                                        IS_CrossDay3: IS_CrossDay3,

                                        TimeKeepStart1: TimeKeepStart1,
                                        TimeKeepStart2: TimeKeepStart2,
                                        TimeKeepStart3: TimeKeepStart3,
                                        TimeKeepStart4: TimeKeepStart4,
                                        TimeKeepStart5: TimeKeepStart5,
                                        TimeKeepStart6: TimeKeepStart6,

                                        TimeKeepEnd1: TimeKeepEnd1_,
                                        TimeKeepEnd2: TimeKeepEnd2,
                                        TimeKeepEnd3: TimeKeepEnd3_,
                                        TimeKeepEnd4: TimeKeepEnd4,
                                        TimeKeepEnd5: TimeKeepEnd5_,
                                        TimeKeepEnd6: TimeKeepEnd6,

                                        Holiday: hols,
                                        HolidayApply: PER_HA,
                                        Department: element.OrgName,
                                    })
                                }

                                var newDate = loop.setDate(loop.getDate() + 1);
                                loop = new Date(newDate);
                            }
                        });
                        sql.close();

                        if (status != '') {
                            if (status < 2) {
                                ress.send(JSON.stringify({
                                    status: 200,
                                    error: null,
                                    response: arrResult.filter(e => (e.Status == status) && ((shift != '') ? e.ShiftID == shift : true))
                                }));
                            } else {

                                ress.send(JSON.stringify({
                                    status: 200,
                                    error: null,
                                    response: arrResult.filter(e => (e.late1 == true || e.late2 == true) && ((shift != '') ? e.ShiftID == shift : true))
                                }));
                            }
                        } else {
                            ress.send(JSON.stringify({
                                status: 200,
                                error: null,
                                response: arrResult.filter(e => (shift != '') ? e.ShiftID == shift : true)
                            }));
                        }

                    } catch (err) {
                        console.log(err)
                        return ress.status(500).json({success: false, message: 'Internal server error', error: '101'})
                    }

                }).catch(err => {
                    return ress.status(500).json({success: false, message: err, error: '101'})
                })

            })

        } else {
            return ress.status(500).json({success: false, message: 'Internal server error', error: '102'})
        }
    } catch (error) {

        return ress.status(500).json({success: false, message: 'Internal server error', error: '103'});
    }

}

function findDepartment(orgList, id) {

    if (!id) return '';
    var result = {
        department: '',
        organize: ''
    }
    const inPos = orgList.findIndex(e => e.postID == id);

    result.department = (inPos == -1) ? '' : orgList[inPos].ORGName;
    var listOr = [];
    if (inPos != -1) {
        try {
            listOr = orgList[inPos].Text1.split('-');
            result.organize = listOr[1];
        } catch (error) {
            console.log(listOr, error);
        }
    }
    return result;
}

function checkDateInList(list, date) {
    if (list.length == 0) return false;
    for (let i = 0; i < list.length; i++) {
        var d1 = new Date(list[i].date);
        var d2 = new Date(date);
        if (d1.getTime() == d2.getTime()) {
            return true
        }
    }
    return false;
}

function checkDateApplyInList(list, date, per_id) {

    if (list.length == 0) return false;
    const arr = list.filter((e) => e.PER_ID == per_id);
    if (arr.length == 0) return false;

    for (let i = 0; i < arr.length; i++) {
        if (arr[i].HA_DAYS >= 1) {
            var d1 = new Date(arr[i].HA_SDATE);
            var d2 = new Date(date);
            if (d1.getTime() == d2.getTime()) {
                return true
            }
        }
    }

    return false;
}

router.get('/getorganize', async (req, res) => {

    try {
        await sql.connect(sqlConfig)
        var respon = await sql.query`SELECT UCML_OrganizeOID, OrgName FROM UCML_Organize WHERE ParentOID = '000204C6-0000-0000-0000-0000FFEB38B0' AND OrgName <> '空'`
        respon.recordsets[0];
        sql.close();
        res.send(JSON.stringify({status: 200, error: null, response: respon.recordsets[0]}));
    } catch (error) {
        return ress.status(500).json({success: false, message: 'Internal server error', error: '101'})
    }
})

router.get('/department', async (req, res) => {

    try {
        const {orgID} = req.query
        await sql.connect(sqlConfig)
        let str = "WITH recursive_menu AS (\n" +
            "  SELECT UCML_OrganizeOID, OrgName\n" +
            "  FROM UCML_Organize\n" +
            "  WHERE ParentOID = '" + orgID + "'\n" +
            "  UNION ALL\n" +
            "  SELECT m.UCML_OrganizeOID, m.OrgName\n" +
            "  FROM UCML_Organize m\n" +
            "  JOIN recursive_menu rm ON rm.UCML_OrganizeOID = m.ParentOID\n" +
            ")\n" +
            "SELECT * FROM recursive_menu WHERE ORGName <>'空'"
        var respon = await sql.query(str)

        respon.recordsets[0];
        sql.close();
        res.send(JSON.stringify({status: 200, error: null, response: respon.recordsets[0]}));
    } catch (error) {
        return ress.status(500).json({success: false, message: 'Internal server error', error: '101'})
    }
})

router.post('/query', async (req, res) => {
    processData(req, res, false)
})

router.get('/personShift', async (req, res) => {

    try {
        await sql.connect(sqlConfig)
        var respon = await sql.query`SELECT * FROM dbo.CodeValue WHERE CodeTableID='eWDFS_12'`
        respon.recordsets[0];
        sql.close();
        res.send(JSON.stringify({status: 200, error: null, response: respon.recordsets[0]}));

    } catch (err) {

        return res.status(500).json({success: false, message: 'Internal server error', error: '101'})
    }
})

router.get('/devices', async (req, res) => {

    try {
        db.query(global.sp_devicesinfo, (err, results) => {
            res.status(200).send(JSON.stringify({status: 200, error: null, success: true, response: results[0]}))
        })

    } catch (err) {

        return ress.status(500).json({success: false, message: 'Internal server error', error: '101'})
    }
})

router.post('/detail', (req, res) => {

    try {
        // res.json({ success: true, message: global.sp_query });

        const {date, PersonNO, valDate} = req.body;
        if (!date)
            return res
                .status(400)
                .json({success: false, message: 'Date is required'})

        if (!PersonNO)
            return res
                .status(400)
                .json({success: false, message: 'PersonNO is required'})

        if (Date.parse(PersonNO) != isNaN) {
            try {
                var dateand = utils.tool.addDate(date, valDate);
                db.query(global.sp_datadetail, [PersonNO, date, dateand], (err, result) => {
                    if (err) throw err;
                    console.log(result[0]);
                    res.send(JSON.stringify({status: 200, error: null, response: result[0]}));
                });
            } catch (error) {
                res.status(500).json({success: false, message: 'Internal server error', error: 103})
            }
        } else {
            return res.status(401).json({
                success: false,
                message: 'Plase check paramters'
            })
        }
    } catch (error) {

        res.status(500).json({success: false, message: 'Internal server error'})
    }
})

router.post('/detailFP', (req, res) => {

    try {
        // res.json({ success: true, message: global.sp_query });

        const {date, PersonNO, valDate} = req.body;
        //  console.log(req.body)


        const startDate = date;
        const endDate = utils.tool.addDate(date, valDate);
        try {
            const FPStr = `SELECT NHANVIEN.MaNhanVien,NgayCham,FORMAT (NgayCham, 'yyy-MM-dd') AS Date,  FORMAT (GioCham, 'HH:mm:ss') as Time,TenMay FROM NHANVIEN,CheckInOut WHERE MaNhanVien = '${PersonNO}' AND CheckInOut.MaChamCong=NHANVIEN.MaChamCong AND NgayCham >='${startDate}' AND NgayCham<='${endDate}'`
            //  console.log(FPStr)
            new sqlMCC.ConnectionPool(sqlConfigMCC).connect().then(pool => {
                return pool.query(FPStr)


            }).then(result => {
                const FPList = result.recordsets[0];
                console.log(FPList)
                return res.status(200).json({success: true, message: '', response: FPList})
            }).catch(error => {
                console.log(error)
                return res.status(500).json({success: false, message: error, error: '101'})
            })

        } catch (error) {
            console.log(error)
            res.status(500).json({success: false, message: 'Internal server error', error: 103})
        }

    } catch (error) {
        console.log(error)
        res.status(500).json({success: false, message: 'Internal server error'})
    }
})

router.get('/report', (req, res) => {
    var arr = [];
    global.report.map((e, i) => {
        arr.push({
            No: i + 1,
            Date: e.Date,
            PersonNO: e.PersonNO,
            PersonName: e.PersonName,
            ShiftID: e.ShiftID,
            shiftName: e.shiftName,
            Time1: e.Time1,
            Time2: e.Time2,
            Time3: e.Time3,
            Time4: e.Time4,
            Type: e.Type,
            Status: e.Status
        })
    })
    res.status(200).json({data: arr})
})

router.post('/viewjimu', async (req, res) => {
    processDataToExport(req, res, req.body.all, true);

})

function processDataToExport(req, res, all, jimu) {

    var ress = res;
    var arrayDataAttenedance = [];
    var arrResult = [];
    var arrPerson = [];

    try {
        let {
            daystart,
            dayend,
            personNO,
            personName,
            status,
            type,
            shift,
            country,
            organize
        } = req.body;

        if (!daystart || !dayend) return res.status(400).json({success: false, message: 'Date is required'})

        if (!type) return res.status(400).json({success: false, message: 'Type is required'})

        if (Date.parse(daystart) != isNaN && Date.parse(dayend) != isNaN) {

            var m_date_end = utils.tool.addDate(dayend, 3);

            personNO = (personNO == "" && country == 1) ? "ST" : personNO;

            db.query(global.sp_query, [daystart, m_date_end, `%${personNO.toString().trim()}%`, type], async (err, results) => {
                if (err) throw err;
                arrayDataAttenedance = results[0];
                await sql.connect(sqlConfig)
                var strPer = "WITH recursive_menu AS (\n" +
                    "  SELECT UCML_OrganizeOID, OrgName\n" +
                    "  FROM UCML_Organize\n" +
                    "  WHERE ParentOID = '" + organize + "' OR UCML_OrganizeOID ='" + organize + "'\n" +
                    "  UNION ALL\n" +
                    "  SELECT m.UCML_OrganizeOID, m.OrgName\n" +
                    "  FROM UCML_Organize m\n" +
                    "  JOIN recursive_menu rm ON rm.UCML_OrganizeOID = m.ParentOID\n" +
                    ")\n" +
                    "SELECT DISTINCT a.PER_ID,a.PER_NAME,a.OrgName  FROM PER_PERSON a \n" +
                    "INNER JOIN recursive_menu b ON a.UCML_Organize_FK = b.UCML_OrganizeOID\n" +
                    "WHERE a.POLITICS =" + country + " AND a.PER_STATUS<>3  AND a.PER_ID like '%" + personNO + "%' AND a.PER_NAME like '%" + personName + "%'";

                var res = await sql.query(strPer);

                arrPerson = res.recordsets[0];

                var sqltr = 'SELECT PER_SHIFT.PS_INC,PS_BATTH,PS_TYPE,PS_CLASS,PS_SEQ1,PS_SEQ2,PS_SEQ3,IS_SELECT1 ,IS_SELECT2,IS_SELECT3 ,PS_WORKHOUR1,PS_WORKHOUR2,PS_WORKHOUR3, PS_OFFWORK1,PS_OFFWORK2,PS_OFFWORK3,PS_MINUUES_A1,PS_MINUUES_A2,PS_MINUUES_A3,PS_MINUUES_B1,PS_MINUUES_B2,PS_MINUUES_B3,PS_MINUUES_C1,PS_MINUUES_C2,PS_MINUUES_C3,PER_ID,IS_CrossDay1,IS_CrossDay2,IS_CrossDay3 , CodeName,  PS_DATE ,PER_SCHEDUE.SYS_Created' +
                    ` FROM PER_SHIFT,PER_SCHEDUE,CodeValue WHERE  PER_SHIFT.PS_INC = PER_SCHEDUE.PS_INC AND PS_DATE <= '${dayend}' and  PS_DATE > ='${daystart}' and CodeTableID ='eWDFS_12'  and CodeID = PS_TYPE`;
                if (personNO) {
                    sqltr = sqltr + ` AND PER_ID like N'%${personNO.toString().trim()}%'`
                }
                if (shift) {
                    sqltr = sqltr + ` AND PS_BATTH = '${shift}'`
                }

                sqltr = sqltr + ` ORDER BY PS_DATE,PER_SCHEDUE.SYS_Created DESC`
                console.log(sqltr)
                var res = await sql.query(sqltr)
                resultTime = res.recordsets[0]


                sqlholidaystr = `SELECT FORMAT (PH_DATE, 'yyyy-MM-dd') as date FROM PER_PUBLICHOLIDAY`;

                sqlholidayApply = `SELECT PER_ID,FORMAT(HA_SDATE,'yyyy-MM-dd') as HA_SDATE,FORMAT (HA_EDATE,'yyyy-MM-dd') as HA_EDATE ,HA_DAYS,HA_STIME FROM PER_HOLIDAYAPPLY WHERE PER_ID like N'%${personNO.toString().trim()}%'`


                var hol = await sql.query(sqlholidaystr)
                var res_HA = await sql.query(sqlholidayApply)

                const holiday = hol.recordsets[0];

                const Array_HA = res_HA.recordsets[0]

                const sqlOrg = 'SELECT postID,PostName ,OrgNo, ORGName,Text1 from UCML_Post LEFT JOIN UCML_Organize ON UCML_Post.UCML_DivisionOID=UCML_Organize.UCML_OrganizeOID';
                const org = await sql.query(sqlOrg)
                const orgList = org.recordsets[0];

                sql.close();
                // FP -- config
                const dayyend = utils.tool.addDate(dayend, 2)
                // const FPStr = `SELECT NHANVIEN.MaNhanVien,NgayCham,  FORMAT (GioCham, 'HH:mm:ss ') as Time FROM NHANVIEN,CheckInOut WHERE MaNhanVien LIKE '%${personNO.toString().trim()}%' AND TenNhanVien LIKE '%%'  AND CheckInOut.MaChamCong=NHANVIEN.MaChamCong
                // AND NgayCham >='${daystart}' AND NgayCham<='${dayyend}'`

                try {
                    arrPerson.map(element => {
                        var start = new Date(daystart);
                        var end = new Date(dayend);
                        var loop = new Date(start);

                        while (loop <= end) {
                            var dt = new Date(loop)
                            MM = (dt.getMonth() + 1) < 10 ? `0${(dt.getMonth() + 1)}` : (dt.getMonth() + 1);
                            //  console.log('lenmon', mon < 10)
                            var date = dt.getFullYear() + '-' + MM + '-' + (dt.getDate());
                            var date2 = dt.getFullYear() + '-' + (dt.getMonth() + 1) + '-' + (dt.getDate());
                            //   console.log(holiday.findIndex(e => Date(e) == Date(date)))
                            const hols = checkDateInList(holiday, date);
                            const PER_HA = checkDateApplyInList(Array_HA, date, element.PER_ID);

                            var resultTimeOnePerson = resultTime.filter(e => (e.PS_DATE.getFullYear() + '-' + (e.PS_DATE.getMonth() + 1) + '-' + e.PS_DATE.getDate()) == date2 && e.PER_ID == element.PER_ID);

                            if (resultTimeOnePerson.length > 0) {
                                resultTimeOnePerson.sort((a, b) => {
                                    return a.SYS_Created > b.SYS_Created ? -1 : 1
                                })
                            }
                            var ShiftID = '';
                            var ShiftName = '';
                            var TimeKeepStart1 = '';
                            var TimeKeepEnd1 = '';
                            var TimeKeepStart2 = '';
                            var TimeKeepEnd2 = '';
                            var TimeKeepStart3 = '';
                            var TimeKeepEnd3 = '';
                            var TimeKeepStart4 = '';
                            var TimeKeepEnd4 = '';
                            var TimeKeepStart5 = '';
                            var TimeKeepEnd5 = '';
                            var TimeKeepStart6 = '';
                            var TimeKeepEnd6 = '';
                            var TimeLate1 = '';
                            var TimeLate2 = '';

                            var TimeKeepEnd1_ = '';
                            var TimeKeepEnd2_ = '';
                            var TimeKeepEnd3_ = '';
                            var TimeKeepEnd4_ = '';
                            var TimeKeepEnd5_ = '';
                            var TimeKeepEnd6_ = '';

                            var TimeHolidayApply1 = '';
                            var TimeHolidayApply2 = '';
                            var TimeHolidayApply3 = '';

                            var timestart1 = global.timeEmpty;
                            var timestart2 = global.timeEmpty;
                            var timestart3 = global.timeEmpty;
                            var timeend1 = global.timeEmpty;
                            var timeend2 = global.timeEmpty;
                            var timeend3 = global.timeEmpty;

                            var PS_WORKHOUR1 = '';
                            var PS_OFFWORK1 = '';
                            var PS_WORKHOUR2 = '';
                            var PS_OFFWORK2 = '';
                            var PS_WORKHOUR3 = '';
                            var PS_OFFWORK3 = '';

                            var IS_CrossDay1 = null;
                            var IS_CrossDay2 = null;
                            var IS_CrossDay3 = null;
                            if (resultTimeOnePerson.length > 0) {

                                resultTimeOnePerson = resultTimeOnePerson[0];

                                if (resultTimeOnePerson.IS_SELECT1) {
                                    PS_WORKHOUR1 = new Date(resultTimeOnePerson.PS_WORKHOUR1.toUTCString());
                                    PS_OFFWORK1 = new Date(resultTimeOnePerson.PS_OFFWORK1.toUTCString());

                                    TimeKeepStart1 = utils.tool.subTime(PS_WORKHOUR1.getUTCHours(), PS_WORKHOUR1.getUTCMinutes(), resultTimeOnePerson.PS_MINUUES_A1);
                                    TimeKeepEnd1 = utils.tool.addTime(PS_WORKHOUR1.getUTCHours(), PS_WORKHOUR1.getUTCMinutes(), resultTimeOnePerson.PS_MINUUES_B1);

                                    TimeKeepStart2 = utils.tool.subTime(PS_OFFWORK1.getUTCHours(), PS_OFFWORK1.getUTCMinutes(), 0);
                                    TimeKeepEnd2 = utils.tool.addTime(PS_OFFWORK1.getUTCHours(), PS_OFFWORK1.getUTCMinutes(), resultTimeOnePerson.PS_MINUUES_C1);

                                    TimeKeepEnd1_ = utils.tool.addTime(PS_WORKHOUR1.getUTCHours(), PS_WORKHOUR1.getUTCMinutes(), 0);
                                    TimeKeepEnd2_ = utils.tool.addTime(PS_OFFWORK1.getUTCHours(), PS_OFFWORK1.getUTCMinutes(), 0);
                                    if (PER_HA) {
                                        TimeHolidayApply1 = utils.tool.addTime(PS_WORKHOUR1.getUTCHours(), PS_WORKHOUR1.getUTCMinutes(), 0);
                                    }

                                }

                                if (resultTimeOnePerson.IS_SELECT2) {
                                    PS_WORKHOUR2 = new Date(resultTimeOnePerson.PS_WORKHOUR2.toUTCString());
                                    PS_OFFWORK2 = new Date(resultTimeOnePerson.PS_OFFWORK2.toUTCString());

                                    TimeKeepStart3 = utils.tool.subTime(PS_WORKHOUR2.getUTCHours(), PS_WORKHOUR2.getUTCMinutes(), resultTimeOnePerson.PS_MINUUES_A2);
                                    TimeKeepEnd3 = utils.tool.addTime(PS_WORKHOUR2.getUTCHours(), PS_WORKHOUR2.getUTCMinutes(), resultTimeOnePerson.PS_MINUUES_B2);

                                    TimeKeepStart4 = utils.tool.subTime(PS_OFFWORK2.getUTCHours(), PS_OFFWORK2.getUTCMinutes(), 0);


                                    TimeKeepEnd3_ = utils.tool.addTime(PS_WORKHOUR2.getUTCHours(), PS_WORKHOUR2.getUTCMinutes(), 0);
                                    TimeKeepEnd4_ = utils.tool.addTime(PS_OFFWORK2.getUTCHours(), PS_OFFWORK2.getUTCMinutes(), 0);

                                    TimeKeepEnd4 = utils.tool.addTime(PS_OFFWORK2.getUTCHours(), PS_OFFWORK2.getUTCMinutes(), resultTimeOnePerson.PS_MINUUES_C2);

                                    if (PER_HA) {
                                        TimeHolidayApply2 = utils.tool.addTime(PS_OFFWORK2.getUTCHours(), PS_OFFWORK2.getUTCMinutes(), 0);
                                    }
                                    //   console.log(TimeKeepStart3, TimeKeepEnd3)
                                }

                                if (resultTimeOnePerson.IS_SELECT3) {
                                    PS_WORKHOUR3 = new Date(resultTimeOnePerson.PS_WORKHOUR3.toUTCString());
                                    PS_OFFWORK3 = new Date(resultTimeOnePerson.PS_OFFWORK3.toUTCString());

                                    TimeKeepStart5 = utils.tool.subTime(PS_WORKHOUR3.getUTCHours(), PS_WORKHOUR3.getUTCMinutes(), resultTimeOnePerson.PS_MINUUES_A3);
                                    TimeKeepEnd5 = utils.tool.addTime(PS_WORKHOUR3.getUTCHours(), PS_WORKHOUR3.getUTCMinutes(), resultTimeOnePerson.PS_MINUUES_B3);

                                    TimeKeepStart6 = utils.tool.subTime(PS_OFFWORK3.getUTCHours(), PS_OFFWORK3.getUTCMinutes(), 0);

                                    TimeKeepEnd5_ = utils.tool.addTime(PS_WORKHOUR3.getUTCHours(), PS_WORKHOUR3.getUTCMinutes(), 0);
                                    TimeKeepEnd6_ = utils.tool.addTime(PS_OFFWORK3.getUTCHours(), PS_OFFWORK3.getUTCMinutes(), 0);

                                    TimeKeepEnd6 = utils.tool.addTime(PS_OFFWORK3.getUTCHours(), PS_OFFWORK3.getUTCMinutes(), resultTimeOnePerson.PS_MINUUES_C3);

                                    if (PER_HA) {
                                        TimeHolidayApply3 = utils.tool.addTime(PS_OFFWORK3.getUTCHours(), PS_OFFWORK3.getUTCMinutes(), 0);
                                    }

                                }

                                IS_CrossDay1 = resultTimeOnePerson.IS_CrossDay1;
                                IS_CrossDay2 = resultTimeOnePerson.IS_CrossDay2;
                                IS_CrossDay3 = resultTimeOnePerson.IS_CrossDay3;

                                ShiftName = resultTimeOnePerson.CodeName,
                                    ShiftID = resultTimeOnePerson.PS_BATTH,
                                    TimeLate2 = PS_WORKHOUR2.getUTCHours() + ':' + PS_WORKHOUR2.getUTCMinutes();
                                TimeLate1 = PS_WORKHOUR1.getUTCHours() + ':' + PS_WORKHOUR1.getUTCMinutes();

                                var dataTime = {
                                    TimeKeepStart1: TimeKeepStart1,
                                    TimeKeepStart2: TimeKeepStart2,
                                    TimeKeepStart3: TimeKeepStart3,
                                    TimeKeepStart4: TimeKeepStart4,
                                    TimeKeepStart5: TimeKeepStart5,
                                    TimeKeepStart6: TimeKeepStart6,
                                    TimeKeepEnd1: TimeKeepEnd1,
                                    TimeKeepEnd2: TimeKeepEnd2,
                                    TimeKeepEnd3: TimeKeepEnd3,
                                    TimeKeepEnd4: TimeKeepEnd4,
                                    TimeKeepEnd5: TimeKeepEnd5,
                                    TimeKeepEnd6: TimeKeepEnd6,
                                    IS_CrossDay1: IS_CrossDay1,
                                    IS_CrossDay2: IS_CrossDay2,
                                    IS_CrossDay3: IS_CrossDay3,
                                }

                                let PersonData = arrayDataAttenedance.filter(e => e.PersonNO.trim() == element.PER_ID.trim());


                                timestart1 = utils.tool.getTime(PersonData, [], element.PER_ID, loop, 1, dataTime, '');

                                timeend1 = utils.tool.getTime(PersonData, [], element.PER_ID, loop, 2, dataTime, '');
                                timestart2 = utils.tool.getTime(PersonData, [], element.PER_ID, loop, 3, dataTime, '');

                                timeend2 = utils.tool.getTime(PersonData, [], element.PER_ID, loop, 4, dataTime, '');
                                timestart3 = utils.tool.getTime(PersonData, [], element.PER_ID, loop, 5, dataTime, '');

                                timeend3 = utils.tool.getTime(PersonData, [], element.PER_ID, loop, 6, dataTime, '');

                                if (timeend1 == timestart2) {
                                    timestart2 = "";
                                }
                                if (timeend2 == timestart3) {
                                    timestart3 = "";
                                }

                                if (utils.tool.CheckNoonTime(timeend1, timestart2)) {
                                    var temptime = timeend1;
                                    timeend1 = timestart2;
                                    timestart2 = temptime;
                                }

                                if (utils.tool.convertTimeToMinutes(timeend1) == utils.tool.convertTimeToMinutes(timestart2)) {
                                    timeend1 = ''
                                }
                                // if (element.PER_ID="ST0035"){
                                //     console.log(utils.tool.formatDate(loop.toUTCString()),timestart1,timeend1,timestart2,timeend2)
                                // }

                            }
                            const organ = findDepartment(orgList, element.PostID);
                            const check1 = (resultTimeOnePerson.IS_SELECT3 != true) ? true : (timeend1 == timeEmpty || timestart2 == timeEmpty) ? true : Math.abs(utils.tool.convertTimeToMinutes(timeend1) - utils.tool.convertTimeToMinutes(timestart2)) <= 30
                            const check2 = (resultTimeOnePerson.IS_SELECT3 != true) ? true : (timeend2 == timeEmpty || timestart3 == timeEmpty) ? true : (Math.abs(utils.tool.convertTimeToMinutes(timeend2) - utils.tool.convertTimeToMinutes(timestart3)) <= 30)
                            const check3 = timestart1 != "" && timeend1 != "" && timestart2 != "" && timeend2 != "";
                            const check4 = (resultTimeOnePerson.IS_SELECT3 != true) ? true : (timestart3 != "" && timeend3 != "");
                            let value1 = ShiftID == 'B' ? 690 : 1380;
                            let value2 = ShiftID == 'B' ? 1020 : 300;
                            let check5 = (resultTimeOnePerson.IS_SELECT3 != true) ? true : (!check1) ? true : (utils.tool.convertTimeToMinutes(timeend1) < value1) && (utils.tool.convertTimeToMinutes(timestart2) > value1) ? false : true
                            let check6 = (resultTimeOnePerson.IS_SELECT3 != true) ? true : (!check2) ? true : (utils.tool.convertTimeToMinutes(timeend2) < value2) && (utils.tool.convertTimeToMinutes(timestart3) > value2) ? false : true
                            let note = "";
                            if (!check1 || !check2) {
                                note = note + "吃饭时过了30分钟";
                            }
                            if (!check3 || !check4) {
                                note = (note === "") ? note + ",缺勤" : note + "缺勤"
                            }
                            if (!check5 || !check6) {
                                note = (note === "") ? note + ",提前考勤" : note + "提前考勤"
                            }
                            //  console.log(check1, check2, check3, check4, check5, check6)
                            //  console.log(note)
                            arrResult.push({
                                Date: utils.tool.formatDate(loop.toUTCString()),
                                PersonNO: element.PER_ID,
                                PersonName: element.PER_NAME,
                                Organize: organ.organize,
                                Department: element.OrgName,
                                PostName: element.PostName,
                                PostID: element.PostID,
                                ShiftID: ShiftID,
                                shiftName: ShiftName,
                                Time1: utils.tool.FormatTime(((PER_HA) ? TimeHolidayApply1 : timestart1)),
                                Time2: utils.tool.FormatTime((PER_HA) ? '' : timeend1),
                                Time3: utils.tool.FormatTime((PER_HA) ? '' : timestart2),
                                Time4: utils.tool.FormatTime((PER_HA) ? '' : timeend2),
                                Time5: utils.tool.FormatTime((PER_HA) ? '' : timestart3),
                                Time6: utils.tool.FormatTime((PER_HA) ? '' : timeend3),
                                Type: type,
                                Note: note,
                                Status: (PER_HA) ? 0 : (hols) ? 0 : (check1 && check2 && check3 && check4 && check5 && check6) ? 0 : 1,
                                late1: (resultTimeOnePerson.length == 0) ? false : utils.tool.checklate(timestart1, TimeLate1),
                                late2: (resultTimeOnePerson.length == 0) ? false : utils.tool.checklate(timestart2, TimeLate2),

                                IS_CrossDay1: IS_CrossDay1,
                                IS_CrossDay2: IS_CrossDay2,
                                IS_CrossDay3: IS_CrossDay3,

                                TimeKeepStart1: TimeKeepStart1,
                                TimeKeepStart2: TimeKeepStart2,
                                TimeKeepStart3: TimeKeepStart3,
                                TimeKeepStart4: TimeKeepStart4,
                                TimeKeepStart5: TimeKeepStart5,
                                TimeKeepStart6: TimeKeepStart6,

                                TimeKeepEnd1: TimeKeepEnd1_,
                                TimeKeepEnd2: TimeKeepEnd2,
                                TimeKeepEnd3: TimeKeepEnd3_,
                                TimeKeepEnd4: TimeKeepEnd4,
                                TimeKeepEnd5: TimeKeepEnd5_,
                                TimeKeepEnd6: TimeKeepEnd6,

                                Holiday: hols,
                                HolidayApply: PER_HA
                            })


                            var newDate = loop.setDate(loop.getDate() + 1);
                            loop = new Date(newDate);
                        }
                    });
                    sql.close();

                    if (status != '') {
                        if (status < 2) {
                            return convertDataToArray(arrResult.filter(e => (e.Status == status) && ((shift != '') ? e.ShiftID == shift : true)), ress, []);
                        } else {
                            return convertDataToArray(arrResult.filter(e => (e.late1 == true || e.late2 == true) && ((shift != '') ? e.ShiftID == shift : true)), ress, []);
                        }
                    } else {
                        return convertDataToArray(arrResult.filter(e => (shift != '') ? e.ShiftID == shift : true), ress, []);
                    }

                } catch (err) {
                    console.log(err)
                    return ress.status(500).json({success: false, message: 'Internal server error', error: '101'})
                }

            })

        } else {
            return ress.status(500).json({success: false, message: 'Internal server error', error: '102'})
        }
    } catch (error) {

        return ress.status(500).json({success: false, message: 'Internal server error', error: '103'});
    }

    //
    // var ress = res;
    // var arrayDataAttenedance = [];
    // var arrResult = [];
    // var arrPerson = [];
    //
    // try {
    //     const {
    //         daystart,
    //         dayend,
    //         personNO,
    //         personName,
    //         status,
    //         type,
    //         shift,
    //         post,
    //         arrayPost,
    //         country,
    //         organize,
    //         listOrganize
    //     } = req.body;
    //
    //
    //     if (!daystart || !dayend) return res.status(400).json({success: false, message: 'Date is required'})
    //
    //     if (!type) return res.status(400).json({success: false, message: 'Type is required'})
    //
    //     if (Date.parse(daystart) != isNaN && Date.parse(dayend) != isNaN) {
    //
    //         var m_date_end = utils.tool.addDate(dayend, 3);
    //
    //         db.query(global.sp_query, [daystart, m_date_end, `%${personNO.toString().trim()}%`, type], async (err, results) => {
    //             if (err) throw err;
    //             arrayDataAttenedance = results[0];
    //
    //             await sql.connect(sqlConfig)
    //             var strlistpost = '';
    //             var strpost = ''
    //
    //             if (organize != '') {
    //                 if (arrayPost.length < 3 && arrayPost.length > 1) {
    //                     strlistpost = `AND A.PostID = ${arrayPost[1].PostID}`
    //                 }
    //
    //                 if ((arrayPost.length) > 2) {
    //                     strlistpost = 'AND ( ';
    //                     arrayPost.map((item, i) => {
    //                         //  console.log(i)
    //                         if (i != 0) {
    //                             strlistpost = strlistpost + `A.PostID = ${item.PostID}`;
    //                             if (i < arrayPost.length - 1) {
    //                                 strlistpost = strlistpost + ' OR '
    //                             }
    //                         }
    //                     })
    //                     strlistpost = strlistpost + ' )';
    //                 }
    //             }
    //
    //             if (post != '') {
    //                 strpost = ` AND A.PostID='${post}'`
    //             }
    //
    //             if (country != '') {
    //                 strcontry = ` AND POLITICS = ${country}`
    //             }
    //
    //             var sqlPersonStr = 'select PER_ID,PER_NAME,OrgName,B.PostName,A.PostID from PER_PERSON AS A LEFT JOIN UCML_Post AS B ON A.PostID = B.PostID where PER_STATUS=1';
    //
    //             sqlPersonStr = sqlPersonStr + ` AND PER_ID like N'%${personNO.toString().trim()}%' AND PER_NAME like N'%${personName.toString().trim()}%'` + strpost + strcontry + strlistpost;
    //
    //             var res = await sql.query(sqlPersonStr);
    //             arrPerson = res.recordsets[0];
    //             // console.log(sqlPersonStr)
    //             var sqltr = 'SELECT PER_SHIFT.PS_INC,PS_BATTH,PS_TYPE,PS_CLASS,PS_SEQ1,PS_SEQ2,PS_SEQ3,IS_SELECT1 ,IS_SELECT2,IS_SELECT3 ,PS_WORKHOUR1,PS_WORKHOUR2,PS_WORKHOUR3, PS_OFFWORK1,PS_OFFWORK2,PS_OFFWORK3,PS_MINUUES_A1,PS_MINUUES_A2,PS_MINUUES_A3,PS_MINUUES_B1,PS_MINUUES_B2,PS_MINUUES_B3,PS_MINUUES_C1,PS_MINUUES_C2,PS_MINUUES_C3,PER_ID,IS_CrossDay1,IS_CrossDay2,IS_CrossDay3 , CodeName,  PS_DATE ' +
    //                 `FROM PER_SHIFT,PER_SCHEDUE,CodeValue WHERE  PER_SHIFT.PS_INC = PER_SCHEDUE.PS_INC AND PS_DATE <= '${dayend}' and  PS_DATE > ='${daystart}' and CodeTableID ='eWDFS_12'  and CodeID = PS_TYPE`;
    //             if (personNO) {
    //                 sqltr = sqltr + ` AND PER_ID like N'%${personNO.toString().trim()}%'`
    //             }
    //             if (shift) {
    //                 sqltr = sqltr + ` AND PS_BATTH = '${shift}'`
    //             }
    //
    //             console.log(sqltr);
    //
    //             var res = await sql.query(sqltr)
    //             resultTime = res.recordsets[0]
    //             console.log(resultTime);
    //             sqlholidaystr = `SELECT FORMAT (PH_DATE, 'yyyy-MM-dd') as date FROM PER_PUBLICHOLIDAY`;
    //
    //             sqlholidayApply = `SELECT PER_ID,FORMAT(HA_SDATE,'yyyy-MM-dd') as HA_SDATE,FORMAT (HA_EDATE,'yyyy-MM-dd') as HA_EDATE ,HA_DAYS,HA_STIME FROM PER_HOLIDAYAPPLY WHERE PER_ID like N'%${personNO.toString().trim()}%'`
    //
    //
    //             var hol = await sql.query(sqlholidaystr)
    //             var res_HA = await sql.query(sqlholidayApply)
    //             const holiday = hol.recordsets[0];
    //
    //             const Array_HA = res_HA.recordsets[0]
    //             try {
    //                 arrPerson.map(element => {
    //                     var start = new Date(daystart);
    //                     var end = new Date(dayend);
    //                     var loop = new Date(start);
    //
    //                     while (loop <= end) {
    //
    //                         var dt = new Date(loop)
    //
    //                         MM = (dt.getMonth() + 1) < 10 ? `0${(dt.getMonth() + 1)}` : (dt.getMonth() + 1);
    //
    //                         //  console.log('lenmon', mon < 10)
    //                         var date = dt.getUTCFullYear() + '-' + MM + '-' + (dt.getDate());
    //                         var date2 = dt.getUTCFullYear() + '-' + (dt.getMonth() + 1) + '-' + (dt.getDate());
    //
    //                         //   console.log(holiday.findIndex(e => Date(e) == Date(date)))
    //                         const hols = checkDateInList(holiday, date);
    //                         const PER_HA = checkDateApplyInList(Array_HA, date, element.PER_ID);
    //
    //                         var resultTimeOnePerson = resultTime.filter(e => (e.PS_DATE.getFullYear() + '-' + (e.PS_DATE.getMonth() + 1) + '-' + e.PS_DATE.getDate()) == date2 && e.PER_ID == element.PER_ID);
    //                         //console.log(resultTimeOnePerson)
    //
    //                         var ShiftID = '';
    //                         var ShiftName = '';
    //                         var TimeKeepStart1 = '';
    //                         var TimeKeepEnd1 = '';
    //                         var TimeKeepStart2 = '';
    //                         var TimeKeepEnd2 = '';
    //                         var TimeKeepStart3 = '';
    //                         var TimeKeepEnd3 = '';
    //                         var TimeKeepStart4 = '';
    //                         var TimeKeepEnd4 = '';
    //                         var TimeKeepStart5 = '';
    //                         var TimeKeepEnd5 = '';
    //                         var TimeKeepStart6 = '';
    //                         var TimeKeepEnd6 = '';
    //                         var TimeLate1 = '';
    //                         var TimeLate2 = '';
    //
    //                         var TimeKeepEnd1_ = '';
    //                         var TimeKeepEnd2_ = '';
    //                         var TimeKeepEnd3_ = '';
    //                         var TimeKeepEnd4_ = '';
    //                         var TimeKeepEnd5_ = '';
    //                         var TimeKeepEnd6_ = '';
    //
    //                         var TimeHolidayApply1 = '';
    //                         var TimeHolidayApply2 = '';
    //                         var TimeHolidayApply3 = '';
    //
    //
    //                         var timestart1 = global.timeEmpty;
    //                         var timestart2 = global.timeEmpty;
    //                         var timestart3 = global.timeEmpty;
    //                         var timeend1 = global.timeEmpty;
    //                         var timeend2 = global.timeEmpty;
    //                         var timeend3 = global.timeEmpty;
    //
    //                         var PS_WORKHOUR1 = '';
    //                         var PS_OFFWORK1 = '';
    //                         var PS_WORKHOUR2 = '';
    //                         var PS_OFFWORK2 = '';
    //                         var PS_WORKHOUR3 = '';
    //                         var PS_OFFWORK3 = '';
    //
    //                         var IS_CrossDay1 = null;
    //                         var IS_CrossDay2 = null;
    //                         var IS_CrossDay3 = null;
    //
    //                         if (resultTimeOnePerson.length > 0) {
    //
    //                             resultTimeOnePerson = resultTimeOnePerson[0];
    //                             if (resultTimeOnePerson.IS_SELECT1) {
    //                                 PS_WORKHOUR1 = new Date(resultTimeOnePerson.PS_WORKHOUR1.toUTCString());
    //                                 PS_OFFWORK1 = new Date(resultTimeOnePerson.PS_OFFWORK1.toUTCString());
    //
    //                                 TimeKeepStart1 = utils.tool.subTime(PS_WORKHOUR1.getUTCHours(), PS_WORKHOUR1.getUTCMinutes(), resultTimeOnePerson.PS_MINUUES_A1);
    //                                 TimeKeepEnd1 = utils.tool.addTime(PS_WORKHOUR1.getUTCHours(), PS_WORKHOUR1.getUTCMinutes(), resultTimeOnePerson.PS_MINUUES_B1);
    //
    //                                 TimeKeepStart2 = utils.tool.subTime(PS_OFFWORK1.getUTCHours(), PS_OFFWORK1.getUTCMinutes(), 0);
    //                                 TimeKeepEnd2 = utils.tool.addTime(PS_OFFWORK1.getUTCHours(), PS_OFFWORK1.getUTCMinutes(), resultTimeOnePerson.PS_MINUUES_C1);
    //
    //                                 TimeKeepEnd1_ = utils.tool.addTime(PS_WORKHOUR1.getUTCHours(), PS_WORKHOUR1.getUTCMinutes(), 0);
    //                                 TimeKeepEnd2_ = utils.tool.addTime(PS_OFFWORK1.getUTCHours(), PS_OFFWORK1.getUTCMinutes(), 0);
    //                                 if (PER_HA) {
    //                                     TimeHolidayApply1 = utils.tool.addTime(PS_WORKHOUR1.getUTCHours(), PS_WORKHOUR1.getUTCMinutes(), 0);
    //                                 }
    //
    //                             }
    //
    //                             if (resultTimeOnePerson.IS_SELECT2) {
    //                                 PS_WORKHOUR2 = new Date(resultTimeOnePerson.PS_WORKHOUR2.toUTCString());
    //                                 PS_OFFWORK2 = new Date(resultTimeOnePerson.PS_OFFWORK2.toUTCString());
    //
    //                                 TimeKeepStart3 = utils.tool.subTime(PS_WORKHOUR2.getUTCHours(), PS_WORKHOUR2.getUTCMinutes(), resultTimeOnePerson.PS_MINUUES_A2);
    //                                 TimeKeepEnd3 = utils.tool.addTime(PS_WORKHOUR2.getUTCHours(), PS_WORKHOUR2.getUTCMinutes(), resultTimeOnePerson.PS_MINUUES_B2);
    //
    //                                 TimeKeepStart4 = utils.tool.subTime(PS_OFFWORK2.getUTCHours(), PS_OFFWORK2.getUTCMinutes(), 0);
    //
    //
    //                                 TimeKeepEnd3_ = utils.tool.addTime(PS_WORKHOUR2.getUTCHours(), PS_WORKHOUR2.getUTCMinutes(), 0);
    //                                 TimeKeepEnd4_ = utils.tool.addTime(PS_OFFWORK2.getUTCHours(), PS_OFFWORK2.getUTCMinutes(), 0);
    //
    //                                 TimeKeepEnd4 = utils.tool.addTime(PS_OFFWORK2.getUTCHours(), PS_OFFWORK2.getUTCMinutes(), resultTimeOnePerson.PS_MINUUES_C2);
    //
    //                                 if (PER_HA) {
    //                                     TimeHolidayApply2 = utils.tool.addTime(PS_OFFWORK2.getUTCHours(), PS_OFFWORK2.getUTCMinutes(), 0);
    //                                 }
    //                             }
    //                             if (resultTimeOnePerson.IS_SELECT3) {
    //                                 PS_WORKHOUR3 = new Date(resultTimeOnePerson.PS_WORKHOUR3.toUTCString());
    //                                 PS_OFFWORK3 = new Date(resultTimeOnePerson.PS_OFFWORK3.toUTCString());
    //
    //                                 TimeKeepStart5 = utils.tool.subTime(PS_WORKHOUR3.getUTCHours(), PS_WORKHOUR3.getUTCMinutes(), resultTimeOnePerson.PS_MINUUES_A3);
    //                                 TimeKeepEnd5 = utils.tool.addTime(PS_WORKHOUR3.getUTCHours(), PS_WORKHOUR3.getUTCMinutes(), resultTimeOnePerson.PS_MINUUES_B3);
    //
    //                                 TimeKeepStart6 = utils.tool.subTime(PS_OFFWORK3.getUTCHours(), PS_OFFWORK3.getUTCMinutes(), 0);
    //
    //                                 TimeKeepEnd5_ = utils.tool.addTime(PS_WORKHOUR3.getUTCHours(), PS_WORKHOUR3.getUTCMinutes(), 0);
    //                                 TimeKeepEnd6_ = utils.tool.addTime(PS_OFFWORK3.getUTCHours(), PS_OFFWORK3.getUTCMinutes(), 0);
    //
    //                                 TimeKeepEnd6 = utils.tool.addTime(PS_OFFWORK3.getUTCHours(), PS_OFFWORK3.getUTCMinutes(), resultTimeOnePerson.PS_MINUUES_C3);
    //
    //                                 if (PER_HA) {
    //                                     TimeHolidayApply3 = utils.tool.addTime(PS_OFFWORK3.getUTCHours(), PS_OFFWORK3.getUTCMinutes(), 0);
    //                                 }
    //
    //                             }
    //
    //                             IS_CrossDay1 = resultTimeOnePerson.IS_CrossDay1;
    //                             IS_CrossDay2 = resultTimeOnePerson.IS_CrossDay2;
    //                             IS_CrossDay3 = resultTimeOnePerson.IS_CrossDay3;
    //
    //                             ShiftName = resultTimeOnePerson.CodeName,
    //                                 console.log(ShiftName)
    //                             ShiftID = resultTimeOnePerson.PS_BATTH,
    //                                 TimeLate2 = PS_WORKHOUR2.getUTCHours() + ':' + PS_WORKHOUR2.getUTCMinutes();
    //                             TimeLate1 = PS_WORKHOUR1.getUTCHours() + ':' + PS_WORKHOUR1.getUTCMinutes();
    //
    //                             var dataTime = {
    //                                 TimeKeepStart1: TimeKeepStart1,
    //                                 TimeKeepStart2: TimeKeepStart2,
    //                                 TimeKeepStart3: TimeKeepStart3,
    //                                 TimeKeepStart4: TimeKeepStart4,
    //                                 TimeKeepStart5: TimeKeepStart5,
    //                                 TimeKeepStart6: TimeKeepStart6,
    //                                 TimeKeepEnd1: TimeKeepEnd1,
    //                                 TimeKeepEnd2: TimeKeepEnd2,
    //                                 TimeKeepEnd3: TimeKeepEnd3,
    //                                 TimeKeepEnd4: TimeKeepEnd4,
    //                                 TimeKeepEnd5: TimeKeepEnd5,
    //                                 TimeKeepEnd6: TimeKeepEnd6,
    //                                 IS_CrossDay1: IS_CrossDay1,
    //                                 IS_CrossDay2: IS_CrossDay2,
    //                                 IS_CrossDay3: IS_CrossDay3,
    //                             }
    //
    //                             timestart1 = utils.tool.getTime(arrayDataAttenedance, FPList, element.PER_ID, loop, 1, dataTime, '');
    //                             timeend1 = utils.tool.getTime(arrayDataAttenedance, FPList, element.PER_ID, loop, 2, dataTime, '');
    //
    //                             timestart2 = utils.tool.getTime(arrayDataAttenedance, FPList, element.PER_ID, loop, 3, dataTime, timeend1);
    //                             timeend2 = utils.tool.getTime(arrayDataAttenedance, FPList, element.PER_ID, loop, 4, dataTime, '');
    //
    //                             timestart3 = utils.tool.getTime(arrayDataAttenedance, FPList, element.PER_ID, loop, 5, dataTime, timeend2);
    //                             timeend3 = utils.tool.getTime(arrayDataAttenedance, FPList, element.PER_ID, loop, 6, dataTime, '');
    //                             console.log(timestart1, timeend1, timestart2, timeend2, "here")
    //                             if (utils.tool.CheckNoonTime(timeend1, timestart2)) {
    //                                 var temptime = timeend1;
    //                                 timeend1 = timestart2;
    //                                 timestart2 = temptime;
    //                             }
    //
    //                             if (utils.tool.convertTimeToMinutes(timeend1) == utils.tool.convertTimeToMinutes(timestart2)) {
    //                                 timeend1 = ''
    //                             }
    //
    //                         }
    //
    //                         if (!all) {
    //                             if (timestart1 != timeEmpty || timestart2 != timeEmpty || timestart3 != timeEmpty || timeend1 != timeEmpty || timeend2 != timeEmpty || timeend3 != timeEmpty) {
    //                                 arrResult.push({
    //                                     Date: utils.tool.formatDate(loop.toUTCString()),
    //                                     PersonNO: element.PER_ID,
    //                                     PersonName: element.PER_NAME,
    //                                     Organize: element.OrgName,
    //                                     Department: element.OrgName,
    //                                     PostName: element.PostName,
    //                                     PostID: element.PostID,
    //                                     ShiftID: ShiftID,
    //                                     shiftName: ShiftName,
    //                                     Time1: ((PER_HA) ? TimeHolidayApply1 : timestart1),
    //                                     Time2: (PER_HA) ? TimeHolidayApply1 : timeend1,
    //                                     Time3: (resultTimeOnePerson.IS_SELECT3) ? ((PER_HA) ? TimeHolidayApply3 : timestart3) : ((PER_HA) ? '' : timestart2),
    //                                     Time4: (resultTimeOnePerson.IS_SELECT3) ? ((PER_HA) ? TimeHolidayApply3 : timeend3) : ((PER_HA) ? TimeHolidayApply2 : timeend2),
    //                                     Type: type,
    //                                     Status: (PER_HA) ? 0 : (hols) ? 0 : (timestart1 == timeEmpty || ((resultTimeOnePerson.IS_SELECT3) ? timeend3 : timeend2) == timeEmpty) ? 1 : 0,
    //                                     late1: (resultTimeOnePerson.length == 0) ? false : utils.tool.checklate(timestart1, TimeLate1),
    //                                     late2: (resultTimeOnePerson.length == 0) ? false : utils.tool.checklate(timestart2, TimeLate2),
    //                                     IS_CrossDay1: IS_CrossDay1,
    //                                     IS_CrossDay2: IS_CrossDay2,
    //                                     IS_CrossDay3: IS_CrossDay3,
    //
    //                                     TimeKeepStart1: TimeKeepStart1,
    //                                     TimeKeepStart2: TimeKeepStart2,
    //                                     TimeKeepStart3: TimeKeepStart3,
    //                                     TimeKeepStart4: TimeKeepStart4,
    //                                     TimeKeepStart5: TimeKeepStart5,
    //                                     TimeKeepStart6: TimeKeepStart6,
    //
    //                                     TimeKeepEnd1: TimeKeepEnd1_,
    //                                     TimeKeepEnd2: TimeKeepEnd2_,
    //                                     TimeKeepEnd3: TimeKeepEnd3_,
    //                                     TimeKeepEnd4: TimeKeepEnd4_,
    //                                     TimeKeepEnd5: TimeKeepEnd5_,
    //                                     TimeKeepEnd6: TimeKeepEnd6_,
    //                                     Holiday: hols,
    //                                     HolidayApply: PER_HA
    //
    //                                 })
    //                             }
    //                         } else {
    //                             arrResult.push({
    //                                 Date: utils.tool.formatDate(loop.toUTCString()),
    //                                 PersonNO: element.PER_ID,
    //                                 PersonName: element.PER_NAME,
    //                                 Organize: element.OrgName,
    //                                 Department: element.OrgName,
    //                                 PostName: element.PostName,
    //                                 PostID: element.PostID,
    //                                 ShiftID: ShiftID,
    //                                 shiftName: ShiftName,
    //                                 Time1: ((PER_HA) ? TimeHolidayApply1 : timestart1),
    //                                 Time2: (PER_HA) ? '' : timeend1,
    //                                 Time3: (resultTimeOnePerson.IS_SELECT3) ? ((PER_HA) ? TimeHolidayApply3 : timestart3) : ((PER_HA) ? '' : timestart2),
    //                                 Time4: (resultTimeOnePerson.IS_SELECT3) ? ((PER_HA) ? TimeHolidayApply3 : timeend3) : ((PER_HA) ? TimeHolidayApply2 : timeend2),
    //                                 Type: type,
    //                                 Status: (PER_HA) ? 0 : (hols) ? 0 : (timestart1 == timeEmpty || ((resultTimeOnePerson.IS_SELECT3) ? timeend3 : timeend2) == timeEmpty) ? 1 : 0,
    //                                 late1: (resultTimeOnePerson.length == 0) ? false : utils.tool.checklate(timestart1, TimeLate1),
    //                                 late2: (resultTimeOnePerson.length == 0) ? false : utils.tool.checklate(timestart2, TimeLate2),
    //
    //                                 IS_CrossDay1: IS_CrossDay1,
    //                                 IS_CrossDay2: IS_CrossDay2,
    //                                 IS_CrossDay3: IS_CrossDay3,
    //
    //                                 TimeKeepStart1: TimeKeepStart1,
    //                                 TimeKeepStart2: TimeKeepStart2,
    //                                 TimeKeepStart3: TimeKeepStart3,
    //                                 TimeKeepStart4: TimeKeepStart4,
    //                                 TimeKeepStart5: TimeKeepStart5,
    //                                 TimeKeepStart6: TimeKeepStart6,
    //
    //                                 TimeKeepEnd1: TimeKeepEnd1_,
    //                                 TimeKeepEnd2: TimeKeepEnd2_,
    //                                 TimeKeepEnd3: TimeKeepEnd3_,
    //                                 TimeKeepEnd4: TimeKeepEnd4_,
    //                                 TimeKeepEnd5: TimeKeepEnd5_,
    //                                 TimeKeepEnd6: TimeKeepEnd6_,
    //
    //                                 Holiday: hols,
    //                                 HolidayApply: PER_HA
    //                             })
    //                         }
    //
    //                         var newDate = loop.setDate(loop.getDate() + 1);
    //                         loop = new Date(newDate);
    //                     }
    //                 });
    //                 sql.close();
    //
    //                 if (status != '') {
    //                     if (status < 2) {
    //                         if (jimu) {
    //                             global.report = arrResult.filter(e => (e.Status == status) && ((shift != '') ? e.ShiftID == shift : true))
    //
    //                             return ress.send(JSON.stringify({success: true}))
    //                         } else {
    //                             return convertDataToArray(arrResult.filter(e => e.Status == status && (shift != '') ? e.ShiftID == shift : true), ress, listOrganize);
    //                         }
    //                     } else {
    //
    //                         if (jimu) {
    //
    //                             global.report = arrResult.filter(e => (e.late1 == true || e.late2 == true) && ((shift != '') ? e.ShiftID == shift : true));
    //
    //                             return ress.send(JSON.stringify({success: true}));
    //                         } else {
    //                             return convertDataToArray(arrResult.filter(e => (e.late1 == true || e.late2 == true) && ((shift != '') ? e.ShiftID == shift : true)), ress, listOrganize);
    //                         }
    //                     }
    //                 } else {
    //                     if (jimu) {
    //
    //                         global.report = arrResult.filter(e => (shift != '') ? e.ShiftID == shift : true);
    //
    //                         return ress.send(JSON.stringify({success: true}))
    //
    //                     } else {
    //                         return convertDataToArray(arrResult.filter(e => (shift != '') ? e.ShiftID == shift : true), ress, listOrganize);
    //                     }
    //                 }
    //
    //             } catch (err) {
    //                 console.log(err)
    //                 return;
    //             }
    //
    //         })
    //     } else {
    //         return;
    //     }
    // } catch (error) {
    //
    //     return;
    // }


}

function getRootFromTree(list, node) {

    const arr = {
        Organize: '',
        Department: ''
    }
    if (node == null) return arr;
    if (node == '') return arr;

    list.map((e) => {
        if (e.PostID.trim() == node.trim()) {
            arr.Organize = e.organize,
                arr.Department = e.departmentName
            return arr;
        }
    });

    return arr;
}

async function convertDataToArray(data, res, list) {

    var arr = [];

    data.map((e, i) => {
        const info = getRootFromTree(list, e.PostID)
        arr.push({
            no: i + 1,
            date: e.Date,
            PersonNO: e.PersonNO,
            fullname: e.PersonName,
            organize: info.Organize,
            department: info.Department,
            post: e.PostName,
            shiftName: e.shiftName,
            startwork1: e.Time1,
            endwork1: e.Time2,
            startwork2: e.Time3,
            endwork2: e.Time4,
            credentialType: (e.Type == 1) ? "考勤+刷卡" : (e.Type == 2) ? "考勤" : "刷卡",
            status: (e.Status == 1) ? "异常" : "正常",

        })
    })

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
        const datas = await exp.export.ExportToExcel(arr).workbook.xlsx.writeFile(`${path}/data${t}.xlsx`)
            .then(() => {

                res.send({
                    status: "success",
                    message: "file successfully downloaded",
                    path: `${t}.xlsx`,
                });
            });
    } catch (err) {

        res.send({
            status: "error",
            message: "Something went wrong",
        });
    }
}

router.post('/downloadExcels', async (req, res) => {
    processDataToExport(req, res, req.body.all, false);
})


router.get('/downloadExcel', async (req, res) => {
    const path = "./files";
    if (!req.query.path) return res.send(JSON.stringify({success: false, error: 109, message: "Dont found path"}))

    const file = `${path}/data${req.query.path}`;

    res.download(
        file,
        '考勤报告' + req.query.path,
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

router.post('/cardoffset', (req, res) => {

    const {PersonNo, DateTime, DeviceID} = req.body.data;
    console.log(DateTime)
    if (!PersonNo || !DateTime || !DeviceID) {
        return res.send(JSON.stringify({success: false, error: 123, response: "", message: "Internal server error"}))
    }
    try {
        db.query(global.sp_cardoffset, [PersonNo, DateTime, DeviceID], (err, result) => {
            if (err) {
                return res.send(JSON.stringify({success: false, error: 121, response: "", message: err}));
            }
            return res.send(JSON.stringify({success: true, error: 0, response: ""}));
        })
    } catch (error) {

        return ress.status(500).json({success: false, message: 'Internal server error', error: '103'});
    }
})


router.post('/listoffset', (req, res) => {
    const {daystart, dayend, PersonNo, PersonName} = req.body;

    try {
        db.query(global.sp_listoffset, [daystart, dayend, `%${PersonNo}%`, `%${PersonName}%`], (err, result) => {
            if (err) {
                return res.send(JSON.stringify({success: false, error: 121, response: "", message: err}));
            }
            var listData = [];
            result[0].map((element) => {
                listData.push({
                    DGUID: element.DGUID,
                    RecordID: element.RecordID,
                    Date: element.Date.getFullYear() + '-' + (element.Date.getMonth() + 1) + '-' + element.Date.getDate(),
                    Time: element.Time,
                    PersonNO: element.PersonNO,
                    PersonName: element.PersonName,
                    DeviceName: element.DeviceName,
                    DoorName: element.DoorName
                })
            })

            //  DGUID: '01c93622-e15d-11ec-8c9d-00256a021000',
            // RecordID: 'beea3a1b59a5f13bba1489324d085b6c',
            //     Date: 2022 - 05 - 31T17: 00: 00.000Z,
            //         Time: '07:29:11',
            //             PersonNO: 'EJ4011217',
            //                 PersonName: 'Ou Wen Tou欧文涛',
            //                     DeviceName: 'OFF-6F+OFFICE 6层办公室',
            //                         DoorName: 'CUA VO VP CHINH 6F 6楼办公室'


            return res.send(JSON.stringify({success: true, error: 0, response: listData}));
        })
    } catch (error) {
        return ress.status(500).json({success: false, message: 'Internal server error', error: '103'});
    }

})

router.post('/deleteoffset', (req, res) => {
    const {RecordID} = req.body;
    if (!RecordID) {
        return res.send(JSON.stringify({success: false, error: 123, response: "", message: "Internal server error"}));
    }

    try {
        db.query(global.sp_deleteoffset, [RecordID], (err, result) => {
            if (err) {
                return res.send(JSON.stringify({success: false, error: 121, response: "", message: err}));
            }
            return res.send(JSON.stringify({success: true, error: 0, response: "", message: ''}));
        })
    } catch (error) {
        return ress.status(500).json({success: false, message: 'Internal server error', error: '103'});
    }

})


router.post('/editActionTime', (req, res) => {

    const {PersonNo, Date, Time, DateTime} = req.body;
    if (!PersonNo || !Date || !Time || !DateTime) {
        return res.send(JSON.stringify({success: false, error: 123, response: "", message: "Internal server error"}));
    }

    try {

        db.query(global.sp_DGUID, [PersonNo, Date, Time], (err, result) => {
            if (result[0].length == 1) {
                db.query(global.sp_updateRecord, [result[0][0].DGUID, result[0][0].RecordID, DateTime], (err, result) => {
                    if (err) {
                        return res.send(JSON.stringify({success: false, error: 121, response: "", message: err}));
                    }
                    return res.send(JSON.stringify({success: true, error: 0, response: "", message: ''}));
                })
            }
        })
    } catch (error) {

        return ress.status(500).json({success: false, message: 'Internal server error', error: '103'});
    }

})


router.post('/getdepartment', async (req, res) => {
    const {Organize} = req.body;
    var sqldeprt = '';


    try {
        if (Organize != '') {
            sqldeprt = `SELECT UCML_OrganizeOID , OrgName from UCML_Organize WHERE  ParentOID in (SELECT UCML_OrganizeOID  from UCML_Organize WHERE UCML_OrganizeOID ='${Organize}' AND ParentOID in ( SELECT UCML_OrganizeOID from UCML_Organize WHERE ORG_FLG = 1  ))`;
        } else {
            sqldeprt = `SELECT UCML_OrganizeOID , OrgName from UCML_Organize WHERE  ParentOID in ( SELECT UCML_OrganizeOID  from UCML_Organize WHERE  ParentOID in ( SELECT UCML_OrganizeOID from UCML_Organize WHERE ORG_FLG = 1 ) )`;
        }
        await sql.connect(sqlConfig)
        var respon = await sql.query(sqldeprt)
        var result_derpartment = []
        await Promise.all(respon.recordsets[0].map(async (e) => {
            console.log(e);
            if (e.OrgName != '空') {

                result_derpartment.push({
                    derpartment_id: e.UCML_OrganizeOID,
                    departmentName: e.OrgName
                });

            } else {
                const sqldeprt1 = `SELECT UCML_OrganizeOID , OrgName from UCML_Organize WHERE  ParentOID in (SELECT UCML_OrganizeOID  from UCML_Organize WHERE UCML_OrganizeOID ='${e.UCML_OrganizeOID}')`
                await sql.connect(sqlConfig)
                await sql.query(sqldeprt1).then((r) => {
                    console.log(r)
                    r.recordsets[0].map(n => {

                        if (n.OrgName != '空') {
                            result_derpartment.push({
                                derpartment_id: n.UCML_OrganizeOID,
                                departmentName: n.OrgName
                            });
                            console.log('derp', result_derpartment);
                        }
                    })
                })


            }
        })).then(() => {
            sql.close();
            res.send(JSON.stringify({status: 200, error: null, response: result_derpartment}));
        })


    } catch (error) {
        console.log(error)
        return res.status(500).json({success: false, message: 'Internal server error', error: '101'})
    }

})

router.post('/getpost', async (req, res) => {
    const arr = [];
    var sqlpost = '';
    const {Post} = req.body;

    try {
        if (Post == '') {
            sqlpost = `SELECT UCML_PostOID,PostID,PostName FROM UCML_Post WHERE UCML_DivisionOID in (SELECT UCML_OrganizeOID FROM UCML_Organize WHERE  ORG_FLG <> 1)`;
            await sql.connect(sqlConfig)
            var respon = await sql.query(sqlpost)
            sql.close();
            res.send(JSON.stringify({status: 200, error: null, response: respon.recordsets[0]}));
        } else {
            try {

                await UID(1, Post).then(() => {
                    res.send(JSON.stringify({status: 200, error: '', response: arr}))
                })
            } catch (error) {
                return;
            }

        }
    } catch (error) {
        return res.status(500).json({success: false, message: 'Internal server error', error: '101'})
    }

    async function UID(len, parent) {
        const tl = sqldeprt_ = `SELECT UCML_Organize.UCML_OrganizeOID,OrgName FROM UCML_Organize WHERE UCML_Organize.ParentOID ='${parent}'`;
        var strp = `SELECT PostID,PostName,OrgName FROM UCML_Post LEFT JOIN UCML_Organize ON UCML_DivisionOID=UCML_Organize.UCML_OrganizeOID WHERE UCML_DivisionOID = '${parent}' `
        await sql.connect(sqlConfig)
        var resp = await sql.query(strp);

        resp.recordset.map((p) => {

            if (arr.findIndex(n => n.PostID == p.PostID) == -1) {
                arr.push({
                    PostID: p.PostID,
                    PostName: p.OrgName + '/' + p.PostName,
                })
            }
        });

        await getUID(len, tl);
    }

    async function getUID(len, sqldeprt_) {

        await sql.connect(sqlConfig)
        var respon = await sql.query(sqldeprt_)
        len = respon.recordset.length;
        if (len > 0) {
            try {
                await Promise.all(respon.recordset.map(async (e, i) => {


                    var strp = ` SELECT PostID,PostName,OrgName FROM UCML_Post LEFT JOIN UCML_Organize ON UCML_DivisionOID=UCML_Organize.UCML_OrganizeOID WHERE UCML_DivisionOID = '${e.UCML_OrganizeOID}' `
                    await sql.connect(sqlConfig)
                    var resp = await sql.query(strp);


                    resp.recordset.map((p) => {
                        if (arr.findIndex(n => n.PostID == p.PostID) == -1) {
                            arr.push({
                                PostID: p.PostID,
                                PostName: p.OrgName + '/' + p.PostName,
                            })
                        }
                    });


                })).then(async () => {
                    sql.close();
                    var sqlpost_ = '';
                    await respon.recordset.map(async (e, i) => {
                        sqlpost_ = sqlpost_ + ` SELECT UCML_Organize.UCML_OrganizeOID,OrgName FROM UCML_Organize WHERE UCML_Organize.ParentOID = '${e.UCML_OrganizeOID}'`;
                        if (i < (respon.recordset.length - 1) && respon.recordset.length > 1) {
                            sqlpost_ = sqlpost_ + ' UNION '
                        }
                    })
                    // console.log('star_', sqlpost_)
                    await getUID(1, sqlpost_)
                })
            } catch (error) {

                console.log(sqldeprt_, error.message);
            }

        }
    }

})

// router.post('/getpostMulti', async (req, res) => {
//     const arr = [];
//     var sqlpost = '';
//     const { Post } = req.body;

//     try {
//         if (Post == '') {
//             sqlpost = `SELECT UCML_PostOID,PostID,PostName FROM UCML_Post WHERE UCML_DivisionOID in (SELECT UCML_OrganizeOID FROM UCML_Organize WHERE  ORG_FLG <> 1)`;
//             await sql.connect(sqlConfig)
//             var respon = await sql.query(sqlpost)
//             sql.close();
//             res.send(JSON.stringify({ status: 200, error: null, response: respon.recordsets[0] }));
//         } else {
//             try {
//                 const resultRes = [];
//                 for (let index = 0; index < Post.length; index++) {
//                     const element = Post[index];
//                     arr = [];
//                     await UID(1, element.id).then(() => {
//                         resultRes = concat(resultRes, arr)
//                     })

//                 }
//                 res.send(JSON.stringify({ status: 200, error: '', response: arr }))

//             } catch (error) {
//                 return;
//             }

//         }
//     } catch (error) {
//         return res.status(500).json({ success: false, message: 'Internal server error', error: '101' })
//     }

//     async function UID(len, parent) {
//         const tl = sqldeprt_ = `SELECT UCML_Organize.UCML_OrganizeOID,OrgName FROM UCML_Organize WHERE UCML_Organize.ParentOID ='${parent}'`;
//         var strp = `SELECT PostID,PostName,OrgName FROM UCML_Post LEFT JOIN UCML_Organize ON UCML_DivisionOID=UCML_Organize.UCML_OrganizeOID WHERE UCML_DivisionOID = '${parent}' `
//         await sql.connect(sqlConfig)
//         var resp = await sql.query(strp);

//         resp.recordset.map((p) => {

//             if (arr.findIndex(n => n.PostID == p.PostID) == -1) {
//                 arr.push({
//                     PostID: p.PostID,
//                     PostName: p.OrgName + '/' + p.PostName,
//                 })
//             }
//         });

//         await getUID(len, tl);
//     }

//     async function getUID(len, sqldeprt_) {

//         await sql.connect(sqlConfig)
//         var respon = await sql.query(sqldeprt_)
//         len = respon.recordset.length;
//         if (len > 0) {
//             try {
//                 await Promise.all(respon.recordset.map(async (e, i) => {


//                     var strp = ` SELECT PostID,PostName,OrgName FROM UCML_Post LEFT JOIN UCML_Organize ON UCML_DivisionOID=UCML_Organize.UCML_OrganizeOID WHERE UCML_DivisionOID = '${e.UCML_OrganizeOID}' `
//                     await sql.connect(sqlConfig)
//                     var resp = await sql.query(strp);


//                     resp.recordset.map((p) => {
//                         if (arr.findIndex(n => n.PostID == p.PostID) == -1) {
//                             arr.push({
//                                 PostID: p.PostID,
//                                 PostName: p.OrgName + '/' + p.PostName,
//                             })
//                         }
//                     });


//                 })).then(async () => {
//                     sql.close();
//                     var sqlpost_ = '';
//                     await respon.recordset.map(async (e, i) => {
//                         sqlpost_ = sqlpost_ + ` SELECT UCML_Organize.UCML_OrganizeOID,OrgName FROM UCML_Organize WHERE UCML_Organize.ParentOID = '${e.UCML_OrganizeOID}'`;
//                         if (i < (respon.recordset.length - 1) && respon.recordset.length > 1) {
//                             sqlpost_ = sqlpost_ + ' UNION '
//                         }
//                     })
//                     // console.log('star_', sqlpost_)
//                     await getUID(1, sqlpost_)
//                 })
//             } catch (error) {

//                 console.log(sqldeprt_, error.message);
//             }

//         }
//     }

// })

router.get('/getcontry', async (req, res) => {

    try {

        sqlpost = `SELECT CodeID,CodeName FROM dbo.CodeValue WHERE CodeTableID='eWDFS_06'`;
        sql.close();
        await sql.connect(sqlConfig)
        var respon = await sql.query(sqlpost)
        sql.close();
        res.send(JSON.stringify({status: 200, error: null, response: respon.recordsets[0]}));

    } catch (error) {
        console.log(error)
        return res.status(500).json({success: false, message: 'Internal server error', error: '101'})
    }

})


module.exports = router;
