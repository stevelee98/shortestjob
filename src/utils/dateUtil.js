import moment from 'moment';
import { Constants } from 'values/constants';
import StringUtil from 'utils/stringUtil';
import React from 'react'
import { localizes } from 'locales/i18n';

export default class DateUtil {

    static FORMAT_DATE = "DD/MM/YYYY"
    static FORMAT_DATE_SQL = "YYYY-MM-DD"
    static FORMAT_DATE_TIME_ZONE = "YYYY-MM-DD HH:mm:ss.SSSZZZ"
    static FORMAT_DATE_TIME_ZONE_T = "YYYY-MM-DDTHH:mm:ss.sssZ"
    static FORMAT_DATE_TIME_ZONE_A = "HH:mm DD/MM/YYYY"
    static FORMAT_TIME = "HH:mm"
    static FORMAT_TIME_SECOND = "HH:mm:ss"
    static FORMAT_TIME_SECONDS = "hh:mm:ss"
    static FORMAT_DATE_TIME = DateUtil.FORMAT_TIME + " " + DateUtil.FORMAT_DATE
    static FORMAT_DATE_TIMES = DateUtil.FORMAT_DATE_SQL + " " + DateUtil.FORMAT_TIME_SECONDS
    static FORMAT_DATE_TIME_SQL = DateUtil.FORMAT_DATE + " " + DateUtil.FORMAT_TIME_SECOND 
    static FORMAT_TIME_HOUR = "HH" //Format hour
    static FORMAT_TIME_MINUTE = "mm" //Format minute
    static FORMAT_MONTH_YEAR = "MM/YYYY" //Format month year
    static FORMAT_MONTH = "MM"
    static FORMAT_YEAR = "YYYY"
    static FORMAT_DAY = "DD"
    static FORMAT_DAYS = "dddd"
    static FORMAT_DATE_MONTH = "DD-MM"
    static FORMAT_MONTH_YEAR_T = "MM/YY"
    static FORMAT_TIME_CUSTOM = "HH:mm - HH:mm"
    static FORMAT_DATE_CUSTOM = DateUtil.FORMAT_TIME_CUSTOM + " " + DateUtil.FORMAT_DATE
    static FORMAT_DATE_TIME_EN = "YYYY/MM/DD HH:mm:ss"

    static now() {
        return new Date(Date.now())
    }
    
    /**
     * 
     * @param {*} year 
     * @param {*} month_number // month 1 - 12 ~ 0 - 11
     * @param {*} day // means: last day of the month
     */
    static weekCount(year, month_number, day) {
        const endDayOfMonth = moment(
            new Date(
                year,
                month_number,
                day))
            .clone()
            .startOf('month');
        const firstDayOfWeek = endDayOfMonth.clone().startOf('week');
        const offset = endDayOfMonth.diff(firstDayOfWeek, 'days');
        return Math.ceil((moment(new Date(year, month_number, day)).date() + offset) / 7)
    }

    /**
     * Parse now
     * @param {*} format 
     */
    static parseNow(format) {
        const date = new Date();
        const formattedDate = moment(date).format(format);
        return formattedDate
    }

    /**
     * Parse milliseconds to time (hh:mm:ss)
     * @param {*} milliseconds 
     */
    static parseMillisecondToTime(milliseconds) {
        if (milliseconds > 0) {
            const totalSeconds = Math.round(milliseconds / 1000);
            let seconds = parseInt(totalSeconds % 60, 10);
            let minutes = parseInt(totalSeconds / 60, 10) % 60;
            let hours = parseInt(totalSeconds / 3600, 10);
            seconds = seconds < 10 ? '0' + seconds : seconds;
            minutes = minutes < 10 ? '0' + minutes : minutes;
            hours = hours < 0 ? '' : (hours < 10 ? `0${hours}:` : `${hours}:`);
            // return `${hours}${minutes}:${seconds}`
            return `${minutes}:${seconds}`
        }
        return { hours: '00', minutes: '00', seconds: '00' }
    }

    /**
     * Get number date of year
     * @param {*} year 
     * @param {*} month 
     */
    static getNumberOfDays(year, month) {
        let days = 0
        switch (parseInt(month)) {
            case 1:
            case 3:
            case 5:
            case 7:
            case 8:
            case 10:
            case 12:
                days = 31
                break;
            case 4:
            case 6:
            case 9:
            case 11:
                days = 30
                break;
            default:
                days = parseInt(year) % 4 ? 29 : 28
                break;
        }
        return days
    }

    /**
     * Reverse format date
     * Ex: 2018/02/12 -> 12/02/2018
     * @param {*} date 
     * @param {*} inputFormat 
     * @param {*} outputFormat 
     */
    static reverseFormatDate(date, inputFormat = '/', outputFormat = '-') {
        return date.split(inputFormat).reverse().join(outputFormat)
    }

    /**
     * Compare date
     * @param {*} value1 
     * @param {*} value2 
     */
    static compareDate(value1, value2) {
        let data1 = new Date(value1)
        let data2 = new Date(value2)
        if (data1.getTime() > data2.getTime()){
            return -1;
        } else if (data1.getTime() == data2.getTime()) {
            return 0
        } else {
            return 1
        }
    }

    /**
     * Get from time to time with format
     * @param {*} toTime 
     * @param {*} format 
     */
    static getFromTimeAndToTime(fromTime, toTime) {
        let hour1 = moment(fromTime).format(DateUtil.FORMAT_TIME_HOUR)
        let minute1 = moment(fromTime).format(DateUtil.FORMAT_TIME_MINUTE)
        let hour2 = moment(toTime).format(DateUtil.FORMAT_TIME_HOUR)
        let minute2 = moment(toTime).format(DateUtil.FORMAT_TIME_MINUTE)
        return hour1 + "h" + minute1 + Constants.STR_BETWEEN + hour2 + "h" + minute2
    }

