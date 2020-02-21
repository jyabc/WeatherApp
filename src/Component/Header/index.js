import React from 'react';
import { Header } from 'react-native-elements';
import Colors from 'Utils/Colors.js';
import { View } from 'react-native';

export default CustomHeader = (props) => {
    const backBtn = props.backBtn && {
        leftComponent: {icon: 'chevron-left', color: '#fff', size:30 ,onPress: ()=> props.navigation.goBack() }
    };

    return (
        <View>
            <Header
                {...backBtn}
                statusBarProps={{ translucent: true }}
                centerComponent={{ text: props.text, style: { color: Colors.white, fontSize: 16 } }}
                containerStyle={{
                    backgroundColor: Colors.red,
                }} />
        </View>
    );

};