import { StyleSheet, Dimensions } from 'react-native';

export default StyleSheet.create({
    map: {
        width: Dimensions.get('window').width,
        height: Dimensions.get('window').height * 0.55
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
        alignSelf: 'center',
        width: '100%',
        height: Dimensions.get('window').height * 0.2,
        borderTopWidth: 4,
        borderTopColor: '#001a66',
        padding: 10
    },
    filterBox: {
        position: 'absolute',
        flex: 1,
        top: Dimensions.get('window').height * 0.27,
        right: 20,
        zIndex: 2,
    },
    mapsLinkBox: {
        position: 'absolute',
        flex: 1,
        top: Dimensions.get('window').height * 0.27,
        left: 20,
        zIndex: 2,
    },
    recBtn: {
        position: 'absolute',
        display: 'flex',
        bottom: Dimensions.get('window').height * 0.225,
        alignSelf: 'center',
        zIndex: 2,
    },
    detailsBox: {
        position: 'absolute',
        borderBottomWidth: 2,
        flex: 1,
        alignSelf: 'center',
        justifyContent: 'center',
        backgroundColor: 'white',
        width: '100%',
        height: '81%',
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
    },
    prefBox: {
        width: '100%',
        height: '100%',
        textAlign: 'center',
        alignSelf: 'center',
        justifyContent: 'center'
    },
    radioGroup: {
        display: 'flex',
        flexDirection: 'row'
    },
});