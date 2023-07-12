const excelJS = require("exceljs");

function ExportToExcel(arr) {

    const workbook = new excelJS.Workbook();
    const worksheet = workbook.addWorksheet("考勤报告", {
        pageSetup: {paperSize: 9, orientation: 'landscape'}
    });

    worksheet.columns = [
        {header: "序号", key: "no", width: 9},
        {header: "日期", key: "date", width: 16},
        {header: "人员号码", key: "PersonNO", width: 16},
        {header: "姓名", key: "fullname", width: 29},
        {header: "部门", key: "department", width: 17},
        {header: "班次", key: "shiftName", width: 15},
        {header: "早上上班", key: "startwork1", width: 13},
        {header: "中午下班", key: "endwork1", width: 13},
        {header: "下午上班", key: "startwork2", width: 13},
        {header: "下午上班", key: "endwork2", width: 13},
        {header: "晚上上班", key: "startwork3", width: 13},
        {header: "晚上下班", key: "endwork3", width: 13},
        {header: "考勤类型", key: "credentialType", width: 10},
        {header: "人脸状态", key: "status", width: 10},
    ];
    worksheet.getRow(1).eachCell((cell) => {
        cell.font = {
            name: 'SimSun',
            family: 4,
            size: 11,
            bold: true
        };
    });

    worksheet.getRow(1).height = 20;

    worksheet.getCell('A1').alignment = {vertical: 'middle', horizontal: 'center'};
    worksheet.getCell('B1').alignment = {vertical: 'middle', horizontal: 'center'};
    worksheet.getCell('C1').alignment = {vertical: 'middle', horizontal: 'center'};
    worksheet.getCell('D1').alignment = {vertical: 'middle', horizontal: 'center'};
    worksheet.getCell('E1').alignment = {vertical: 'middle', horizontal: 'center'};
    worksheet.getCell('F1').alignment = {vertical: 'middle', horizontal: 'center'};
    worksheet.getCell('G1').alignment = {vertical: 'middle', horizontal: 'center'};
    worksheet.getCell('H1').alignment = {vertical: 'middle', horizontal: 'center'};
    worksheet.getCell('I1').alignment = {vertical: 'middle', horizontal: 'center'};
    worksheet.getCell('J1').alignment = {vertical: 'middle', horizontal: 'center'};
    worksheet.getCell('K1').alignment = {vertical: 'middle', horizontal: 'center'};
    worksheet.getCell('L1').alignment = {vertical: 'middle', horizontal: 'center'};
    worksheet.getCell('M1').alignment = {vertical: 'middle', horizontal: 'center'};
    worksheet.getCell('N1').alignment = {vertical: 'middle', horizontal: 'center'};


    worksheet.getCell('A1').border = {
        top: {style: 'thin'},
        left: {style: 'thin'},
        bottom: {style: 'thin'},
        right: {style: 'thin'}
    };
    worksheet.getCell('B1').border = {
        top: {style: 'thin'},
        left: {style: 'thin'},
        bottom: {style: 'thin'},
        right: {style: 'thin'}
    };
    worksheet.getCell('C1').border = {
        top: {style: 'thin'},
        left: {style: 'thin'},
        bottom: {style: 'thin'},
        right: {style: 'thin'}
    };
    worksheet.getCell('D1').border = {
        top: {style: 'thin'},
        left: {style: 'thin'},
        bottom: {style: 'thin'},
        right: {style: 'thin'}
    };
    worksheet.getCell('E1').border = {
        top: {style: 'thin'},
        left: {style: 'thin'},
        bottom: {style: 'thin'},
        right: {style: 'thin'}
    };
    worksheet.getCell('F1').border = {
        top: {style: 'thin'},
        left: {style: 'thin'},
        bottom: {style: 'thin'},
        right: {style: 'thin'}
    };
    worksheet.getCell('G1').border = {
        top: {style: 'thin'},
        left: {style: 'thin'},
        bottom: {style: 'thin'},
        right: {style: 'thin'}
    };
    worksheet.getCell('H1').border = {
        top: {style: 'thin'},
        left: {style: 'thin'},
        bottom: {style: 'thin'},
        right: {style: 'thin'}
    };
    worksheet.getCell('I1').border = {
        top: {style: 'thin'},
        left: {style: 'thin'},
        bottom: {style: 'thin'},
        right: {style: 'thin'}
    };
    worksheet.getCell('J1').border = {
        top: {style: 'thin'},
        left: {style: 'thin'},
        bottom: {style: 'thin'},
        right: {style: 'thin'}
    };
    worksheet.getCell('K1').border = {
        top: {style: 'thin'},
        left: {style: 'thin'},
        bottom: {style: 'thin'},
        right: {style: 'thin'}
    };
    worksheet.getCell('L1').border = {
        top: {style: 'thin'},
        left: {style: 'thin'},
        bottom: {style: 'thin'},
        right: {style: 'thin'}
    };
    worksheet.getCell('M1').border = {
        top: {style: 'thin'},
        left: {style: 'thin'},
        bottom: {style: 'thin'},
        right: {style: 'thin'}
    };
    worksheet.getCell('N1').border = {
        top: {style: 'thin'},
        left: {style: 'thin'},
        bottom: {style: 'thin'},
        right: {style: 'thin'}
    };

    arr.forEach((e, i) => {
        i++;
        worksheet.addRow(e);
        worksheet.getRow(i + 1).height = 20;
        worksheet.getRow(i + 1).alignment = {vertical: 'middle', horizontal: 'center'};
        worksheet.getCell('D' + (i + 1)).alignment = {vertical: 'middle', horizontal: 'left'};

        worksheet.getCell('A' + (i + 1)).border = {
            top: {style: 'thin'},
            left: {style: 'thin'},
            bottom: {style: 'thin'},
            right: {style: 'thin'}
        };
        worksheet.getCell('B' + (i + 1)).border = {
            top: {style: 'thin'},
            left: {style: 'thin'},
            bottom: {style: 'thin'},
            right: {style: 'thin'}
        };
        worksheet.getCell('C' + (i + 1)).border = {
            top: {style: 'thin'},
            left: {style: 'thin'},
            bottom: {style: 'thin'},
            right: {style: 'thin'}
        };
        worksheet.getCell('D' + (i + 1)).border = {
            top: {style: 'thin'},
            left: {style: 'thin'},
            bottom: {style: 'thin'},
            right: {style: 'thin'}
        };
        worksheet.getCell('E' + (i + 1)).border = {
            top: {style: 'thin'},
            left: {style: 'thin'},
            bottom: {style: 'thin'},
            right: {style: 'thin'}
        };
        worksheet.getCell('F' + (i + 1)).border = {
            top: {style: 'thin'},
            left: {style: 'thin'},
            bottom: {style: 'thin'},
            right: {style: 'thin'}
        };
        worksheet.getCell('G' + (i + 1)).border = {
            top: {style: 'thin'},
            left: {style: 'thin'},
            bottom: {style: 'thin'},
            right: {style: 'thin'}
        };
        worksheet.getCell('H' + (i + 1)).border = {
            top: {style: 'thin'},
            left: {style: 'thin'},
            bottom: {style: 'thin'},
            right: {style: 'thin'}
        };
        worksheet.getCell('I' + (i + 1)).border = {
            top: {style: 'thin'},
            left: {style: 'thin'},
            bottom: {style: 'thin'},
            right: {style: 'thin'}
        };
        worksheet.getCell('J' + (i + 1)).border = {
            top: {style: 'thin'},
            left: {style: 'thin'},
            bottom: {style: 'thin'},
            right: {style: 'thin'}
        };
        worksheet.getCell('K' + (i + 1)).border = {
            top: {style: 'thin'},
            left: {style: 'thin'},
            bottom: {style: 'thin'},
            right: {style: 'thin'}
        };
        worksheet.getCell('L' + (i + 1)).border = {
            top: {style: 'thin'},
            left: {style: 'thin'},
            bottom: {style: 'thin'},
            right: {style: 'thin'}
        };
        worksheet.getCell('M' + (i + 1)).border = {
            top: {style: 'thin'},
            left: {style: 'thin'},
            bottom: {style: 'thin'},
            right: {style: 'thin'}
        };
        worksheet.getCell('N' + (i + 1)).border = {
            top: {style: 'thin'},
            left: {style: 'thin'},
            bottom: {style: 'thin'},
            right: {style: 'thin'}
        };
        worksheet.getRow(i + 1).eachCell((cell) => {
            cell.font = {name: 'SimSun', family: 4, size: 10,};
        });
    });

    return worksheet
}