    /**
     * Convert format to form mat
     * @param {*} date 
     * @param {*} fromFormat 
     * @param {*} toFormat 
     */
    static convertFromFormatToFormat(date, fromFormat, toFormat) {
        if (StringUtil.isNullOrEmpty(date)) {
            return ""
        }
        return moment(date, fromFormat).format(toFormat);
    }

    /**
     * Get Date of week
     * @param {*} date 
     */
    static getDateOfWeek(date) {
        // var date = moment(date);
        // var weekDate = date.day();
        switch (date) {
            case 8:
                return "Sun"
            case 2:
                return "Mon"
            case 3:
                return "Tue"
            case 4:
                return "Wed"
            case 5:
                return "Thu"
            case 6:
                return "Fri"
            case 7:
                return "Sat"
            default:
                return ""
        }
    }

    /**
     * convert service contract
     * @param {*} contract 
     */
    static convertServiceContract(contract) {
        switch (contract) {
            case 1:
                return "Every month"
            default:
                return `Every ${contract} months`
        }
    }

    /*
     * get Timestamp
     * @param {*} date 
     */
    static getTimestamp(date) {
        var timestamp = null;
        if (date) {
            timestamp = new moment(date).format("X");
            // timestamp = d.getTime();
        } else {
            var d = new Date()
            timestamp = d.getTime();
        }
        return timestamp
    }

    /**
     * parseDate
     * @param {*} dateString 
     */
    static parseDate(dateString){
        var time = Date.parse(dateString);
        if(!time){
            time = Date.parse(dateString.replace("T"," "));
            if(!time){
                bound = dateString.indexOf('T');
                var dateData = dateString.slice(0, bound).split('-');
                var timeData = dateString.slice(bound+1, -1).split(':');
    
                time = Date.UTC(dateData[0],dateData[1]-1,dateData[2],timeData[0],timeData[1],timeData[2]);
            }
        }
        return time; // -> 1539068005000
    }

    /**
     * Sub Date to Seconds
     * @param {*} timestamp 
     */
    static subDateToSeconds(timestamp) {
        // var date1 = moment(Number(timestamp)).utcOffset('+0000').format("LLLL");
        // var timeStampNow = new Date().getTime()
        // var date2 = moment(timeStampNow).format("YYYY-MM-DD HH:mm:ss");
        var d1 = new Date(timestamp)
        var d2 = new Date()
        var seconds = (d1.getTime() - d2.getTime()) / 1000
        // var hour = seconds / 3600
        return seconds 
        // return date1 + d2  + "ok" + d1.getTime()  + d2.getTime()
    }
    
    /**
     * Compare date with format
     * @param {*} value1 
     * @param {*} value2 
     * @param {*} format 
     */
    static compareDateWithFormat(value1, value2, format) {
        var date1 = moment(value1).format(format);
        var date2 = moment(value2).format(format);
        if (date1 > date2) {
            return -1;
        } else if (date1 == date2) {
            return 0
        } else {
            return 1
        }
    }

    // PAID: 1,
    // UNPAID: 2,
    // ACTIVE: 3,
    // INACTIVE: 4,
    // COMPLETE: 5,
    // CANCELLED: 6
    /**
     * parsePaymentRecevide
     * @param {*} paymentRecevied 
     */
    static parsePaymentRecevied(paymentRecevied) {
        switch (paymentRecevied) {
            case 1:
                return "Paid"
            case 2:
                return "Unpaid"
            case 3:
                return "Active"
            case 4:
                return "Inactive"
            case 5:
                return "Complete"
            case 6:
                return "Cancelled"
            default:
                return "Unpaid"
        }
    }

    /**
     * sub string time
     * ex: 20:00 - 20:30 -> result: 20:00
     * @param {*} time 
     */
    static subStringTime(time) {
        var str = time.trim()
        return result = str.substring(0, 5);
    }

    /**
     * Get time ago notification
     * @param {*} time 
     */
    static timeAgo(time) {
        var currentDate = new Date();
        var currentDateTime = new Date(currentDate);
        let formatTime = DateUtil.convertFromFormatToFormat(time, DateUtil.FORMAT_DATE_TIME_ZONE, DateUtil.FORMAT_DATE_TIME_ZONE_T)
        var date = new Date(formatTime);
        var diff = (((currentDateTime.getTime() - date.getTime()) / 1000));
        var day_diff = Math.floor(diff / 86400);
        if (isNaN(day_diff) || day_diff < 0)
            return localizes('notificationView.just')
        return day_diff == 0 && (
            diff < 60 && localizes('notificationView.just') ||
            diff < 120 && localizes('notificationView.oneMinuteAgo') ||
            diff < 3600 && Math.floor(diff / 60) + localizes('notificationView.minAgo') ||
            diff < 7200 && localizes('notificationView.oneHoursAgo') ||
            diff < 86400 && Math.floor(diff / 3600) + localizes('notificationView.hoursAgo')) ||
            day_diff == 1 && localizes('notificationView.yesterday') ||
            day_diff < 7 && day_diff + localizes('notificationView.sometime') ||
            day_diff < 31 && Math.ceil(day_diff / 7) + localizes('notificationView.lastweek') ||
            day_diff > 31 && Math.ceil(day_diff / 30) + localizes('notificationView.lastmonth')
    }

    static getTimeStampNow(){
        var d = new Date()
        timestamp = d.getTime();
        return timestamp
    }
}

