import { useState, useCallback } from 'react';
import { useDisclosure, Modal, ModalOverlay, ModalContent, ModalHeader, ModalFooter, ModalBody, Button, Text, useColorModeValue, ModalCloseButton, Spinner } from '@chakra-ui/react';

function useConfirmationPopup() {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [confirmationText, setConfirmationText] = useState('');
  const [actionFunction, setActionFunction] = useState(() => () => {});
  const [actionLabel, setActionLabel] = useState('');
  const [actionBackgroundColor, setActionBackgroundColor] = useState('');

  const requestConfirm = useCallback((message, action, actionFunction, actionBG = '') => {
    setConfirmationText(message);
    setActionLabel(action);
    setActionFunction(() => actionFunction);
    setActionBackgroundColor(actionBG);
    onOpen();
  }, [onOpen]);

  const handleConfirm = async () => {
    actionFunction();
    onClose();
  };

  const handleCancel = () => {
    onClose();
  };

  const ConfirmationModal = (
    <Modal isOpen={isOpen} onClose={handleCancel}>
      <ModalOverlay />
      <ModalContent bg={useColorModeValue("white", "gray.dark")}>
        <ModalCloseButton />
        <ModalHeader>Confirmation</ModalHeader>
        <ModalBody>
          <Text>{confirmationText}</Text>
        </ModalBody>
        <ModalFooter>
          <Button colorScheme={actionBackgroundColor} onClick={handleConfirm} >
            {actionLabel}
          </Button>
          <Button ml={3} onClick={handleCancel}>
            Cancel
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );

  return { ConfirmationModal, requestConfirm };
}

export default useConfirmationPopup;
