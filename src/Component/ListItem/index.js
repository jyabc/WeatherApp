import React from 'react';
import Colors from 'Utils/Colors.js';
import { View, Platform, StyleSheet, Text } from 'react-native';
import { Icon } from 'react-native-elements';
import { TouchableOpacity } from 'react-native-gesture-handler';

const chevronDefaultProps = {
    type: Platform.OS === 'ios' ? 'ionicon' : 'material',
    color: Colors.red,
    name: Platform.OS === 'ios' ? 'ios-arrow-forward' : 'chevron-right',
    size: 30,
};

export default ListItem = (props) => {
    return (
        <TouchableOpacity onPress={props.onPress}>
            <View style={styles.container}>
                <View style={styles.leftContainer}>
                    <Text style={styles.dateText}>{props.date}</Text>
                    <Text>{props.min + ' - ' + props.max}</Text>
                    <Text style={styles.subText}>{props.weather}</Text>
                </View>
                <View style={styles.rightContainer}>
                    <Icon {...chevronDefaultProps} />
                </View>
            </View>
        </TouchableOpacity>
    );
}

const styles = {
    container: {
        paddingHorizontal: 20,
        paddingTop: 10,
        borderBottomColor: Colors.subText,
        borderBottomWidth: StyleSheet.hairlineWidth,
        flexDirection: 'row'
    },
    leftContainer: {
        flex: 0.8,
        paddingBottom: 25,
    },
    rightContainer: {
        flex: 0.2,
        justifyContent: 'center',
        alignItems: 'flex-end',
    },
    dateText: {
        fontWeight: 'bold',
        fontSize: 16
    },
    subText: {
        color: Colors.subText,
    },
};
