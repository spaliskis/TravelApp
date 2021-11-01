import React from 'react';
import { Text, Box, Center, HStack, Pressable, Icon } from 'native-base';
import { useNavigation, useRoute } from '@react-navigation/native';
import { FontAwesome } from '@expo/vector-icons';
import { MaterialIcons } from '@expo/vector-icons';
import { FontAwesome5 } from '@expo/vector-icons';


export default function Footer() {
  const navigation = useNavigation();
  const route = useRoute();
  const selected = route.name;

  return (
    <Box>
      <HStack bg="info.900" alignItems="center">
        <Pressable
          opacity={selected === 'Welcome' ? 1 : 0.5}
          py="3"
          flex={1}
          onPress={async () => {
            navigation.navigate('Welcome');
          }}
        >
          <Center>
            <Icon
              mb="1"
              as={
                <FontAwesome name="search" size={24} color="black" />
              }
              color="white"
              size="sm"
            />
            <Text color="white" fontSize="12">
              Paieška
            </Text>
          </Center>
        </Pressable>
        <Pressable
          opacity={selected === 'MyRoutes' ? 1 : 0.5}
          py="2"
          flex={1}
          onPress={async () => {
            navigation.navigate('MyRoutes');
          }}
        >
          <Center>
            <Icon
              mb="1"
              as={<FontAwesome5 name="route" size={24} />}
              color="white"
              size="sm"
            />
            <Text color="white" fontSize="12">
              Maršrutai
            </Text>
          </Center>
        </Pressable>
        <Pressable
          opacity={selected === 'Map' ? 1 : 0.5}
          py="2"
          flex={1}
          onPress={async () => {
            navigation.navigate('Map');
          }}
        >
          <Center>
            <Icon
              mb={1}
              as={<FontAwesome name="map" size={24} />}
              color="white"
              size="sm"
            />
            <Text color="white" fontSize={12}>
              Žemėlapis
            </Text>
          </Center>
        </Pressable>
        <Pressable
          opacity={selected === 'Account' ? 1 : 0.5}
          py="2"
          flex={1}
          onPress={async () => {
            navigation.navigate('Account');
          }}
        >
          <Center>
            <Icon
              mb={1}
              as={<MaterialIcons name="account-circle" size={24} />}
              color="white"
              size="sm"
            />
            <Text color="white" fontSize="12">
              Paskyra
            </Text>
          </Center>
        </Pressable>
      </HStack>
    </Box>
  );
}



