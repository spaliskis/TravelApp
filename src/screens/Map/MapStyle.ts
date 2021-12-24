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
        top: Dimensions.get('window').height * 0.03,
        right: 20,
        zIndex: 2,
    },
    mapsLinkBox: {
        position: 'absolute',
        flex: 1,
        top: Dimensions.get('window').height * 0.38,
        right: 20,
        zIndex: 1,
    },
    recBtn: {
        position: 'absolute',
        display: 'flex',
        bottom: Dimensions.get('window').height * 0.225,
        alignSelf: 'center',
        zIndex: 2,
    },
    prefBtn: {
        position: 'absolute',
        flex: 1,
        top: Dimensions.get('window').height * 0.31,
        right: 20,
        zIndex: 2,
    },
    detailsBox: {
        position: 'absolute',
        flex: 1,
        alignSelf: 'center',
        justifyContent: 'center',
        backgroundColor: 'white',
        width: Dimensions.get('window').width,
        height: Dimensions.get('window').height * 0.76,
        zIndex: 2,
        padding: 10,
    },
    touchableDropdown: {
        borderWidth: 1,
        borderColor: 'black',
        borderRadius: 30,
        padding: 8,
        backgroundColor: 'rgba(255, 255, 255, 0.8)'
    },
    dropdown: {
        position: 'absolute',
        zIndex: 2,
        right: 20,
        display: 'flex',
        flexDirection: 'column',
        height: Dimensions.get('window').height * 0.5,
        alignSelf: 'flex-end',
        marginVertical: 10,
    },
    filterRow: {
        padding: 6,
        marginVertical: 2,
        alignSelf: 'flex-end',
        backgroundColor: 'rgba(255, 255, 255, 0.8)',
        borderRadius: 10,
        borderWidth: 2,
        borderColor: '#001a66'
    },
    prefBox: {
        width: '100%',
        height: '100%',
        display: 'flex',
        alignItems: 'center'
    },
    radioGroup: {
        display: 'flex',
        flexDirection: 'row'
    },
});