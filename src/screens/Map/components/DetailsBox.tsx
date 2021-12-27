import React, { useEffect, useState } from 'react';
import { Box, Button, FormControl, Input, Image, Text, ScrollView, Center, Heading } from 'native-base';
import { TouchableOpacity } from 'react-native';
import styles from '../MapStyle';
import LocMarker from '../../../interfaces/LocMarker';
import { GOOGLE_MAPS_API_KEY, TOMTOM_API_KEY } from '@env';
import { Linking } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';

type BoxProps = {
    clickedMarker: LocMarker | undefined,
    placeDetails: object | string,
    setPlaceDetails: React.Dispatch<React.SetStateAction<object | undefined>>
}

export default function DetailsBox(props: BoxProps) {
    const result = props.placeDetails.result;
    const [images, setImages] = useState<JSX.Element[]>();
    const [currentImg, setCurrentImg] = useState<JSX.Element>();

    useEffect(() => {
        let photoLimit = 2;
        let imgArr = [];
        try {
            for (let i = 0; i < photoLimit; i++) {
                if (!result.photos[i]) { console.log('no exist'); break; }
                imgArr?.push(
                    <Image
                        key={i}
                        style={{ borderRadius: 32 }}
                        alt="photo"
                        source={{ uri: `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photo_reference=${result.photos[i].photo_reference}&key=${GOOGLE_MAPS_API_KEY}` }}
                        size="2xl"
                        resizeMode='contain'
                    />
                );
            }
        } catch (error) {
            console.log('Photos do not exist ' + error);
            return;
        }
        setImages(imgArr);
        setCurrentImg(imgArr[0]);
    }, []);

    return (
        <Box style={styles.detailsBox}>
            <Button _pressed={{ bg: '#660000' }} bg={'#9d0000'} style={{ alignSelf: 'flex-end' }}
                onPress={() => props.setPlaceDetails(undefined)}><FontAwesome name="remove" size={16} color="#FFF" /></Button>
            <ScrollView>
                {props.placeDetails === 'ZERO_RESULTS' ? <Text>Apie šią vietą daugiau informacijos nėra</Text>
                    :
                    <Box>
                        < Center color={'#FFF'}>
                            <Heading style={{ marginBottom: 8, color: '#001a66', textAlign: 'center' }}>{result.name}</Heading>
                            {images &&
                                // <Text>{candidate.photos[0].photo_reference}</Text>
                                <Box style={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
                                    <TouchableOpacity style={{ paddingRight: 8 }}
                                        disabled={!images[images?.indexOf(currentImg) - 1] ? true : false}
                                        onPress={() => {
                                            setCurrentImg(images[images?.indexOf(currentImg) - 1]);
                                        }}><FontAwesome name="chevron-left" size={40} color={!images[images?.indexOf(currentImg) - 1] ? '#A3A3A3' : '#001a66'} />
                                    </TouchableOpacity>
                                    {currentImg}
                                    <TouchableOpacity style={{ paddingLeft: 8 }}
                                        disabled={!images[images?.indexOf(currentImg) + 1] ? true : false}
                                        onPress={() => {
                                            setCurrentImg(images[images?.indexOf(currentImg) + 1]);
                                        }}><FontAwesome name="chevron-right" size={40} color={!images[images?.indexOf(currentImg) + 1] ? '#A3A3A3' : '#001a66'} />
                                    </TouchableOpacity>
                                </Box>
                            }
                        </Center>
                        <Text></Text>
                        {result.opening_hours &&
                            <Box>
                                <Box style={styles.detailsHeading}>
                                    <Text style={{ fontSize: 24, lineHeight: 32, color: '#001a66' }} bold>Darbo laikas</Text>
                                    <FontAwesome name="clock-o" size={32} color={'#001a66'} />
                                </Box>
                                <Box style={{ paddingVertical: 8 }}>
                                    {result.opening_hours.open_now ?
                                        <Text style={{ fontSize: 20, lineHeight: 24, color: '#088800' }}>Šiuo metu atidaryta</Text>
                                        :
                                        <Text style={{ fontSize: 20, lineHeight: 24, color: '#9d0000' }}>Šiuo metu uždaryta</Text>
                                    }
                                    <Box>{result.opening_hours.weekday_text.map((day: string, index: number) => {
                                        return <Text
                                            style={{ textTransform: 'capitalize', paddingVertical: 2, color: '#001a66' }}
                                            key={index}>{day}</Text>
                                    })}</Box>
                                </Box>
                            </Box>
                        }
                        {result.rating &&
                            <Box>
                                <Box style={styles.detailsHeading}>
                                    <Text style={{ fontSize: 24, lineHeight: 32, color: '#001a66' }} bold>Įvertinimai</Text>
                                    <FontAwesome name="smile-o" size={32} color={'#001a66'} />
                                </Box>
                                <Box style={{ paddingVertical: 8 }}>
                                    <Text style={{ fontSize: 16, lineHeight: 24, color: '#001a66' }}><Text bold>Viso įvertinimų: </Text>{result.user_ratings_total}</Text>
                                    <Text style={{ fontSize: 16, lineHeight: 24, color: '#001a66' }}><Text bold>Vidutinis įvertinimas: </Text>{result.rating}/5</Text>
                                </Box>
                            </Box>}
                        {result.price_level && <Text><Text bold>Kainos dydis: </Text>{result.price_level}/4</Text>}
                        {(() => {
                            if (result.international_phone_number || result.url || result.website) {
                                return <Box>
                                    <Box style={styles.detailsHeading}>
                                        <Text style={{ fontSize: 24, lineHeight: 32, color: '#001a66' }} bold>Kontaktai</Text>
                                        <FontAwesome name="phone" size={32} color={'#001a66'} />
                                    </Box>
                                    <Box style={{ paddingVertical: 8 }}>
                                        {result.international_phone_number &&
                                            <Box
                                                style={{ fontSize: 16, lineHeight: 24, color: '#001a66', display: 'flex', flexDirection: 'row', alignSelf: 'flex-start' }}>
                                                <Text style={{ fontSize: 16, lineHeight: 24, color: '#001a66' }} bold>Telefono numeris: </Text>
                                                <Box style={{ display: 'flex', flexDirection: 'row', alignSelf: 'flex-end' }}>
                                                    <Text style={{ fontSize: 16, lineHeight: 24, color: '#001a66' }}>
                                                        {result.international_phone_number}</Text>
                                                    <Button style={{ marginLeft: 8 }}
                                                        _pressed={{ bg: '#000c30' }}
                                                        bg={'#001143'}
                                                        onPress={() => Linking.openURL(`tel:${result.international_phone_number}`)} size={"xs"}>
                                                        <FontAwesome name="phone" size={16} color={'#FFF'} />
                                                    </Button>
                                                </Box>
                                            </Box>
                                        }
                                        {result.url &&
                                            <Text style={{ fontSize: 16, lineHeight: 24, color: '#001a66' }}>
                                                <Text bold>Google Maps: </Text>
                                                <Text style={{ textDecorationLine: 'underline', color: '#666600' }}
                                                    onPress={() => Linking.openURL(result.url)}>
                                                    {result.url}
                                                </Text>
                                            </Text>}
                                        {result.website &&
                                            <Text style={{ fontSize: 16, lineHeight: 24, color: '#001a66' }}>
                                                <Text bold>Interneto puslapis: </Text>
                                                <Text style={{ textDecorationLine: 'underline', color: '#666600' }}
                                                    onPress={() => Linking.openURL(result.website)}>
                                                    {result.website}</Text>
                                            </Text>}
                                    </Box>
                                </Box>
                            }
                        })()}
                    </Box>
                }
            </ScrollView >
        </Box >
    );
}