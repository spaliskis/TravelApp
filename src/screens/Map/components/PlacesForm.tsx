import React, { useState } from 'react';
import { Box, Button, FormControl, Input, Text } from 'native-base';
import { FontAwesome } from '@expo/vector-icons';
import { useForm, Controller } from "react-hook-form";
import { StyleSheet, Dimensions } from 'react-native';
import LocMarker from '../../../interfaces/LocMarker';
const { width, height } = Dimensions.get('screen');

type FormProps = {
    createRoute: (departure: string, arrival: string) => Promise<void | string>,
    isLoading: boolean,
    setIsLoading: React.Dispatch<React.SetStateAction<boolean>>,
    setClickedMarker: React.Dispatch<React.SetStateAction<LocMarker | undefined>>,
}

type DataFields = {
    departure: string,
    arrival: string
}

export default function PlacesForm(props: FormProps) {
    const { control, handleSubmit, formState: { errors, isValid } } = useForm({ mode: 'onBlur' });
    const onSubmit = async (data: DataFields) => {
        props.setIsLoading(true);
        let resp = await props.createRoute(data.departure, data.arrival);
        props.setIsLoading(false);
        props.setClickedMarker(undefined);
    }

    return (
        <FormControl isInvalid={"departure" in errors || "arrival" in errors}>
            <Box display={'flex'} flexDirection={'row'} justifyContent={'space-between'} alignItems={'flex-end'} py={2}>
                <Box display={'flex'} flexDirection={'column'}>
                    {errors.departure && <FormControl.ErrorMessage style={{ alignSelf: 'center', position: 'absolute', bottom: 50 }}>{errors.departure.message}</FormControl.ErrorMessage>}
                    <Controller
                        control={control}
                        name="departure"
                        rules={{
                            required: {
                                value: true,
                                message: 'Įveskite vietą'
                            },
                        }}
                        render={({ field: { onChange, value, onBlur } }) => (
                            <Input
                                minWidth={120}
                                maxWidth={120}
                                isDisabled={props.isLoading}
                                _focus={{ borderColor: '#b7b700' }}
                                variant={'rounded'}
                                value={value}
                                onBlur={onBlur}
                                size="lg"
                                placeholder="Išvykimo vieta"
                                onChangeText={(value: string) => onChange(value)}
                                borderColor={'#474700'}
                            />
                        )}
                    />
                </Box>
                <Button
                    px={1}
                    _pressed={{ bg: '#474700' }}
                    leftIcon={<FontAwesome name="search" size={16} color="#FFF" />}
                    size={'lg'} bg={'#666600'} alignSelf={'flex-end'}
                    isLoading={props.isLoading}
                    onPress={handleSubmit(onSubmit)}
                >Ieškoti</Button>

                <Box style={{ display: 'flex', flexDirection: 'column' }}>
                    {errors.arrival && <FormControl.ErrorMessage style={{ alignSelf: 'center', position: 'absolute', bottom: 50 }}>{errors.arrival.message}</FormControl.ErrorMessage>}
                    <Controller
                        control={control}
                        name="arrival"
                        rules={{
                            required: {
                                value: true,
                                message: 'Įveskite vietą'
                            },
                        }}
                        render={({ field: { onChange, value, onBlur } }) => (
                            <Input
                                minWidth={120}
                                maxWidth={120}
                                isDisabled={props.isLoading}
                                _focus={{ borderColor: '#b7b700' }}
                                variant={'rounded'}
                                value={value}
                                onBlur={onBlur}
                                size="lg"
                                placeholder="Išvykimo vieta"
                                onChangeText={(value: string) => onChange(value)}
                                borderColor={'#474700'}
                            />
                        )}
                    />
                </Box>
            </Box>
        </FormControl>
    );
}