function CPInventoryMain(arr) {

    const workbook = new excelJS.Workbook();
    const worksheet = workbook.addWorksheet("库存", {
        pageSetup: {paperSize: 9, orientation: 'landscape'}
    });

    worksheet.columns = [
        {header: "序号", key: "index", width: 9},
        {header: "缸号", key: "vat_no", width: 25},
        {header: "疋数", key: "pids_no", width: 10},
        {header: "净重/KG", key: "net_weight", width: 13},
        {header: "毛重/KG", key: "gross_weight", width: 13},
        {header: "本厂PO", key: "sal_po_no", width: 25},
        {header: "客户", key: "cust_code", width: 30},
        {header: "布类名称", key: "fab_name", width: 50},
        {header: "颜色", key: "color_name", width: 25},
        {header: "办单/大货", key: "salType", width: 15},
        {header: "开单日期", key: "create_time", width: 20},
        {header: "交货日期", key: "delive_date", width: 20},
        {header: "载具", key: "store_load", width: 15},
        {header: "货位", key: "store_local", width: 30},
        {header: "入库时间", key: "import_time", width: 20},
        {header: "操作", key: "creator", width: 15},
        {header: "更新时间", key: "update_time", width: 20},
        {header: "更新的人", key: "updator", width: 15},
    ];
    worksheet.getRow(1).eachCell((cell) => {
        cell.font = {
            name: 'Calibri',
            family: 4,
            size: 12,
            bold: true
        };
    });

    worksheet.getRow(1).height = 20;

    worksheet.getCell('A1').alignment = {vertical: 'middle', horizontal: 'center'};
    worksheet.getCell('B1').alignment = {vertical: 'middle', horizontal: 'center'};
    worksheet.getCell('C1').alignment = {vertical: 'middle', horizontal: 'center'};
    worksheet.getCell('D1').alignment = {vertical: 'middle', horizontal: 'center'};
    worksheet.getCell('E1').alignment = {vertical: 'middle', horizontal: 'center'};
    worksheet.getCell('F1').alignment = {vertical: 'middle', horizontal: 'center'};
    worksheet.getCell('G1').alignment = {vertical: 'middle', horizontal: 'center'};
    worksheet.getCell('H1').alignment = {vertical: 'middle', horizontal: 'center'};
    worksheet.getCell('I1').alignment = {vertical: 'middle', horizontal: 'center'};
    worksheet.getCell('J1').alignment = {vertical: 'middle', horizontal: 'center'};
    worksheet.getCell('K1').alignment = {vertical: 'middle', horizontal: 'center'};
    worksheet.getCell('L1').alignment = {vertical: 'middle', horizontal: 'center'};
    worksheet.getCell('M1').alignment = {vertical: 'middle', horizontal: 'center'};
    worksheet.getCell('N1').alignment = {vertical: 'middle', horizontal: 'center'};
    worksheet.getCell('O1').alignment = {vertical: 'middle', horizontal: 'center'};
    worksheet.getCell('P1').alignment = {vertical: 'middle', horizontal: 'center'};
    worksheet.getCell('Q1').alignment = {vertical: 'middle', horizontal: 'center'};
    worksheet.getCell('R1').alignment = {vertical: 'middle', horizontal: 'center'};

    worksheet.getCell('A1').border = {
        top: {style: 'thin'},
        left: {style: 'thin'},
        bottom: {style: 'thin'},
        right: {style: 'thin'}
    };
    worksheet.getCell('B1').border = {
        top: {style: 'thin'},
        left: {style: 'thin'},
        bottom: {style: 'thin'},
        right: {style: 'thin'}
    };
    worksheet.getCell('C1').border = {
        top: {style: 'thin'},
        left: {style: 'thin'},
        bottom: {style: 'thin'},
        right: {style: 'thin'}
    };
    worksheet.getCell('D1').border = {
        top: {style: 'thin'},
        left: {style: 'thin'},
        bottom: {style: 'thin'},
        right: {style: 'thin'}
    };
    worksheet.getCell('E1').border = {
        top: {style: 'thin'},
        left: {style: 'thin'},
        bottom: {style: 'thin'},
        right: {style: 'thin'}
    };
    worksheet.getCell('F1').border = {
        top: {style: 'thin'},
        left: {style: 'thin'},
        bottom: {style: 'thin'},
        right: {style: 'thin'}
    };
    worksheet.getCell('G1').border = {
        top: {style: 'thin'},
        left: {style: 'thin'},
        bottom: {style: 'thin'},
        right: {style: 'thin'}
    };
    worksheet.getCell('H1').border = {
        top: {style: 'thin'},
        left: {style: 'thin'},
        bottom: {style: 'thin'},
        right: {style: 'thin'}
    };
    worksheet.getCell('I1').border = {
        top: {style: 'thin'},
        left: {style: 'thin'},
        bottom: {style: 'thin'},
        right: {style: 'thin'}
    };
    worksheet.getCell('J1').border = {
        top: {style: 'thin'},
        left: {style: 'thin'},
        bottom: {style: 'thin'},
        right: {style: 'thin'}
    };
    worksheet.getCell('K1').border = {
        top: {style: 'thin'},
        left: {style: 'thin'},
        bottom: {style: 'thin'},
        right: {style: 'thin'}
    };
    worksheet.getCell('L1').border = {
        top: {style: 'thin'},
        left: {style: 'thin'},
        bottom: {style: 'thin'},
        right: {style: 'thin'}
    };
    worksheet.getCell('M1').border = {
        top: {style: 'thin'},
        left: {style: 'thin'},
        bottom: {style: 'thin'},
        right: {style: 'thin'}
    };
    worksheet.getCell('N1').border = {
        top: {style: 'thin'},
        left: {style: 'thin'},
        bottom: {style: 'thin'},
        right: {style: 'thin'}
    };
    worksheet.getCell('O1').border = {
        top: {style: 'thin'},
        left: {style: 'thin'},
        bottom: {style: 'thin'},
        right: {style: 'thin'}
    };
    worksheet.getCell('P1').border = {
        top: {style: 'thin'},
        left: {style: 'thin'},
        bottom: {style: 'thin'},
        right: {style: 'thin'}
    };
    worksheet.getCell('Q1').border = {
        top: {style: 'thin'},
        left: {style: 'thin'},
        bottom: {style: 'thin'},
        right: {style: 'thin'}
    };
    worksheet.getCell('R1').border = {
        top: {style: 'thin'},
        left: {style: 'thin'},
        bottom: {style: 'thin'},
        right: {style: 'thin'}
    };


    arr.forEach((e, i) => {
        i++;
        worksheet.addRow(e);
        worksheet.getRow(i + 1).height = 20;
        worksheet.getRow(i + 1).alignment = {vertical: 'middle', horizontal: 'center'};
        worksheet.getCell('B' + (i + 1)).alignment = {vertical: 'middle', horizontal: 'left'};
        worksheet.getCell('E' + (i + 1)).alignment = {vertical: 'middle', horizontal: 'left'};
        worksheet.getCell('D' + (i + 1)).alignment = {vertical: 'middle', horizontal: 'left'};
        worksheet.getCell('F' + (i + 1)).alignment = {vertical: 'middle', horizontal: 'left'};
        worksheet.getCell('G' + (i + 1)).alignment = {vertical: 'middle', horizontal: 'left'};
        worksheet.getCell('H' + (i + 1)).alignment = {vertical: 'middle', horizontal: 'left'};
        worksheet.getCell('I' + (i + 1)).alignment = {vertical: 'middle', horizontal: 'left'};
        worksheet.getCell('J' + (i + 1)).alignment = {vertical: 'middle', horizontal: 'left'};
        worksheet.getCell('K' + (i + 1)).alignment = {vertical: 'middle', horizontal: 'left'};
        worksheet.getCell('M' + (i + 1)).alignment = {vertical: 'middle', horizontal: 'left'};
        worksheet.getCell('N' + (i + 1)).alignment = {vertical: 'middle', horizontal: 'left'};
        worksheet.getCell('O' + (i + 1)).alignment = {vertical: 'middle', horizontal: 'left'};


        worksheet.getCell('A' + (i + 1)).border = {
            top: {style: 'thin'},
            left: {style: 'thin'},
            bottom: {style: 'thin'},
            right: {style: 'thin'}
        };
        worksheet.getCell('B' + (i + 1)).border = {
            top: {style: 'thin'},
            left: {style: 'thin'},
            bottom: {style: 'thin'},
            right: {style: 'thin'}
        };
        worksheet.getCell('C' + (i + 1)).border = {
            top: {style: 'thin'},
            left: {style: 'thin'},
            bottom: {style: 'thin'},
            right: {style: 'thin'}
        };
        worksheet.getCell('D' + (i + 1)).border = {
            top: {style: 'thin'},
            left: {style: 'thin'},
            bottom: {style: 'thin'},
            right: {style: 'thin'}
        };
        worksheet.getCell('E' + (i + 1)).border = {
            top: {style: 'thin'},
            left: {style: 'thin'},
            bottom: {style: 'thin'},
            right: {style: 'thin'}
        };
        worksheet.getCell('F' + (i + 1)).border = {
            top: {style: 'thin'},
            left: {style: 'thin'},
            bottom: {style: 'thin'},
            right: {style: 'thin'}
        };
        worksheet.getCell('G' + (i + 1)).border = {
            top: {style: 'thin'},
            left: {style: 'thin'},
            bottom: {style: 'thin'},
            right: {style: 'thin'}
        };
        worksheet.getCell('H' + (i + 1)).border = {
            top: {style: 'thin'},
            left: {style: 'thin'},
            bottom: {style: 'thin'},
            right: {style: 'thin'}
        };
        worksheet.getCell('I' + (i + 1)).border = {
            top: {style: 'thin'},
            left: {style: 'thin'},
            bottom: {style: 'thin'},
            right: {style: 'thin'}
        };
        worksheet.getCell('J' + (i + 1)).border = {
            top: {style: 'thin'},
            left: {style: 'thin'},
            bottom: {style: 'thin'},
            right: {style: 'thin'}
        };
        worksheet.getCell('K' + (i + 1)).border = {
            top: {style: 'thin'},
            left: {style: 'thin'},
            bottom: {style: 'thin'},
            right: {style: 'thin'}
        };
        worksheet.getCell('L' + (i + 1)).border = {
            top: {style: 'thin'},
            left: {style: 'thin'},
            bottom: {style: 'thin'},
            right: {style: 'thin'}
        };
        worksheet.getCell('M' + (i + 1)).border = {
            top: {style: 'thin'},
            left: {style: 'thin'},
            bottom: {style: 'thin'},
            right: {style: 'thin'}
        };
        worksheet.getCell('N' + (i + 1)).border = {
            top: {style: 'thin'},
            left: {style: 'thin'},
            bottom: {style: 'thin'},
            right: {style: 'thin'}
        };
        worksheet.getCell('O' + (i + 1)).border = {
            top: {style: 'thin'},
            left: {style: 'thin'},
            bottom: {style: 'thin'},
            right: {style: 'thin'}
        };
        worksheet.getCell('P' + (i + 1)).border = {
            top: {style: 'thin'},
            left: {style: 'thin'},
            bottom: {style: 'thin'},
            right: {style: 'thin'}
        };
        worksheet.getCell('Q' + (i + 1)).border = {
            top: {style: 'thin'},
            left: {style: 'thin'},
            bottom: {style: 'thin'},
            right: {style: 'thin'}
        };
        worksheet.getCell('R' + (i + 1)).border = {
            top: {style: 'thin'},
            left: {style: 'thin'},
            bottom: {style: 'thin'},
            right: {style: 'thin'}
        };
        worksheet.getRow(i + 1).eachCell((cell) => {
            cell.font = {name: 'Calibri', family: 4, size: 12,};
        });
    });

    return worksheet
}

