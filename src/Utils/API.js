const domain = 'https://api.openweathermap.org/data/2.5/';

const apiKey = '552f8e006a0e99e8087123ad7bdef2d2';

const weatherAPI = domain + 'weather';
const forecastAPI = domain + 'forecast'; 
// theres no free daily weather forecast api, so I implemented with 
// 5 day/3 hour forecast data api - https://openweathermap.org/forecast5
// https://openweathermap.org/forecast16 << this one need to pay

getAPIUrl = (apiName, param) =>{

    return apiName + '?q=' + param + '&appid=' + apiKey;
}
export default { weatherAPI, forecastAPI, getAPIUrl };