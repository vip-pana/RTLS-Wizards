import {
  Box,
  Button,
  Divider,
  HStack,
  Heading,
  SimpleGrid,
  Spinner,
  Stack,
  useDisclosure,
  useToast,
  VStack,
  Text,
  Img,
} from "@chakra-ui/react";
import { ConfirmModal } from "../../components/setup/ConfirmModal";
import { useEffect, useState } from "react";
import { device } from "../../features/Interface";
import axiosCloud, { ENDPOINT } from "../../features/AxiosCloud";
import { AxiosError } from "axios";
import { AddDeviceCard } from "../../components/setup/AddDeviceCard";
import { ErrorNetElement } from "../../components/ErrorNetElement";

// ASSETS
import triangle from "../../assets/triangle.png";
import square from "../../assets/square.png";
import pentagon from "../../assets/pentagon.png";

export const SetupNewAnchors = ({
  setActiveStep,
  activeStep,
  loading,
  setLoading,
  errorNet,
  setErrorNet,
}: {
  site: string | undefined;
  setActiveStep: React.Dispatch<React.SetStateAction<number>>;
  activeStep: number;
  loading: boolean;
  setLoading: React.Dispatch<React.SetStateAction<boolean>>;
  errorNet: boolean;
  setErrorNet: React.Dispatch<React.SetStateAction<boolean>>;
}) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [deviceList, setDeviceList] = useState<device[]>();
  const [deviceSiteList, setDeviceSiteList] = useState<device[]>();
  const site = sessionStorage.getItem("site");

  const toast = useToast();

  const getDeviceList = async () => {
    setErrorNet(false);
    setLoading(true);
    await axiosCloud
      .get(ENDPOINT.anchor + "/site/null")
      .then((res) => {
        setDeviceList(res.data);
        setLoading(false);
      })
      .catch((err: AxiosError) => {
        setErrorNet(true);
        setLoading(false);
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

  const getDeviceSiteList = async () => {
    setErrorNet(false);
    setLoading(true);
    await axiosCloud
      .get(ENDPOINT.anchor + "/site/" + site)
      .then((res) => {
        setDeviceSiteList(res.data);
        setLoading(false);
      })
      .catch((err: AxiosError) => {
        setErrorNet(true);
        setLoading(false);
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

  useEffect(() => {
    getDeviceList();
    getDeviceSiteList();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      <Stack width={"100%"} height={"50vh"}>
        {errorNet ? (
          <>
            <ErrorNetElement api={getDeviceList} />
          </>
        ) : (
          <>
            {loading ? (
              <>
                <Stack h={"70vh"} alignItems={"center"}>
                  <Spinner size="xl" mt={150} />
                </Stack>
              </>
            ) : (
              <>
                <HStack justifyContent={"center"}>
                  <Box
                    height={"100%"}
                    width={"46.6%"}
                    textAlign={"center"}
                    paddingInline={3}
                  >
                    {deviceList?.length != 0 ? (
                      <>
                      <center>
                      <Box
                      width={"20rem"}
                      height={"10rem"}
                  
                      boxShadow={"0 4px 12px 0 rgba(0, 0, 0, 0.25)"}
                      p={3}
                      borderRadius={5}
                      mb={5}
                      mt={5}
                  >
                    
                      <Heading size={"sm"} mb={2}>
                        Legenda posizionamento ancore:
                      </Heading>
                      <VStack spacing={4} align={"stretch"}>
                        <HStack spacing={3}>
                          <Text>- 3 ancore: </Text>
                          <Img src={triangle} width={5} height={5} />
                        </HStack>
                        <HStack>
                          <Text>- 4 ancore: </Text>
                          <Img src={square} width={5} height={5} />
                        </HStack>
                        <HStack>
                          <Text>- 5 ancore: </Text>
                          <Img src={pentagon} width={5} height={5} />
                        </HStack>
                      </VStack>               
                    </Box>
                      </center>
                        <Heading marginBottom={5}>New anchors</Heading>
                        <SimpleGrid columns={4} spacing={5} marginBottom={5}>
                          {deviceList?.map((deviceItem, index) => (
                            <Box key={index}>
                              <AddDeviceCard
                                deviceItem={deviceItem}
                                action={"add"}
                                site={site}
                                getDeviceList={() => getDeviceList()}
                                getDeviceSiteList={() => getDeviceSiteList()}
                              />
                            </Box>
                          ))}
                        </SimpleGrid>
                      </>
                    ) : (
                      <>
                        {" "}
                        <Heading textAlign={"center"} color={"gray"} mt={50}>
                          No new anchors{" "}
                        </Heading>
                      </>
                    )}
                  </Box>
                  <Divider
                    orientation="vertical"
                    height={"50vh"}
                    marginRight={"-40px"}
                  />
                  <Box
                    height={"100%"}
                    width={"46.6%"}
                    marginLeft={"2.5rem"}
                    textAlign={"center"}
                    paddingInline={3}
                  >
                    {deviceSiteList?.length !== 0 ? (
                      <>
                        <Heading marginBottom={5}>Actived anchors</Heading>
                        <SimpleGrid columns={4} spacing={5} marginBottom={5}>
                          {deviceSiteList?.map((deviceItem, index) => (
                            <Box key={index}>
                              <AddDeviceCard
                                deviceItem={deviceItem}
                                action={"disassociate"}
                                site={site}
                                getDeviceList={() => getDeviceList()}
                                getDeviceSiteList={() => getDeviceSiteList()}
                              />
                            </Box>
                          ))}
                        </SimpleGrid>
                      </>
                    ) : (
                      <>
                        {" "}
                        <Heading
                          textAlign={"center"}
                          color={"gray"}
                          mt={50}
                          ml={50}
                        >
                          No setted anchors{" "}
                        </Heading>
                      </>
                    )}
                  </Box>
                </HStack>
                <center>
                  <Button
                    variant={"solid"}
                    colorScheme="leaf"
                    size={"lg"}
                    backgroundColor="#559c8b"
                    w={500}
                    onClick={onOpen}
                    m={5}
                  >
                    Confirm
                  </Button>
                </center>
              </>
            )}
          </>
        )}
      </Stack>
      <ConfirmModal
        isOpen={isOpen}
        onClose={onClose}
        setActiveStep={setActiveStep}
        site={site}
        activeStep={activeStep}
      />
    </>
  );
};
