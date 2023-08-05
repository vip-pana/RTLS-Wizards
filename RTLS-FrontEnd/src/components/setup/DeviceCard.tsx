import {
  Button,
  Card,
  CardBody,
  Drawer,
  DrawerBody,
  DrawerCloseButton,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerOverlay,
  HStack,
  Heading,
  Input,
  Stack,
  Text,
  VStack,
  useDisclosure,
} from "@chakra-ui/react";
import { useState } from "react";
import { device } from "../../features/Interface";
import axiosCloud, { ENDPOINT } from "../../features/AxiosCloud";

export const DeviceCard = ({
  deviceItem,
  getDeviceList,
}: {
  deviceItem: device;
  getDeviceList: () => Promise<void>;
}) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [loading, setLoading] = useState<boolean>(false);

  const [positionX, setPositionX] = useState<number>();
  const handleXInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputNum = parseFloat(e.target.value);
    setPositionX(inputNum);
  };

  const [positionY, setPositionY] = useState<number>();
  const handleYInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputNum = parseFloat(e.target.value);
    setPositionY(inputNum);
  };

  const handleSubmit = async () => {
    setLoading(true);
    await axiosCloud
      .put(
        ENDPOINT.anchor + "/mac/positions/" + deviceItem.macAddress,
        JSON.stringify({ x: positionX, y: positionY })
      )
      .then(() => {
        getDeviceList();
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
      });
  };

  return (
    <>
      <Card m={5}>
        <CardBody>
          <VStack>
            <Heading size="md" as={"i"}>
              {deviceItem.macAddress}
            </Heading>
            <HStack>
              <Text>X: {deviceItem.positions[0].x}</Text>
              <Text>Y: {deviceItem.positions[0].y}</Text>
            </HStack>
            <Button size={"xs"} onClick={onOpen}>
              Open
            </Button>
          </VStack>
        </CardBody>
      </Card>
      <Drawer isOpen={isOpen} onClose={onClose}>
        <DrawerOverlay />
        <DrawerContent>
          <DrawerCloseButton />
          <DrawerHeader>New Data for {deviceItem.macAddress}</DrawerHeader>
          <DrawerBody>
            <Stack spacing="24px" mt={5}>
              <HStack>
                <Text>X</Text>
                <Input
                  id="x"
                  onChange={handleXInput}
                  placeholder="ex. 2"
                  size={"xs"}
                  type="number"
                  required
                />
              </HStack>
              <HStack>
                <Text>Y</Text>
                <Input
                  id="y"
                  onChange={handleYInput}
                  placeholder="ex. 3.54"
                  size={"xs"}
                  type="number"
                  required
                />
              </HStack>
            </Stack>
          </DrawerBody>
          <DrawerFooter>
            <Button variant="outline" mr={3} onClick={onClose}>
              Cancel
            </Button>
            <Button
              colorScheme="blue"
              onClick={handleSubmit}
              isLoading={loading}
            >
              Save
            </Button>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </>
  );
};
