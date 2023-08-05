import {
  Box,
  Button,
  Card,
  CardBody,
  HStack,
  Heading,
  IconButton,
  Input,
  Spacer,
  Text,
  VStack,
  useToast,
} from "@chakra-ui/react";
import { MapWindow } from "../components/MapWindow";
import { LegendTable } from "../components/LegendTable";
import { useState } from "react";
import { FaEdit } from "react-icons/fa";
import { FaCircle } from "react-icons/fa";
import axiosCloud, { ENDPOINT } from "../features/AxiosCloud";

export const MapPage = ({
  getTimeFrequency,
}: {
  getTimeFrequency: () => number;
}) => {
  // open/close input timer
  const [showInput, setShowInput] = useState(false);

  const [inputTimer, setInputTimer] = useState<number>();

  // Start Recording 
  const siteName = sessionStorage.getItem("site");
  const machineName = sessionStorage.getItem("machineName"); 
  const toast = useToast();
  const [idHistory, setIdHistory] = useState("");

  const handleInputTimer = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputNum = parseInt(e.target.value);
    setInputTimer(inputNum);
  };

  const handleSaveNewTimer = () => {
    if (inputTimer != undefined) {
      const inputTimerInMs = inputTimer * 1000;
      localStorage.setItem("refreshingTime", inputTimerInMs.toString());
      location.reload();
    }
  };

  const handleStartRecording = async () =>{
    await axiosCloud
      .post("/startrec", JSON.stringify({ machineName: machineName, siteName: siteName }), {
        headers: { "Content-Type": "application/json" },
      })
      .then((res) => {
        setIdHistory(sessionStorage.setItem("idHistory",res.data.id));
      })
      .catch((err: AxiosError) => {
        if (err.message == "Network Error" || err.code == "ERR_NETWORK") {
          toast({
            status: "error",
            title: "Server Error",
            duration: 3000,
            isClosable: true,
            position: "top-right",
          });
        }
      });
  };

  return (
    <>
      <Heading>Map</Heading>
      <HStack h={"full"} alignItems={"start"} mt={10}>
        <Card w={"70%"} h={"full"} mr={10} shadow={"2xl"}>
          <CardBody>
            <MapWindow
              deviceDetail={null}
              setDeviceDetail={undefined}
              getTimeFrequency={getTimeFrequency}
            />
          </CardBody>
        </Card>
        <Box>
          <Card shadow={"2xl"}>
            <CardBody>
              <LegendTable />
            </CardBody>
          </Card>
          <Card shadow={"2xl"} mt={5}>
            <CardBody>
              <HStack>
                <Text>Update Frequency: {getTimeFrequency() / 1000} s</Text>
                <Spacer />
                <IconButton
                  size={"xs"}
                  shadow={"md"}
                  borderRadius={"3xl"}
                  icon={<FaEdit />}
                  aria-label={"editFrequency"}
                  onClick={() => setShowInput(!showInput)}
                />
              </HStack>
              <VStack display={showInput ? "block" : "none"}>
                <Input
                  mt={2}
                  placeholder="time frequency"
                  type="number"
                  onChange={handleInputTimer}
                />
                <Button
                  mt={2}
                  w={"100%"}
                  colorScheme="facebook"
                  onClick={handleSaveNewTimer}
                >
                  Update
                </Button>
              </VStack>
            </CardBody>
          </Card>
          <Card marginTop={5}>
            <Button
              variant={"solid"}
              colorScheme={"teal"}
              rightIcon={<FaCircle />}
              onClick={handleStartRecording}
            >
              Start recording
            </Button>
          </Card>
        </Box>
      </HStack>
    </>
  );
};
