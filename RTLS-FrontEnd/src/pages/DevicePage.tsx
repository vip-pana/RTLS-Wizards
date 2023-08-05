import {
  Button,
  Card,
  CardBody,
  CardHeader,
  HStack,
  Heading,
  IconButton,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Skeleton,
  Spacer,
  Text,
  useDisclosure,
  useToast,
} from "@chakra-ui/react";
import { FaEdit } from "react-icons/fa";

// LOGICS
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

// FEATURES
import { device } from "../features/Interface";
import axiosCloud, { ENDPOINT } from "../features/AxiosCloud";

// COMPONENTS
import { MapWindow } from "../components/MapWindow";
import { DrawerForm } from "../components/DrawerForm";
import { AxiosError } from "axios";
import { WarningIcon } from "@chakra-ui/icons";

export const DevicePage = ({
  getTimeFrequency,
}: {
  getTimeFrequency: () => number;
}) => {
  const [singleDevice, setSingleDevice] = useState<device>();

  const [loading, setLoading] = useState<boolean>(true);
  const toast = useToast();
  const param = useParams();
  const navigate = useNavigate();

  // disclosure useState change for open drawer or modal
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [disclosure, setDisclosure] = useState<string>();

  const openFormDrawer = () => {
    setDisclosure("drawer");
    onOpen();
  };

  const openDissasociateModal = () => {
    setDisclosure("disassociate");
    onOpen();
  };

  const getContact = async () => {
    await axiosCloud
      .get(
        param.type == "tag"
          ? ENDPOINT.tag + "/mac/" + param.macAddress
          : ENDPOINT.anchor + "/mac/" + param.macAddress
      )
      .then((result) => {
        setSingleDevice(result.data);
        setLoading(false);
      })
      .catch((error: AxiosError) => {
        if (error.message == "Network Error") {
          toast({
            status: "error",
            title: "Server Error",
            variant: "solid",
            duration: 5000,
            isClosable: true,
            position: "top-right",
          });
        }
      });
  };

  const dissociateAnchorFromSite = async () => {
    setLoading(true);
    await axiosCloud
      .put(
        (singleDevice?.type == "anchor" ? ENDPOINT.anchor : ENDPOINT.tag) +
          "/dissociate/" +
          param.macAddress
      )
      .then(() => {
        navigate(-1);
        setLoading(false);
      })
      .catch((error: AxiosError) => {
        if (error.message == "Network Error") {
          setLoading(false);
          toast({
            status: "error",
            title: "Server Error",
            variant: "solid",
            duration: 5000,
            isClosable: true,
            position: "top-right",
          });
        }
      });
  };

  useEffect(() => {
    getContact();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      <Card w={"80%"}>
        <CardHeader>
          <HStack>
            <Heading size="md">
              {param.type == "anchor" ? "Anchor Detail" : "Tag Detail"}
            </Heading>
            <Spacer />
            <>
              <Button
                colorScheme="yellow"
                rightIcon={<WarningIcon />}
                onClick={() => openDissasociateModal()}
              >
                Dissociate
              </Button>
            </>
            {singleDevice?.type == "anchor" ? (
              <IconButton
                icon={<FaEdit />}
                aria-label={"edit"}
                colorScheme="teal"
                rounded={"3xl"}
                onClick={() => openFormDrawer()}
              />
            ) : (
              <></>
            )}
          </HStack>
        </CardHeader>
        <CardBody>
          <HStack>
            <Text as={"b"}>Mac Address:</Text>
            {loading ? (
              <Skeleton height="20px" w={"20%"} />
            ) : (
              <Text fontSize="sm">{singleDevice?.macAddress}</Text>
            )}
            <Text as={"b"} size="md" m={2}>
              Last position:
            </Text>
            <Text as={"b"}>X:</Text>
            {loading ? (
              <Skeleton height="15px" w={"20%"} />
            ) : (
              <Text fontSize="sm">
                {singleDevice?.positions[0]
                  ? `${singleDevice?.positions[0].x.toFixed(2)}`
                  : "NaN"}
              </Text>
            )}
            <Text as={"b"}>Y:</Text>
            {loading ? (
              <Skeleton height="15px" w={"20%"} />
            ) : (
              <Text fontSize="sm">
                {singleDevice?.positions[0]
                  ? `${singleDevice?.positions[0].y.toFixed(2)}`
                  : "NaN"}
              </Text>
            )}
          </HStack>
          <HStack>
            <Text as={"b"}>Site:</Text>
            {loading ? (
              <Skeleton height="15px" w={"20%"} />
            ) : (
              <Text fontSize="sm">
                {singleDevice?.siteName ? `${singleDevice.siteName}` : ""}
              </Text>
            )}
          </HStack>
        </CardBody>
      </Card>
      <Card w={"80%"} h={"80%"} mt={10}>
        <CardBody>
          {singleDevice ? (
            <MapWindow
              deviceDetail={singleDevice}
              setDeviceDetail={setSingleDevice}
              getTimeFrequency={getTimeFrequency}
            />
          ) : (
            <>
              <Skeleton height="100%" />
            </>
          )}
        </CardBody>
      </Card>
      {disclosure == "drawer" && singleDevice ? (
        <DrawerForm
          isOpen={isOpen}
          onOpen={onOpen}
          onClose={onClose}
          device={singleDevice}
          getContact={getContact}
        />
      ) : (
        <></>
      )}
      {disclosure == "disassociate" && singleDevice ? (
        <>
          <Modal isOpen={isOpen} onClose={onClose} isCentered>
            <ModalOverlay />
            <ModalContent>
              <ModalHeader>Modal Title</ModalHeader>
              <ModalCloseButton />
              <ModalBody>
                You are dissociating the anchor from the site. Are you sure? to
                reconnect this device in the future you will need to go through
                the Setup process.
              </ModalBody>
              <ModalFooter>
                <Button
                  colorScheme="yellow"
                  mr={3}
                  onClick={() => dissociateAnchorFromSite()}
                  isLoading={loading}
                >
                  Dissociate
                </Button>
                <Button variant="ghost" onClick={onClose}>
                  Close
                </Button>
              </ModalFooter>
            </ModalContent>
          </Modal>
        </>
      ) : (
        <> </>
      )}
    </>
  );
};
