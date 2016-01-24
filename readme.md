# Weather China

## 说明

Weather-China 是对中国天网接口的再次封装，将原接口返回的数据修改为给人看的。

接口内容包含国内全站2566个城市未来3常规预报以及三个气象指数（穿衣指数，舒适度指数，晨练指数）等天气服务数据。

需要申请 appid 以及 privateKey ，具体见[中国天气网](http://openweather.weather.com.cn/Home/Package/show/paid/80.html)。

## 安装

```npm install weather --save```

## 使用方法

```
// 引入接口
var WeatherChina = require('weather-china');

// 初始化
var weather = new WeatherChina.API('中国天气网的appid', '中国天气网的privateKey');
// 通过区域名查找areaid
var ids = weather.getAreaIDs('liuzhou');
var areaid = ids[0].id;

// 获取气象指数
weather.getIndex(areaid)
    .then(function (res) {
        console.log(res)
    });
// 获取天气信息
weather.getForecast(areaid)
    .then(function (res) {
        console.log(res)
    });
```

## 函数

#### getAreaIDs
* 参数：areaName
* 返回值：`[areaID]`
* 说明：根据区域名称（中文 / 拼音），返回**所有**符合条件的区域 ID

#### getIndex
* 参数：areaID
* 返回值：`[info: {name, level, description}]`
* 说明：获取气象指数数组，分别为晨练指数、穿衣指数、舒适度指数

#### getForecast
* 参数：areaID
* 返回值：
    * city：城市信息
    * updateTime：最后更新时间，格式为`yyyyMMddhhmmss`
    * `[forecast]`：天气信息
* 说明：获取天气信息及未来三天（包括今天）的天气预报。
> **注意**：如果是在当天18点之后获取的，forecast[0] 中的 `weatherBegein` 、
 `windForceBegin` 以及 `windDirectionBegin` 将为 `null`
