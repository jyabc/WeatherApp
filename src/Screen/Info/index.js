import React, { Component } from 'react';
import { Text, View } from 'react-native';

export default class Info extends Component {

    constructor(props) {
        super(props);

        const { params } = this.props.route.params;

        this.state = {
            info: params
        };
    }


    render() {
        const { info } = this.state;
        return (
            <>
                <CustomHeader text={info.date} backBtn navigation={this.props.navigation} />

                <View style={{ alignItems: 'center', paddingTop: 20 }}>
                    <Text style={{ fontSize: 20 }}>Weather forecast</Text>
                    <Text style={{ fontFamily: "VINCHAND", fontSize: 50 }}>{info.temp}</Text>
                    <Text style={{ fontFamily: "VINCHAND", fontSize: 60 }}>{info.weather}</Text>
                </View>
            </>
        );
    }
}