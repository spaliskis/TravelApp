import React, { useState, useRef } from 'react';
import { ScrollView, Dimensions, Image, View, StyleSheet } from 'react-native';
import { Text, Box, Flex, Button, Heading } from 'native-base';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import { RootStackParamList } from '../types';
import Footer from '../components/Footer';
import Carousel from 'react-native-snap-carousel';

const { width } = Dimensions.get('window');
const height = width * 0.6;

type Props = NativeStackScreenProps<RootStackParamList, 'Details'>;

const images = [
    'https://www.govilnius.lt/images/5ea6aeeb4a97c4372591f47e?w=750&h=500&fit=contain',
    'https://www.govilnius.lt/images/5ea6abd3576a6103d5102add?w=750&h=500&fit=contain',
    'https://www.govilnius.lt/images/5ea6aef6576a61da7e102b3b?w=750&h=500&fit=contain',
    'https://www.govilnius.lt/images/6110de38d90fcbe83489d925?w=750&h=500&fit=contain',
];

export default function DetailsScreen({ navigation }: Props) {
    const carouselRef = useRef(null);

    const _renderItem = ({ item, index }) => {
        return (
            <View key={index}>
                <Image
                    source={{ uri: item }}
                    style={styles.image}
                />
            </View>
        );
    }

    return (
        <Box flex={1} pt={10}>
            <ScrollView>
                <Carousel
                    layout="tinder"
                    ref={carouselRef}
                    layoutCardOffset={9}
                    data={images}
                    renderItem={_renderItem}
                    sliderWidth={width}
                    itemWidth={width}
                    inactiveSlideShift={0}
                    useScrollView={true}
                />
                <Heading p={3}>Gedimino pilis</Heading>
                <Heading p={3} size="md">Apie</Heading>
                <Heading p={3} size="md">Lankymo informacija</Heading>
                <Heading p={3} size="md">Vieta</Heading>
            </ScrollView>
            <Box>
                <Footer />
            </Box>

        </Box>
    );
}

const styles = StyleSheet.create({
    container: {
        width,
        height,
        alignSelf: 'center'
    },
    image: {
        width: width,
        height: height,
    },
});