function CPInventoryDetail(arr) {

    const workbook = new excelJS.Workbook();
    const worksheet = workbook.addWorksheet("库存", {
        pageSetup: {paperSize: 9, orientation: 'landscape'}
    });

    worksheet.columns = [
        {header: "序号", key: "index", width: 9},
        {header: "缸号", key: "vat_no", width: 25},
        {header: "疋号", key: "pid_no", width: 10},
        {header: "成品编号", key: "product_no", width: 25},
        {header: "净重/KG", key: "net_weight", width: 13},
        {header: "毛重/KG", key: "gross_weight", width: 13},
        {header: "本厂PO", key: "sal_po_no", width: 25},
        {header: "客户", key: "cust_code", width: 30},
        {header: "布类名称", key: "fab_name", width: 50},
        {header: "颜色", key: "color_name", width: 25},
        {header: "办单/大货", key: "salType", width: 15},
        {header: "开单日期", key: "create_time", width: 20},
        {header: "交货日期", key: "delive_date", width: 20},
        {header: "载具", key: "store_load", width: 15},
        {header: "货位", key: "store_local", width: 30},
        {header: "入库时间", key: "import_time", width: 20},
        {header: "操作", key: "creator", width: 15},
        {header: "更新时间", key: "update_time", width: 20},
        {header: "更新的人", key: "updator", width: 15},
    ];
    worksheet.getRow(1).eachCell((cell) => {
        cell.font = {
            name: 'Calibri',
            family: 4,
            size: 12,
            bold: true
        };
    });

    worksheet.getRow(1).height = 20;

    worksheet.getCell('A1').alignment = {vertical: 'middle', horizontal: 'center'};
    worksheet.getCell('B1').alignment = {vertical: 'middle', horizontal: 'center'};
    worksheet.getCell('C1').alignment = {vertical: 'middle', horizontal: 'center'};
    worksheet.getCell('D1').alignment = {vertical: 'middle', horizontal: 'center'};
    worksheet.getCell('E1').alignment = {vertical: 'middle', horizontal: 'center'};
    worksheet.getCell('F1').alignment = {vertical: 'middle', horizontal: 'center'};
    worksheet.getCell('G1').alignment = {vertical: 'middle', horizontal: 'center'};
    worksheet.getCell('H1').alignment = {vertical: 'middle', horizontal: 'center'};
    worksheet.getCell('I1').alignment = {vertical: 'middle', horizontal: 'center'};
    worksheet.getCell('J1').alignment = {vertical: 'middle', horizontal: 'center'};
    worksheet.getCell('K1').alignment = {vertical: 'middle', horizontal: 'center'};
    worksheet.getCell('L1').alignment = {vertical: 'middle', horizontal: 'center'};
    worksheet.getCell('M1').alignment = {vertical: 'middle', horizontal: 'center'};
    worksheet.getCell('N1').alignment = {vertical: 'middle', horizontal: 'center'};
    worksheet.getCell('O1').alignment = {vertical: 'middle', horizontal: 'center'};
    worksheet.getCell('P1').alignment = {vertical: 'middle', horizontal: 'center'};
    worksheet.getCell('Q1').alignment = {vertical: 'middle', horizontal: 'center'};
    worksheet.getCell('R1').alignment = {vertical: 'middle', horizontal: 'center'};
    worksheet.getCell('R1').alignment = {vertical: 'middle', horizontal: 'center'};
    worksheet.getCell('S1').alignment = {vertical: 'middle', horizontal: 'center'};
    worksheet.getCell('A1').border = {
        top: {style: 'thin'},
        left: {style: 'thin'},
        bottom: {style: 'thin'},
        right: {style: 'thin'}
    };
    worksheet.getCell('B1').border = {
        top: {style: 'thin'},
        left: {style: 'thin'},
        bottom: {style: 'thin'},
        right: {style: 'thin'}
    };
    worksheet.getCell('C1').border = {
        top: {style: 'thin'},
        left: {style: 'thin'},
        bottom: {style: 'thin'},
        right: {style: 'thin'}
    };
    worksheet.getCell('D1').border = {
        top: {style: 'thin'},
        left: {style: 'thin'},
        bottom: {style: 'thin'},
        right: {style: 'thin'}
    };
    worksheet.getCell('E1').border = {
        top: {style: 'thin'},
        left: {style: 'thin'},
        bottom: {style: 'thin'},
        right: {style: 'thin'}
    };
    worksheet.getCell('F1').border = {
        top: {style: 'thin'},
        left: {style: 'thin'},
        bottom: {style: 'thin'},
        right: {style: 'thin'}
    };
    worksheet.getCell('G1').border = {
        top: {style: 'thin'},
        left: {style: 'thin'},
        bottom: {style: 'thin'},
        right: {style: 'thin'}
    };
    worksheet.getCell('H1').border = {
        top: {style: 'thin'},
        left: {style: 'thin'},
        bottom: {style: 'thin'},
        right: {style: 'thin'}
    };
    worksheet.getCell('I1').border = {
        top: {style: 'thin'},
        left: {style: 'thin'},
        bottom: {style: 'thin'},
        right: {style: 'thin'}
    };
    worksheet.getCell('J1').border = {
        top: {style: 'thin'},
        left: {style: 'thin'},
        bottom: {style: 'thin'},
        right: {style: 'thin'}
    };
    worksheet.getCell('K1').border = {
        top: {style: 'thin'},
        left: {style: 'thin'},
        bottom: {style: 'thin'},
        right: {style: 'thin'}
    };
    worksheet.getCell('L1').border = {
        top: {style: 'thin'},
        left: {style: 'thin'},
        bottom: {style: 'thin'},
        right: {style: 'thin'}
    };
    worksheet.getCell('M1').border = {
        top: {style: 'thin'},
        left: {style: 'thin'},
        bottom: {style: 'thin'},
        right: {style: 'thin'}
    };
    worksheet.getCell('N1').border = {
        top: {style: 'thin'},
        left: {style: 'thin'},
        bottom: {style: 'thin'},
        right: {style: 'thin'}
    };
    worksheet.getCell('O1').border = {
        top: {style: 'thin'},
        left: {style: 'thin'},
        bottom: {style: 'thin'},
        right: {style: 'thin'}
    };
    worksheet.getCell('P1').border = {
        top: {style: 'thin'},
        left: {style: 'thin'},
        bottom: {style: 'thin'},
        right: {style: 'thin'}
    };
    worksheet.getCell('Q1').border = {
        top: {style: 'thin'},
        left: {style: 'thin'},
        bottom: {style: 'thin'},
        right: {style: 'thin'}
    };
    worksheet.getCell('R1').border = {
        top: {style: 'thin'},
        left: {style: 'thin'},
        bottom: {style: 'thin'},
        right: {style: 'thin'}
    };
    worksheet.getCell('S1').border = {
        top: {style: 'thin'},
        left: {style: 'thin'},
        bottom: {style: 'thin'},
        right: {style: 'thin'}
    };


    arr.forEach((e, i) => {
        i++;
        worksheet.addRow(e);
        worksheet.getRow(i + 1).height = 20;
        worksheet.getRow(i + 1).alignment = {vertical: 'middle', horizontal: 'center'};
        worksheet.getCell('B' + (i + 1)).alignment = {vertical: 'middle', horizontal: 'left'};
        worksheet.getCell('E' + (i + 1)).alignment = {vertical: 'middle', horizontal: 'left'};
        worksheet.getCell('D' + (i + 1)).alignment = {vertical: 'middle', horizontal: 'left'};
        worksheet.getCell('F' + (i + 1)).alignment = {vertical: 'middle', horizontal: 'left'};
        worksheet.getCell('G' + (i + 1)).alignment = {vertical: 'middle', horizontal: 'left'};
        worksheet.getCell('H' + (i + 1)).alignment = {vertical: 'middle', horizontal: 'left'};
        worksheet.getCell('I' + (i + 1)).alignment = {vertical: 'middle', horizontal: 'left'};
        worksheet.getCell('J' + (i + 1)).alignment = {vertical: 'middle', horizontal: 'left'};
        worksheet.getCell('K' + (i + 1)).alignment = {vertical: 'middle', horizontal: 'left'};
        worksheet.getCell('M' + (i + 1)).alignment = {vertical: 'middle', horizontal: 'left'};
        worksheet.getCell('N' + (i + 1)).alignment = {vertical: 'middle', horizontal: 'left'};
        worksheet.getCell('O' + (i + 1)).alignment = {vertical: 'middle', horizontal: 'left'};
        worksheet.getCell('P' + (i + 1)).alignment = {vertical: 'middle', horizontal: 'left'};


        worksheet.getCell('A' + (i + 1)).border = {
            top: {style: 'thin'},
            left: {style: 'thin'},
            bottom: {style: 'thin'},
            right: {style: 'thin'}
        };
        worksheet.getCell('B' + (i + 1)).border = {
            top: {style: 'thin'},
            left: {style: 'thin'},
            bottom: {style: 'thin'},
            right: {style: 'thin'}
        };
        worksheet.getCell('C' + (i + 1)).border = {
            top: {style: 'thin'},
            left: {style: 'thin'},
            bottom: {style: 'thin'},
            right: {style: 'thin'}
        };
        worksheet.getCell('D' + (i + 1)).border = {
            top: {style: 'thin'},
            left: {style: 'thin'},
            bottom: {style: 'thin'},
            right: {style: 'thin'}
        };
        worksheet.getCell('E' + (i + 1)).border = {
            top: {style: 'thin'},
            left: {style: 'thin'},
            bottom: {style: 'thin'},
            right: {style: 'thin'}
        };
        worksheet.getCell('F' + (i + 1)).border = {
            top: {style: 'thin'},
            left: {style: 'thin'},
            bottom: {style: 'thin'},
            right: {style: 'thin'}
        };
        worksheet.getCell('G' + (i + 1)).border = {
            top: {style: 'thin'},
            left: {style: 'thin'},
            bottom: {style: 'thin'},
            right: {style: 'thin'}
        };
        worksheet.getCell('H' + (i + 1)).border = {
            top: {style: 'thin'},
            left: {style: 'thin'},
            bottom: {style: 'thin'},
            right: {style: 'thin'}
        };
        worksheet.getCell('I' + (i + 1)).border = {
            top: {style: 'thin'},
            left: {style: 'thin'},
            bottom: {style: 'thin'},
            right: {style: 'thin'}
        };
        worksheet.getCell('J' + (i + 1)).border = {
            top: {style: 'thin'},
            left: {style: 'thin'},
            bottom: {style: 'thin'},
            right: {style: 'thin'}
        };
        worksheet.getCell('K' + (i + 1)).border = {
            top: {style: 'thin'},
            left: {style: 'thin'},
            bottom: {style: 'thin'},
            right: {style: 'thin'}
        };
        worksheet.getCell('L' + (i + 1)).border = {
            top: {style: 'thin'},
            left: {style: 'thin'},
            bottom: {style: 'thin'},
            right: {style: 'thin'}
        };
        worksheet.getCell('M' + (i + 1)).border = {
            top: {style: 'thin'},
            left: {style: 'thin'},
            bottom: {style: 'thin'},
            right: {style: 'thin'}
        };
        worksheet.getCell('N' + (i + 1)).border = {
            top: {style: 'thin'},
            left: {style: 'thin'},
            bottom: {style: 'thin'},
            right: {style: 'thin'}
        };
        worksheet.getCell('O' + (i + 1)).border = {
            top: {style: 'thin'},
            left: {style: 'thin'},
            bottom: {style: 'thin'},
            right: {style: 'thin'}
        };
        worksheet.getCell('P' + (i + 1)).border = {
            top: {style: 'thin'},
            left: {style: 'thin'},
            bottom: {style: 'thin'},
            right: {style: 'thin'}
        };
        worksheet.getCell('Q' + (i + 1)).border = {
            top: {style: 'thin'},
            left: {style: 'thin'},
            bottom: {style: 'thin'},
            right: {style: 'thin'}
        };
        worksheet.getCell('R' + (i + 1)).border = {
            top: {style: 'thin'},
            left: {style: 'thin'},
            bottom: {style: 'thin'},
            right: {style: 'thin'}
        };
        worksheet.getCell('S' + (i + 1)).border = {
            top: {style: 'thin'},
            left: {style: 'thin'},
            bottom: {style: 'thin'},
            right: {style: 'thin'}
        };
        worksheet.getRow(i + 1).eachCell((cell) => {
            cell.font = {name: 'Calibri', family: 4, size: 12,};
        });
    });

    return worksheet
}

exports.export = {
    ExportToExcel,
    CPInventoryMain,
    CPInventoryDetail
}

