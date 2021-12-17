import { StyleSheet, Dimensions } from 'react-native';

export default StyleSheet.create({
    map: {
        width: Dimensions.get('window').width,
        height: Dimensions.get('window').height - 255,
    },
    container: {
        flexDirection: 'column',
        alignSelf: 'flex-start',
    },
    bubble: {
        minWidth: 250,
        flexDirection: 'row',
        alignSelf: 'flex-start',
        backgroundColor: '#FFF',
        paddingHorizontal: 20,
        paddingVertical: 12,
        borderRadius: 6,
        borderColor: '#000',
        borderWidth: 0.5,
    },
    arrow: {
        backgroundColor: 'transparent',
        borderWidth: 16,
        borderColor: 'transparent',
        borderTopColor: '#000',
        alignSelf: 'center',
        marginTop: -32,
    },
    arrowBorder: {
        backgroundColor: 'transparent',
        borderWidth: 16,
        borderColor: 'transparent',
        borderTopColor: '#FFF',
        alignSelf: 'center',
        marginTop: -0.5,
    },
    marker: {
        width: 20,
        height: 22,
    },
    selectedMarker: {
        width: 36,
        height: 38,
    },
    arrowUp: {
        alignSelf: 'center',
        width: 0,
        height: 0,
        borderRightWidth: 8,
        borderRightColor: 'transparent',
        borderLeftWidth: 8,
        borderLeftColor: 'transparent',
        borderTopWidth: 8,
        borderTopColor: 'black'
    },
    buttonBubble: {
        flex: 1,
        alignSelf: 'center',
        width: '100%',
        backgroundColor: 'white',
        // paddingHorizontal: 18,
        paddingVertical: 12,
        position: 'absolute',
        bottom: '1%',
        borderTopColor: 'black',
        borderTopWidth: 2,
        padding: 10
    },
    filterBox: {
        position: 'absolute',
        flex: 1,
        top: 180,
        left: 10,
        zIndex: 2,
    },
    touchableDropdown: {
        width: 30,
        borderWidth: 2,
        borderColor: 'black',
        padding: 3,
        backgroundColor: 'rgba(200, 200, 200, 0.6)'
    },
    dropdown: {
        display: 'flex',
        flexDirection: 'column',
        zIndex: 1,
        backgroundColor: 'white',
        borderWidth: 2,
        borderColor: 'black'
    },
    filterRow: {
        padding: 5
    }
});