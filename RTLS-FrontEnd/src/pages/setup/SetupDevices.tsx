import {
  Box,
  Button,
  Heading,
  SimpleGrid,
  Spinner,
  Stack,
  useDisclosure,
  useToast,
} from "@chakra-ui/react";
import { DeviceCard } from "../../components/setup/DeviceCard";
import { ConfirmModal } from "../../components/setup/ConfirmModal";
import { useEffect, useState } from "react";
import { device } from "../../features/Interface";
import axiosCloud, { ENDPOINT } from "../../features/AxiosCloud";
import { AxiosError } from "axios";
import { ErrorNetElement } from "../../components/ErrorNetElement";

export const SetupDevices = ({
  setActiveStep,
  activeStep,
}: {
  site: string | undefined;
  setActiveStep: React.Dispatch<React.SetStateAction<number>>;
  activeStep: number;
}) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [deviceList, setDeviceList] = useState<device[]>();
  const [loading, setLoading] = useState<boolean>(false);
  const [errorNet, setErrorNet] = useState<boolean>(false);
  const site = sessionStorage.getItem("site");

  const toast = useToast();

  const getDeviceList = async () => {
    setErrorNet(false);
    setLoading(true);
    axiosCloud
      .get(ENDPOINT.anchor + "/site/" + site)
      .then((res) => {
        console.log(site);
        console.log(res.data);

        setDeviceList(res.data);
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

  useEffect(() => {
    getDeviceList();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      <Stack alignItems={"center"}>
        {errorNet ? (
          <ErrorNetElement api={getDeviceList} />
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
                <Heading textAlign={"center"}>Set anchors positions</Heading>
                <center>
                  <SimpleGrid columns={5} spacing={5} marginBottom={5}>
                    {deviceList?.map((deviceItem, index) => (
                      <Box key={index}>
                        <DeviceCard
                          deviceItem={deviceItem}
                          getDeviceList={getDeviceList}
                        />
                      </Box>
                    ))}
                  </SimpleGrid>
                  <Button
                    variant={"solid"}
                    colorScheme="leaf"
                    size={"lg"}
                    backgroundColor="#559c8b"
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
