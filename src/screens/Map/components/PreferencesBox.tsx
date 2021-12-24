import React, { useEffect } from 'react';
import { Box, Button, FormControl, Input, Image, Text, Heading, Center, Radio } from 'native-base';
import styles from '../MapStyle';
import LocMarker from '../../../interfaces/LocMarker';
import Preferences from '../../../interfaces/Preferences';
import categoryUtilsObj from '../categoryUtils';
import AsyncStorage from '@react-native-async-storage/async-storage';

type BoxProps = {
    preferences: Preferences,
    setPreferences: React.Dispatch<React.SetStateAction<Preferences>>
    setPrefChosen: React.Dispatch<React.SetStateAction<boolean>>,
}

const storePreferences = async (value: object) => {
    try {
        const jsonValue = JSON.stringify(value)
        await AsyncStorage.setItem('@preferences', jsonValue)
    } catch (e) {
        console.log(e);
    }
}

const getPreferences = async () => {
    try {
        const jsonValue = await AsyncStorage.getItem('@preferences')
        return jsonValue != null ? JSON.parse(jsonValue) : null;
    } catch (e) {
        console.log(e);
    }
}

export default function PreferencesBox(props: BoxProps) {
    const categoryUtils = categoryUtilsObj;

    return (
        <Center style={styles.prefBox}>
            <Text textAlign={'center'} fontSize={'3xl'} color={'#001a66'} pb={2} bold>Įvertinkite kaip jus domina šios vietos:</Text>
            {Object.keys(props.preferences as Preferences).sort().map((category, index) => (
                <Box my={3} key={index}>
                    <Text style={{ alignSelf: 'center', color: '#001a66', fontSize: 24, lineHeight: 24 }}>{categoryUtils[category as keyof object].name}</Text>
                    <Radio.Group
                        defaultValue={String(props.preferences[category as keyof Preferences])}
                        name="myRadioGroup"
                        accessibilityLabel="Pick your favorite number"
                        style={styles.radioGroup}
                        onChange={(value) => props.setPreferences((prevState) => ({
                            ...prevState,
                            [category]: Number(value)
                        }))}
                    >
                        <Radio value="0" m={1}>
                            0
                        </Radio>
                        <Radio value="1" m={1}>
                            1
                        </Radio>
                        <Radio value="2" m={1}>
                            2
                        </Radio>
                        <Radio value="3" m={1}>
                            3
                        </Radio>
                        <Radio value="4" m={1}>
                            4
                        </Radio>
                        <Radio value="5" m={1}>
                            5
                        </Radio>
                    </Radio.Group>
                </Box>
            ))
            }
            <Button
                size="lg"
                bg={'#666600'}
                _pressed={{ bg: '#474700' }}
                onPress={async () => {
                    console.log(`Storing preferences: ${JSON.stringify(props.preferences)}`);
                    await storePreferences(props.preferences);
                    props.setPrefChosen(true);
                }} my={5}>Pateikti įvertinimus</Button>
        </Center >
    );
}
