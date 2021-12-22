import React, { useState } from 'react';
import { Box, Button, FormControl, Input } from 'native-base';
import { FontAwesome } from '@expo/vector-icons';

type FormProps = {
    setArrival: (arrival: string) => void,
    setDeparture: (departure: string) => void,
    createRoute: () => Promise<void>,
    isLoading: boolean,
    setIsLoading: React.Dispatch<React.SetStateAction<boolean>>
}

export default function PlacesForm(props: FormProps) {

    return (
        <FormControl isRequired>
            <Box display={'flex'} flexDirection={'row'} justifyContent={'space-around'}>
                <Box display={'flex'} flexDirection={'column'}>
                    <FormControl.Label justifyContent={'center'} color={'#001a66'} mr={0}>Išvykimo vieta</FormControl.Label>
                    <Input
                        isDisabled={props.isLoading}
                        _focus={{ borderColor: '#b7b700' }}
                        variant={'rounded'}
                        size="lg"
                        placeholder="Išvykimo vieta"
                        onChangeText={(text: string) => props.setDeparture(text)}
                        borderColor={'#474700'} width={120}
                    />
                </Box>
                <Button
                    _pressed={{ bg: '#474700' }}
                    leftIcon={<FontAwesome name="search" size={16} color="#FFF" />}
                    size={'lg'} bg={'#666600'} alignSelf={'flex-end'}
                    isLoading={props.isLoading}
                    onPress={async() => { props.setIsLoading(true); await props.createRoute(); props.setIsLoading(false);}}>
                    Ieškoti</Button>
                <Box style={{ display: 'flex', flexDirection: 'column' }}>
                    <FormControl.Label color={'#001a66'} justifyContent={'center'} mr={0}>Atvykimo vieta</FormControl.Label>
                    <Input
                        isDisabled={props.isLoading}
                        _focus={{ borderColor: '#b7b700' }}
                        variant={'rounded'}
                        size="lg"
                        placeholder="Atvykimo vieta"
                        onChangeText={(text: string) => props.setArrival(text)}
                        borderColor={'#474700'} width={120}
                    />
                </Box>
            </Box>
        </FormControl>
    );
}
