import React from 'react';
import { Box, Button, FormControl, Input, Image, Text, Heading, Center, Radio } from 'native-base';
import styles from '../MapStyle';
import LocMarker from '../../../interfaces/LocMarker';
import Preferences from '../../../interfaces/Preferences';
import categoryUtilsObj from '../categoryUtils';

type BoxProps = {
    preferences: Preferences | undefined,
    setPreferences: React.Dispatch<React.SetStateAction<Preferences>>
    setPrefChosen: React.Dispatch<React.SetStateAction<boolean>>,
}

export default function PreferencesBox(props: BoxProps) {

    const categoryUtils = categoryUtilsObj;

    return (
        <Center style={styles.prefBox}>
            <Heading>Įvertinkite kaip jus domina šios vietos:</Heading>
            {Object.keys(props.preferences).sort().map((category, index) => (
                <Box mt={3} key={index}>
                    <Text style={{ alignSelf: 'center' }}>{categoryUtils[category as keyof object].name}</Text>
                    <Radio.Group
                        defaultValue="1"
                        name="myRadioGroup"
                        accessibilityLabel="Pick your favorite number"
                        style={styles.radioGroup}
                        onChange={(value) => props.setPreferences((prevState) => ({
                            ...prevState,
                            [category]: Number(value)
                        }))
                        }
                    >
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
            <Button onPress={() => props.setPrefChosen(true)} my={5}>Pateikti įvertinimus</Button>
        </Center >
    );
}
