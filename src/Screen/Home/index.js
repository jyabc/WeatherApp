import React, { Component } from 'react';
import { SafeAreaView, View, Text, Alert } from 'react-native';
import CustomHeader from 'Component/Header';
import moment from 'moment';
import 'moment-timezone';
import API from 'Utils/API.js';
import styles from './styles';
import { ScrollView } from 'react-native-gesture-handler';
import ListItem from 'Component/ListItem';

const config = {
    country: 'Singapore',
    timezone: 'Asia/Singapore',
    timezoneAbbr: 'SGT' //moment - Asia/Singapore had its SGT abbreviation dropped in tzdb 2017a, so I hardcode it
};

export default class Home extends Component {
    constructor(props) {
        super(props);

        this.state = {
            time: '',
            temp: '',
            weather: '',
            forecastList: [],
        };
    }

    componentDidMount() {
        moment.tz.setDefault(config.timezone);

        this.setState({
            time: moment().tz(config.timezone).format('ddd, DD MMM YYYY h:mm A '),
        });

        this.loadWeatherData();
        this.loadForecastWeatherData();
    }

    kelvinToFahrenheit = (kelvin) => {
        const celsius = kelvin - 273;
        return Math.floor(celsius * (9 / 5) + 32);
    }

    loadWeatherData = async () => {
        const url = API.getAPIUrl(API.weatherAPI, config.country);
        try {
            let response = await fetch(
                url,
            );
            let responseJson = await response.json();

            this.setState({
                temp: this.kelvinToFahrenheit(responseJson.main.temp), //returned result in kelvin
                weather: responseJson.weather[0].main,
            });
        } catch (error) {
            console.error(error);
            Alert.alert('call weather api error');
        }
    }

    loadForecastWeatherData = async () => {
        const url = API.getAPIUrl(API.forecastAPI, config.country);
        try {
            let response = await fetch(url);
            let responseJson = await response.json();

            const forecastList = responseJson.list;

            let forecastArray = [];
            forecastList.forEach((value) => {
                forecastArray.push({
                    "date": moment(value.dt * 1000).format('DD MMM YYYY, ddd'),
                    "temp": this.kelvinToFahrenheit(value.main.temp),
                    "weather": value.weather[0].main,
                    "min": this.kelvinToFahrenheit(value.main.temp_min),
                    "max": this.kelvinToFahrenheit(value.main.temp_max),
                });
            });

            const result = forecastArray.reduce((unique, o) => {
                if (!unique.some(obj => obj.date === o.date)) {
                    unique.push(o);
                }
                return unique;
            }, []); // just get first record of each date

            this.setState({
                forecastList: result
            });

            // console.log(result);
        } catch (error) {
            console.error(error);
            Alert.alert('call forecast api error');
        }
    }
    displayInfo = (info) => {
        this.props.navigation.push('Info', { params: info });
    };

    render() {
        const { time, temp, weather, forecastList } = this.state;
        return (
            <SafeAreaView style={{ flex: 1 }}>
                <CustomHeader text={'Singapore, Singapore'} />

                <View style={{ alignItems: 'center', paddingTop: 20, paddingBottom: 35 }}>
                    <Text style={[styles.mainText, { fontWeight: 'bold', fontSize: 20 }]}>{time + config.timezoneAbbr}</Text>
                    <Text style={[styles.mainText, { fontSize: 55 }]}>{temp}</Text>
                    <Text style={[styles.subText, { fontSize: 26 }]}>{weather}</Text>
                </View>
                <ScrollView>
                    {
                        forecastList.length > 0 && forecastList.map((l, i) => (
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