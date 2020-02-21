import React, { Component } from 'react';
import { SafeAreaView, View, Text, Alert } from 'react-native';
import moment from 'moment';
import 'moment-timezone';
import { ScrollView } from 'react-native-gesture-handler';
import NetInfo from "@react-native-community/netinfo";
import API from 'Utils/API.js';
import CustomHeader from 'Component/Header';
import ListItem from 'Component/ListItem';
import Database from 'Utils/Database.js';
import Conversion from 'Utils/Conversion.js';
import styles from './styles';

const config = {
    country: 'Singapore',
    timezone: 'Asia/Singapore',
    timezoneAbbr: ' SGT' //moment - Asia/Singapore had its SGT abbreviation dropped in tzdb 2017a, so I hardcode it
};

const db = new Database();

export default class Home extends Component {
    constructor(props) {
        super(props);

        this.state = {
            time: moment().tz(config.timezone).format('ddd, DD MMM YYYY h:mm A'),
            temp: '',
            weather: '',
            forecastList: [],
        };
    }

    componentDidMount() {
        moment.tz.setDefault(config.timezone);

        this.timeInterval = setInterval(() => {
            this.setState({
                time: moment().tz(config.timezone).format('ddd, DD MMM YYYY h:mm A'),
            });
        }, 1000);

        this.checkNetworkConnection();

        // for testing
        // this.loadWeatherDatafromDB();
        // this.loadForecastWeatherDatafromDB();
    }

    componentWillUnmount() {
        clearInterval(this.timeInterval);
      }

    checkNetworkConnection = () => {
        NetInfo.fetch().then(state => {
            if (!state.isConnected) {
                this.loadWeatherDatafromDB();
                this.loadForecastWeatherDatafromDB();
            } else {
                this.loadWeatherData();
                this.loadForecastWeatherData();
            }
        });
    }

    loadWeatherData = async () => {
        const url = API.getAPIUrl(API.weatherAPI, config.country);
        try {
            let response = await fetch(
                url,
            );
            let responseJson = await response.json();

            if (responseJson.cod == 200) {
                this.setState({
                    temp: Conversion.kelvinToFahrenheit(responseJson.main.temp), //returned result in kelvin
                    weather: responseJson.weather[0].main,
                });
            } else {
                this.loadWeatherDatafromDB(); //load from db if cod not 200
            }
        } catch (error) {
            this.loadWeatherDatafromDB(); //load from db if error occured
            console.error(error);
            Alert.alert('call weather api error');
        }
    }

    loadWeatherDatafromDB = () => {
        const id = moment().format('YYYYMMDD');

        db.selectWeather(id).then((data) => {
            data != [] && this.setState({
                temp: data.temp,
                weather: data.weather,
            });
        }).catch((err) => {
            console.log(err);
        });
    }

    loadForecastWeatherDatafromDB = () => {
        let forecastList = [];
        db.listWeather().then((data) => {
            forecastList = data;

            forecastList.length > 0 && this.setState({
                forecastList,
            });
        }).catch((err) => {
            console.log(err);
        });
    }

    loadForecastWeatherData = async () => {
        const url = API.getAPIUrl(API.forecastAPI, config.country);
        try {
            let response = await fetch(url);
            let responseJson = await response.json();

            if (responseJson.cod == 200) {
                const forecastList = responseJson.list;

                let forecastArray = [];
                forecastList.forEach((value) => {
                    const date = value.dt * 1000;
                    forecastArray.push({
                        "id": moment(date).format('YYYYMMDD'),
                        "date": moment(date).format('DD MMM YYYY, ddd'),
                        "temp": Conversion.kelvinToFahrenheit(value.main.temp),
                        "weather": value.weather[0].main,
                        "min": Conversion.kelvinToFahrenheit(value.main.temp_min),
                        "max": Conversion.kelvinToFahrenheit(value.main.temp_max),
                    });
                });

                const result = forecastArray.reduce((unique, o) => {
                    if (!unique.some(obj => obj.date === o.date)) {
                        unique.push(o);
                        db.addWeather(o);  // add weather to db
                    }
                    return unique;
                }, []); // just get first record of each date

                this.setState({
                    forecastList: result
                });
            } else {
                this.loadForecastWeatherDatafromDB(); //load from db if cod not 200
            }

        } catch (error) {
            this.loadForecastWeatherDatafromDB(); //load from db if error occured

            console.log(error);
            Alert.alert('call forecast api error');
        }
    }
    displayInfo = (info) => {
        this.props.navigation.navigate('Info', { params: info });
    };

    render() {
        const { time, temp, weather, forecastList } = this.state;
        return (
            <SafeAreaView style={{ flex: 1 }}>
                <CustomHeader text={'Singapore, Singapore'} />

                <View style={styles.mainContainer}>
                    <Text style={[styles.mainText, { fontWeight: 'bold', fontSize: 20 }]}>{time + config.timezoneAbbr}</Text>
                    <Text style={[styles.mainText, { fontSize: 55 }]}>{temp}</Text>
                    <Text style={[styles.subText, { fontSize: 26 }]}>{weather}</Text>
                </View>
                <ScrollView>
                    { //slice to get first 5 weather
                        forecastList.length > 0 && forecastList.slice(0, 5).map((l, i) => (
                            <ListItem
                                key={i}
                                date={l.date}
                                min={l.min}
                                max={l.max}
                                weather={l.weather}
                                onPress={() => this.displayInfo(l)}
                            />
                        ))
                    }
                </ScrollView>
            </SafeAreaView>
        );
    }
};