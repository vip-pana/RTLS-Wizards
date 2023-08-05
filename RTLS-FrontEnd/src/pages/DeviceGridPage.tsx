import {
  Box,
  Button,
  Heading,
  HStack,
  Spacer,
  Stack,
  Text,
  VStack,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  useDisclosure,
} from "@chakra-ui/react";
import { DeviceGrid } from "../components/DeviceGrid";
import { MdBuild } from "react-icons/md";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { WarningIcon } from "@chakra-ui/icons";
import axiosCloud, { ENDPOINT } from "../features/AxiosCloud";
import { ConfirmModalProps } from "../features/Interface";

export const DeviceGridPage = ({
  getTimeFrequency,
}: {
  getTimeFrequency: () => number;
}) => {
  const navigate = useNavigate();

  const [timer, setTimer] = useState(0);

  const { isOpen, onOpen, onClose } = useDisclosure();

  useEffect(() => {
    const interval = setInterval(() => {
      if (timer > 0) {
        setTimer(timer - 1);
      } else {
        setTimer(getTimeFrequency() / 1000);
      }
    }, 1000);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timer]);

  return (
    <>
      <Box>
        <Stack direction={"row"}>
          <Heading>Devices</Heading>
          <Spacer />
          <VStack>
            <HStack>
              <Button
                mt={10}
                rightIcon={<WarningIcon />}
                colorScheme="yellow"
                onClick={onOpen}
              >
                Dissociate all devices
              </Button>
              <Button
                mt={10}
                mr={20}
                rightIcon={<MdBuild />}
                colorScheme="gray"
                onClick={() => {
                  localStorage.removeItem("isSetted");
                  navigate("/setup");
                }}
              >
                New setup
              </Button>
            </HStack>
            <Text mr={20}>Next Request: {timer} s</Text>
          </VStack>
        </Stack>
        <HStack alignItems={"start"}>
          <DeviceGrid type="anchor" />
          <DeviceGrid type="tag" />
        </HStack>
      </Box>
      <DisassociateModal isOpen={isOpen} onClose={onClose} />
    </>
  );
};

const DisassociateModal = (props: ConfirmModalProps) => {
  const [loading, setLoading] = useState<boolean>(false);

  const disassociateAll = async () => {
    setLoading(true);
    await axiosCloud
      .put(ENDPOINT.anchor + "/all/dissociate/" + sessionStorage.getItem("site"))
      .then(()=>{
        setLoading(false);
        props.onClose();
      });
  };

  return (
    <Modal isOpen={props.isOpen} onClose={props.onClose} isCentered>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Are you sure?</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          Once confirmed, all the anchors will be disassociated from this site:{" "}
          {sessionStorage.getItem("site")}
        </ModalBody>
        <ModalFooter>
          <Button colorScheme="yellow" mr={3} isLoading={loading} onClick={disassociateAll}>
            Confirm
          </Button>
          <Button variant="ghost" onClick={props.onClose}>
            Cancel
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};
