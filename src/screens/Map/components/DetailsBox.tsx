import React from 'react';
import { Box, Button, FormControl, Input, Image, Text, ScrollView, Center, Heading } from 'native-base';
import styles from '../MapStyle';
import LocMarker from '../../../interfaces/LocMarker';
import { GOOGLE_MAPS_API_KEY, TOMTOM_API_KEY } from '@env';
import { Linking } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';

type BoxProps = {
    clickedMarker: LocMarker | undefined,
    detailsJson: object | undefined,
    setPlaceDetails: React.Dispatch<React.SetStateAction<object | undefined>>
}

export default function DetailsBox(props: BoxProps) {

    const showHours = () => {
        let hours = [];
        const formatTime = (timeRanges: []) => {
            let resString = '';
            timeRanges.forEach(time => {
                let timeString = `${time.startTime.hour}:${time.startTime.minute}0 - ${time.endTime.hour}:${time.endTime.minute}0,  `;
                resString += timeString;
            });
            return resString;
        };
        for (let i = 0; i < props.detailsJson.result.popularHours.length; i++) {
            let day;
            let times;
            switch (props.detailsJson.result.popularHours[i].dayOfWeek) {
                case 1:
                    day = 'Pirmadienis: ';
                    times = formatTime(props.detailsJson.result.popularHours[i].timeRanges);
                    day += times;
                    break;
                case 2:
                    day = 'Antradienis: ';
                    times = formatTime(props.detailsJson.result.popularHours[i].timeRanges);
                    day += times;
                    break;
                case 3:
                    day = 'Trečiadienis: ';
                    times = formatTime(props.detailsJson.result.popularHours[i].timeRanges);
                    day += times;
                    break;
                case 4:
                    day = 'Ketvirtadienis: ';
                    times = formatTime(props.detailsJson.result.popularHours[i].timeRanges);
                    day += times;
                    break;
                case 5:
                    day = 'Penktadienis: ';
                    times = formatTime(props.detailsJson.result.popularHours[i].timeRanges);
                    day += times;
                    break;
                case 6:
                    day = 'Šeštadienis: ';
                    times = formatTime(props.detailsJson.result.popularHours[i].timeRanges);
                    day += times;
                    break;
                case 7:
                    day = 'Sekmadienis: ';
                    times = formatTime(props.detailsJson.result.popularHours[i].timeRanges);
                    day += times;
                    break;
            }
            hours.push(day);
        }
        return hours;
    }

    return (
        <Box style={styles.detailsBox}>
            <Button _pressed={{ bg: '#660000' }} bg={'#9d0000'} style={{ alignSelf: 'flex-end' }} 
            onPress={() => props.setPlaceDetails(undefined)}><FontAwesome name="remove" size={16} color="#FFF" /></Button>
            <ScrollView>
                <Center color={'#FFF'}>
                    <Heading>{props.clickedMarker?.title}</Heading>
                    {props.detailsJson.result.photos &&
                        <Image
                            alt="photo"
                            source={{ uri: `https://api.tomtom.com/search/2/poiPhoto?key=${TOMTOM_API_KEY}&id=${props.detailsJson.result.photos[0].id}` }}
                            size="2xl"
                            resizeMode='contain'
                        />}
                </Center>
                <Text></Text>
                {props.detailsJson.result.description && <Text><Text bold>Aprašymas: </Text>{props.detailsJson.result.description}</Text>}
                <Text></Text>
                {props.detailsJson.result.popularHours && <Box><Text bold>Darbo valandos: </Text>{
                    showHours().map((day, index) => {
                        return <Text key={index}>{day}</Text>
                    })

                }
                    <Text></Text>
                </Box>}
                {props.detailsJson.result.rating &&
                    <Box>
                        <Text><Text bold>Viso įvertinimų: </Text>{JSON.stringify(props.detailsJson.result.rating.totalRatings)}</Text>
                        <Text><Text bold>Vidutinis įvertinimas: </Text>{JSON.stringify(props.detailsJson.result.rating.value)}</Text>
                        <Text></Text>
                    </Box>}
                {props.detailsJson.result.socialMedia &&
                    <Box>{props.detailsJson.result.socialMedia.map((media, index) => {
                        return <Text key={index}>
                            <Text style={{ textTransform: 'capitalize' }} bold>{media.name}: </Text>
                            <Text style={{ textDecorationLine: 'underline', color: 'blue' }} onPress={() => Linking.openURL(media.url)}>{media.url}</Text>
                        </Text>
                    })}
                        <Text></Text>
                    </Box>
                }
                {props.detailsJson.result.priceRange && <Text><Text bold>Kainos dydis: </Text>{props.detailsJson.result.priceRange.value}/4</Text>}
                {/* {props.detailsJson.result.rating && <Text>rating: {JSON.stringify(props.detailsJson.rating)}</Text>}
            {props.detailsJson.result.reviews && <Text>reviews: {JSON.stringify(props.detailsJson.reviews[0])}</Text>} */}
            </ScrollView>
        </Box>
    );
}