import React from 'react';
import { Box, Button, FormControl, Input } from 'native-base';

type FormProps = {
    setArrival: (arrival: string) => void,
    setDeparture: (departure: string) => void,
    createRoute: () => Promise<void>,
}

export default function PlacesForm(props: FormProps) {

    return (
        <FormControl isRequired>
            <Box style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-around' }}>
                <Box style={{ display: 'flex', flexDirection: 'column' }}>
                    <FormControl.Label>Išvykimo vieta</FormControl.Label>
                    <Input
                        size="lg"
                        placeholder="Išvykimo vieta"
                        onChangeText={(text: string) => props.setDeparture(text)}
                    />
                </Box>
                <Box style={{ display: 'flex', flexDirection: 'column' }}>
                    <FormControl.Label>Atvykimo vieta</FormControl.Label>
                    <Input
                        size="lg"
                        placeholder="Atvykimo vieta"
                        onChangeText={(text: string) => props.setArrival(text)}
                    />
                </Box>
            </Box>
            <Button style={{ alignSelf: 'center' }} onPress={() => props.createRoute()} >Ieškoti</Button>
        </FormControl>
    );
}
