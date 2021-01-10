const axios = require('axios');
const cheerio = require('cheerio');
const XLSX = require('xlsx');

// let url = "http://auto.danawa.com/auto/?Work=record&Tab=&Brand=303,304&Month=2020-11-00&MonthTo=";


// global variable for excel output
var ws_data = [];

// main execution
for (i = 1; i < 13; i++) {
    let month = '';
    if (i < 10) {
        month = '2020-0' + i;
    } else {
        month = '2020-' + i;
    }

    let url = 'http://auto.danawa.com/auto/?Work=record&Tab=Model&Brand=303,304,307&Month=' + month + '-00';
    
    axios.get(url)
        .then(html => {
            const $ = cheerio.load(html.data);

            var nameArr = [];
            $('table.recordTable')
                .find('tbody tr')
                .find('td.title')
                .find('a')
                .each((i, el) => {
                    nameArr.push(
                        $(el).text()
                            .replace(/\n/g, '')
                            .replace(/ /g, '')
                    );
                });

            var numberArr = [];
            $('table.recordTable')
                .find('tbody tr')
                .find('td.num')
                .find('button')
                .empty()
                .parent()
                .each((i, el) => {
                    numberArr.push(
                        $(el).text()
                            .replace(/\n/g, '')
                            .replace(/,/g, '')
                    );
                });

            console.log(nameArr);
            console.log("nameArr length : " + nameArr.length);
            console.log(numberArr);
            console.log("numberArr length : " + numberArr.length);

            var car_result = {};
            car_result.nameArr = nameArr;
            car_result.numberArr = numberArr;
            return car_result;
        })
        .then(res => {
            for (var i = 0; i < res.nameArr.length; i++) {
                var imsiArr = [];
                imsiArr.push(res.nameArr[i]);
                imsiArr.push(res.numberArr[i]);
                imsiArr.push(month);
                ws_data.push(imsiArr);
            }

            // save to excel file
            var wb = XLSX.utils.book_new();
            wb.SheetNames.push("CarSales");
            var ws = XLSX.utils.aoa_to_sheet(ws_data);
            wb.Sheets["CarSales"] = ws;
            XLSX.writeFile(wb, 'car_sales.xlsx');

        })
        .catch(error => console.error(error));
}

console.log("End of Main Program");
