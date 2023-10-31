const http = require('http');
const fs = require('fs');
const url = require('url');
var requests = require("requests");


const homeFile = fs.readFileSync("./home.html", "utf-8");  //buffer data nhi chahiye toh write "utf-8"

const replaceVal = (tempVal, orgVal) => {
    let temperature = tempVal.replace("{%tempval%}", (orgVal.main.temp - 273.15).toFixed(2));
    temperature = temperature.replace("{%tempmin%}", (orgVal.main.temp_min - 273.15).toFixed(2));
    temperature = temperature.replace("{%tempmax%}", (orgVal.main.temp_max - 273.15).toFixed(2));
    temperature = temperature.replace("{%location%}", orgVal.name);
    temperature = temperature.replace("{%country%}", orgVal.sys.country);
    temperature = temperature.replace("{%tempstatus}", orgVal.weather[0].main);
    return temperature;
}
// events on streams
// data    end   error    finish
let city = "";
const server = http.createServer((req, res) => {
    const parsedUrl = url.parse(req.url, true);
    if(parsedUrl.pathname == "/myform" ){
        city = parsedUrl.query.mytext;
        console.log("input text: ", city);
        
        requests(`https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=71d5b2bf3b747a56cb5c34e7996c2a6c`)
        .on("data", (chunk) => {
            const objData = JSON.parse(chunk);
            const arrData = [objData];
            console.log("real time data:", arrData);
            if(!(arrData[0].message== 'city not found')){
            const realTimeData = arrData.map((val)=> replaceVal(homeFile, val)).join("");
            console.log(realTimeData);
            res.write(realTimeData);
            }
            else{
                res.write("You entered a city that doesn't exist!!! Please enter a correct city to check the weather!")
            }
        })
        .on("end", (err)=> {
            if(err) return console.log("connection closed due to error", err);

            res.end();
        })
        
    }
    if(req.url == "/"){
        requests("https://api.openweathermap.org/data/2.5/weather?q=Pune&appid=71d5b2bf3b747a56cb5c34e7996c2a6c")
        .on("data", (chunk) => {
            const objData = JSON.parse(chunk);
            const arrData = [objData];
            // console.log(arrData);
            // console.log("temp",arrData[0].main.temp);

            const realTimeData = arrData.map((val)=> replaceVal(homeFile, val)).join("");
            console.log(realTimeData);
            res.write(realTimeData);
        })
        .on("end", (err)=> {
            if(err) return console.log("connection closed due to error", err);

            res.end();
        });
    }
    
    
});

server.listen(10000, "0.0.0.0");
