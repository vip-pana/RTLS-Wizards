import {
  Box,
  Button,
  Drawer,
  DrawerBody,
  DrawerCloseButton,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerOverlay,
  FormControl,
  FormLabel,
  Heading,
  Input,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Select,
  Spinner,
  Stack,
  useDisclosure,
  useToast,
} from "@chakra-ui/react";
import { useEffect, useState } from "react";
import axiosCloud, { ENDPOINT } from "../../features/AxiosCloud";
import { Site, device, Machine } from "../../features/Interface";
import { AxiosError } from "axios";
import { ErrorNetElement } from "../ErrorNetElement";
import { SetSitePage } from "../../pages/SetSitePage";

export const SiteGrid = ({
  setActiveStep,
  loading,
  setLoading,
  errorNet,
  setErrorNet,
}: {
  setActiveStep: React.Dispatch<React.SetStateAction<number>>;
  setSite: React.Dispatch<React.SetStateAction<string>>;
  site: string | undefined;
  loading: boolean;
  setLoading: React.Dispatch<React.SetStateAction<boolean>>;
  errorNet: boolean;
  setErrorNet: React.Dispatch<React.SetStateAction<boolean>>;
}) => {
  const { isOpen, onOpen, onClose } = useDisclosure();

  const toast = useToast();
  const [machine,setMachine] = useState();
  const siteName = sessionStorage.getItem("site");

  const [machineList, setMachineList] = useState<Machine[]>();
  const [deviceList, setDeviceList] = useState<device[]>();
  const [name, setName] = useState<string>();
  const [modal, setModal] = useState<string>();

  const getMachineList = async () => {
    setErrorNet(false);
    setLoading(true);

    await axiosCloud
      .get(ENDPOINT.machine)
      .then((res) => {
        setMachineList(res.data);
        setLoading(false);
      })
      .catch((err: AxiosError) => {
        setLoading(false);
        setErrorNet(true);
        if (err.message == "Network Error" || err.code == "ERR_NETWORK") {
          toast({
            status: "error",
            title: "Server Error",
            variant: "solid",
            duration: 3000,
            isClosable: true,
            position: "top-right",
          });
        }
      });
  };

  const handleName = (e: React.ChangeEvent<HTMLInputElement>) => {
    setName(e.target.value);
  };

  const handleSubmit = () => {
    if (machine != "") {
      sessionStorage.setItem("machineName", machine);
      setActiveStep(1);
    } else {
      toast({
        status: "error",
        title: "Please, select a machine.",
        variant: "solid",
        duration: 3000,
        isClosable: true,
        position: "top-right",
      });
    }
  };

  const handleAdd = async () => {
    setLoading(true);
    await axiosCloud
      .post(ENDPOINT.machine, JSON.stringify({ name, siteName }), {
        headers: { "Content-Type": "application/json" },
      })
      .then(() => {
        setLoading(false);
        getMachineList();
        onClose();
      })
      .catch((err: AxiosError) => {
        setLoading(false);
        console.log("err.code");
        if (err.message == "Network Error" || err.code == "ERR_NETWORK") {
          toast({
            status: "error",
            title: "Server Error",
            variant: "solid",
            duration: 3000,
            isClosable: true,
            position: "top-right",
          });
        }
      });
  };

  useEffect(
    () => {
      getMachineList();
    },[]
  );

  return (
    <Stack alignItems={"center"}>
      {errorNet ? (
        <>
          <ErrorNetElement api={getMachineList} />
        </>
      ) : (
        <>
          {loading ? (
            <Spinner size="xl" mt={150} />
          ) : (
            <Box>
              <Heading textAlign={"center"}>Select the machine</Heading>
              <Select
                mt={50}
                mb={50}
                variant={"filled"}
                placeholder="ex. machine A"
                onChange={(e) => {
                  setMachine(e.target.value);
                }}
              >
                {machineList?.map((machine, index) => (
                  <option key={index} value={machine.name}>
                    {machine.name}
                  </option>
                ))}
              </Select>
              <Button
                width={"100%"}
                colorScheme="teal"
                mb={10}
                onClick={handleSubmit}
                isLoading={loading}
              >
                Confirm
              </Button>
              <Button
                width={"100%"}
                colorScheme="gray"
                mb={10}
                onClick={() => {
                  setModal("drawer");
                  onOpen();
                }}
              >
                Register a new machine
              </Button>
            </Box>
          )}
        </>
      )}

      {modal === "drawer" ? (
        <Drawer isOpen={isOpen} placement="right" onClose={onClose}>
          <DrawerOverlay />
          <DrawerContent>
            <DrawerCloseButton />
            <DrawerHeader>Register a new machine</DrawerHeader>
            <DrawerBody>
              <FormControl isRequired>
                <FormLabel>Machine name</FormLabel>
                <Input onChange={handleName} />
              </FormControl>
            </DrawerBody>

            <DrawerFooter>
              <Button variant="outline" mr={3} onClick={onClose}>
                Cancel
              </Button>
              <Button
                colorScheme="blue"
                isLoading={loading}
                onClick={handleAdd}
              >
                Save
              </Button>
            </DrawerFooter>
          </DrawerContent>
        </Drawer>
      ) : (
        <></>
      )}
    </Stack>
  );
};
