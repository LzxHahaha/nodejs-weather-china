/**
 * Created by LzxHahaha on 2016/1/24.
 */

'use strict';

var fetch = require('node-fetch');
var crypto = require('crypto/sha1');
var areaID = require('./data/areaID').areaID;
var wind = require('./data/wind');
var weather = require('./data/weather').weather;

const errorResult = 'data error';

const queryType = {
    index: 'index_v',
    forecast: 'forecast_v'
};

function formatNumber(number) {
    return number < 10 ? ('0' + number) : '' + number;
}

function formatDatetime(datetime) {
    var year = datetime.getFullYear();
    var month = formatNumber(datetime.getMonth() + 1);
    var day = formatNumber(datetime.getDate());
    var hour = formatNumber(datetime.getHours());
    var minute = formatNumber(datetime.getMinutes());

    return '' + year + month + day + hour + minute;
}

exports.API = (function () {
    function API(appid, privateKey) {
        this.appid = appid;
        this.privateKey = privateKey;
    }

    API.prototype.getAreaIDs = function (areaName) {
        var result = [];
        var name = areaName.toLowerCase();
        for (var i = 0; i < areaID.length; ++i) {
            if (areaID[i].nameEN.indexOf(name) > -1
                || areaID[i].nameCN.indexOf(name) > -1) {
                result.push(areaID[i]);
            }
        }

        return result;
    };

    API.prototype.getURL = function (areaID, type, datetime) {
        var dateFormat = formatDatetime(datetime);
        var keyAppid = this.appid.substring(0, 6);
        var publicKey = 'http://open.weather.com.cn/data/?areaid=' + areaID + '&type=' + type +
            '&date=' + dateFormat + '&appid=' + this.appid;
        var hash = crypto.b64_hmac_sha1(this.privateKey, publicKey);
        var key = encodeURIComponent(hash + '=');

        return 'http://open.weather.com.cn/data/?areaid=' + areaID + '&type=' + type +
            '&date=' + dateFormat + '&appid=' + keyAppid + '&key=' + key;
    };

    API.prototype.getIndex = function (areaID) {
        var url = this.getURL(areaID, queryType.index, new Date());

        return fetch(url)
            .then(function (res) {
                return res.text();
            })
            .then(function (text) {
                if (text === errorResult) {
                    return new Error(text);
                }

                var shitObj = JSON.parse(text);
                var index = [];
                for (var i = 0; i < shitObj.i.length; ++i) {
                    var shit = shitObj.i[i];
                    index.push({
                        name: shit.i2,
                        level: shit.i4,
                        description: shit.i5
                    });
                }
                return index;
            })
            .catch(function (err) {
                console.warn("Error in function [getIndex]: " + err);
                return err;
            });
    };

    API.prototype.getForecast = function (areaID) {
        var url = this.getURL(areaID, queryType.forecast, new Date());

        return fetch(url)
            .then(function (res) {
                return res.text();
            })
            .then(function (text) {
                if (text === errorResult) {
                    return new Error(text);
                }

                var shitObj = JSON.parse(text);
                var info = {
                    city: {
                        nameEN: shitObj.c.c2,
                        name: shitObj.c.c3,
                        cityLevel: shitObj.c.c10,
                        phoneAreaCode: shitObj.c.c11,
                        zipCode: shitObj.c.c12,
                        longitude: shitObj.c.c13,
                        latitude: shitObj.c.c14,
                        altitude: shitObj.c.c15,
                        timeZone: shitObj.c.c17
                    },
                    updateTime: shitObj.f.f0,
                    forecast: []
                };

                for (var i = 0; i < shitObj.f.f1.length; ++i) {
                    var shit = shitObj.f.f1[i];
                    var sun = shit.fi.split('|');
                    info.forecast.push({
                        weatherBegin: shit.fa ? weather[0 | shit.fa] : null,
                        weatherEnd: weather[0 | shit.fb],
                        maxTemperature: shit.fc ? (0 | shit.fc) : null,
                        minTemperature: 0 | shit.fd,
                        windDirectionBegin: shit.fe ? wind.windDirection[0 | shit.fe] : null,
                        windDirectionEnd: wind.windDirection[0 | shit.ff],
                        windForceBegin: shit.fg ? wind.windForce[0 | shit.fg] : null,
                        windForceEnd: wind.windForce[0 | shit.fh],
                        sunriseTime: sun[0],
                        sunsetTime: sun[1]
                    });
                }

                return info;
            })
            .catch(function (err) {
                console.warn("Error in function [getForecast]: " + err);
                return err;
            })
    };

    return API;
})();
