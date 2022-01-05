import { StyleSheet, Dimensions } from 'react-native';

export default StyleSheet.create({
    map: {
        // width: Dimensions.get('screen').width,
        // height: Dimensions.get('screen').height * 0.55
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
        borderTopColor: '#001a66'
    },
    buttonBubble: {
        // alignSelf: 'center',
        backgroundColor: '#FFF',
        width: '100%',
        // height: Dimensions.get('screen').height * 0.22,
        borderTopWidth: 4,
        borderTopColor: '#001a66',
        padding: Dimensions.get('screen').width * 0.02,
    },
    filterBox: {
        alignSelf: 'flex-end',
        // position: 'absolute',
        // flex: 1,
        // top: 15,
        // right: 15,
        zIndex: 2,
        paddingBottom: 8
    },
    mapsLinkBox: {
        alignSelf: 'flex-end',
        // position: 'absolute',
        // flex: 1,
        // top: 125,
        // right: 15,
        zIndex: 1,
        paddingBottom: 8
    },
    recBtn: {
        position: 'absolute',
        display: 'flex',
        bottom: Dimensions.get('screen').height * 0.245,
        alignSelf: 'center',
        zIndex: 1,
    },
    prefBtn: {
        alignSelf: 'flex-end',
        // position: 'absolute',
        // flex: 1,
        // right: 15,
        zIndex: 1,
    },
    detailsBox: {
        position: 'absolute',
        flex: 1,
        alignSelf: 'center',
        justifyContent: 'center',
        backgroundColor: 'white',
        // width: Dimensions.get('screen').width,
        // height: Dimensions.get('screen').height * 0.78,
        zIndex: 3,
        padding: 10,
    },
    detailsHeading: {
        textAlignVertical: 'center',
        borderBottomWidth: 4,
        borderTopWidth: 4,
        paddingVertical: 4,
        borderColor: '#001a66',
        display: 'flex', 
        flexDirection: 'row',
        justifyContent: 'space-between'
    },
    touchableDropdown: {
        borderWidth: 1,
        borderColor: 'black',
        borderRadius: 30,
        padding: 8,
        backgroundColor: 'rgba(255, 255, 255, 0.9)'
    },
    dropdown: {
        position: 'absolute',
        zIndex: 2,
        // right: 15,
        display: 'flex',
        flexDirection: 'column',
        height: Dimensions.get('screen').height * 0.5,
        alignSelf: 'flex-end',
        // marginVertical: 10,
    },
    filterRow: {
        padding: 6,
        marginVertical: 2,
        alignSelf: 'flex-end',
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        borderRadius: 10,
        borderWidth: 2,
        borderColor: '#001a66'
    },
    prefBox: {
        width: '100%',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        padding: 10,
    },
    radioGroup: {
        display: 'flex',
        flexDirection: 'row'
    },
    navButtons: {
        display: 'flex',
        flexDirection: 'column',
        paddingRight: 15,
        paddingTop: 15
    }
});