import React from 'react';
import { Text, Box, Button, Heading, Stack, Image, AspectRatio } from 'native-base';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

type CardProps = {
    title: string,
    description: string,
    imageUrl: string,
    onPress: () => void,
}

export default function Card(props: CardProps) {

    return (
        <Box
            rounded="lg"
            width="72"
            shadow={1}
            backgroundColor="gray.50"
        >
            <Box>
                <AspectRatio ratio={16 / 9}>
                    <Image
                        source={{
                            uri:
                                props.imageUrl,
                        }}
                        alt="image"
                    />
                </AspectRatio>
                {/* <Center
                    bg="violet.500"
                    _text={{ color: 'white', fontWeight: '700', fontSize: 'xs' }}
                    position="absolute"
                    bottom={0}
                    px="3"
                    py="1.5"
                >
                    PHOTOS
                </Center> */}
            </Box>
            <Stack p="4" space={3}>
                <Stack space={2}>
                    <Heading size="md" ml="-1">
                        {props.title}
                    </Heading>
                </Stack>
                <Text>
                    {props.description}
                </Text>
                <Button onPress={props.onPress}>Atidaryti</Button>
            </Stack>
        </Box>
    );
}
