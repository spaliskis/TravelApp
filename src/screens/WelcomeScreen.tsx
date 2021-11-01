import React from 'react';
import { ScrollView } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import { Text, Box, Button, Heading, Center, Container, VStack, Image, AspectRatio, HStack } from 'native-base';
import { RootStackParamList } from '../types';
import Card from '../components/Card';
import Footer from '../components/Footer';
type Props = NativeStackScreenProps<RootStackParamList, 'Welcome'>;

export default function WelcomeScreen({ navigation }: Props) {

  return (
    <Box flex={1} pt="7">
      <ScrollView>
        <Center>
          <Container m="4">
            <StatusBar style="auto"></StatusBar>
            <Heading py="3">Sveiki atvykę</Heading>
            <VStack space={3}>
              <Card
                title="Lankomos vietos netoliese"
                description="Raskite, paskaitykite aprašymą ir nukeliaukite į populiariausias ir geriausiai įvertintas vietas esančias netoli jūsų."
                imageUrl="https://kaimoturizmosodyba.eu/wp-content/uploads/2021/04/Merkines-apzvalgos-bokstas-1.jpg"
                onPress={() =>
                  navigation.navigate('NearbyPlaces')
                }
              />
              <Card
                title="Žemėlapis"
                description="Tyrinėkite žemėlapį, kuriame galite matyti jus dominančias lankytinas vietas. Įveskite savo kelionės maršrutą ir automatiškai gausite vietų, kurias pakeliui galite aplankyti, sąrašą"
                imageUrl="https://www.briedis.lt/out/pictures/z1/lietuva_lipdukas_160x130_z1.png"
                onPress={() =>
                  navigation.navigate('Map')
                }
              />
              <Card title="Išsaugotos vietos"
                description="Vietos, palikusios jums įspūdį."
                imageUrl="https://www.artnews.com/wp-content/uploads/2021/03/AdobeStock_263911828.jpeg"
                onPress={() =>
                  navigation.navigate('MyRoutes')
                }
              />
            </VStack>
          </Container>
        </Center>
      </ScrollView>
      <Footer />
    </Box>

  );
}
