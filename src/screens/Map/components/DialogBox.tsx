import React from 'react';
import { Button, AlertDialog } from 'native-base';
import { FontAwesome } from '@expo/vector-icons';

type BoxProps = {
    header: string,
    body: string,
    function: Function,
    isLoading?: boolean,
    setIsLoading?: React.Dispatch<React.SetStateAction<boolean>>,
    cancelRef: React.MutableRefObject<null>,
    dialogOpen: boolean | undefined,
    setDialogOpen: React.Dispatch<React.SetStateAction<boolean | undefined>>,
}

export default function DialogBox(props: BoxProps) {

    return (
        <AlertDialog
            leastDestructiveRef={props.cancelRef}
            isOpen={props.dialogOpen}
            onClose={() => props.setDialogOpen(false)}
        >
            <AlertDialog.Content>
                <AlertDialog.CloseButton />
                <AlertDialog.Header>{props.header}</AlertDialog.Header>
                <AlertDialog.Body>{props.body}</AlertDialog.Body>
                <AlertDialog.Footer>
                    <Button.Group space={2}>
                        <Button
                            leftIcon={<FontAwesome name="remove" size={16} color="#000" />}
                            variant="unstyled"
                            colorScheme="coolGray"
                            onPress={() => props.setDialogOpen(false)}
                            ref={props.cancelRef}
                            isLoading={props.isLoading}
                        >
                            Atšaukti
                        </Button>
                        <Button
                            leftIcon={<FontAwesome name="check" size={16} color="#FFF" />}
                            _pressed={{ bg: '#474700' }}
                            bg={'#666600'}
                            isLoading={props.isLoading}
                            onPress={async () => {
                                await props.function();
                                props.setDialogOpen(false)
                            }}>
                            Taip
                        </Button>
                    </Button.Group>
                </AlertDialog.Footer>
            </AlertDialog.Content>
        </AlertDialog>
    );
}
