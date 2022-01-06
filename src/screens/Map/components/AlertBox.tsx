import React, { useEffect } from "react"
import { Alert, IconButton, HStack, VStack, CloseIcon, Text, Box } from "native-base"

type AlertProps = {
    status: string,
    title: string,
    setError: React.Dispatch<React.SetStateAction<string | undefined>>
}

export function AlertBox(props: AlertProps) {

    useEffect(() => {
        setTimeout(() => {
            props.setError(undefined);
        }, 50000);
    }, []);

    return (
        <Alert m={10}
            style={{ position: 'absolute', bottom: 0, alignSelf: 'center', backgroundColor: '#9d0000', borderWidth: 1, borderColor: '#000', maxHeight: 100 }}
            status={props.status}
            variant={'solid'}>
            <VStack space={2} flexShrink={1} w="100%">
                <HStack flexShrink={1} space={2} justifyContent="space-between">
                    <HStack space={2} flexShrink={1}>
                        <Alert.Icon mt="1" />
                        <Text fontSize="md" color="#FFF">
                            {props.title}
                        </Text>
                    </HStack>
                    <IconButton
                        onPress={() => props.setError(undefined)}
                        variant="unstyled"
                        icon={<CloseIcon size="3" color="#FFF" />}
                    />
                </HStack>
            </VStack>
        </Alert>
    )
}
