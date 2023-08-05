import {
  Drawer,
  DrawerOverlay,
  DrawerContent,
  DrawerCloseButton,
  DrawerHeader,
  DrawerBody,
  DrawerFooter,
  Button,
  Stack,
  Text,
  Input,
  HStack,
} from "@chakra-ui/react";
import { useState } from "react";
import axiosCloud from "../features/AxiosCloud";
import { device } from "../features/Interface";

export const DrawerForm = ({
  isOpen,
  onClose,
  device,
  getContact,
}: {
  isOpen: boolean;
  onOpen: () => void;
  onClose: () => void;
  device: device;
  getContact: () => void;
}) => {
  const [loading, setLoading] = useState<boolean>(false);

  const [positionX, setPositionX] = useState<number>(device?.positions[0].x);
  const handleXInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputNum = parseFloat(e.target.value);
    setPositionX(inputNum);
  };

  const [positionY, setPositionY] = useState<number>(device?.positions[0].y);
  const handleYInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputNum = parseFloat(e.target.value);
    setPositionY(inputNum);
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      await axiosCloud
        .put(
          device?.type + "/mac/positions/" + device?.macAddress,
          JSON.stringify({ x: positionX, y: positionY }),
          {
            headers: { "Content-Type": "application/json" },
          }
        )
        .then(() => {
          setLoading(false);
          getContact();
        });
      onClose();
    } catch (error) {
      console.log(error);
      setLoading(false);
    }
  };

  return (
    <Drawer isOpen={isOpen} placement="right" onClose={onClose}>
      <DrawerOverlay />
      <DrawerContent>
        <DrawerCloseButton />
        <DrawerHeader borderBottomWidth="1px">Update positions</DrawerHeader>
        <DrawerBody>
          <Stack spacing="24px" mt={5}>
            <HStack>
              <Text>X</Text>
              <Input
                id="x"
                onChange={handleXInput}
                placeholder="Please enter position X"
                size={"xs"}
                type="number"
                required
                defaultValue={device?.positions[0].x}
              />
            </HStack>
            <HStack>
              <Text>Y</Text>
              <Input
                id="y"
                onChange={handleYInput}
                placeholder="Please enter position Y"
                size={"xs"}
                type="number"
                required
                defaultValue={device?.positions[0].y}
              />
            </HStack>
          </Stack>
        </DrawerBody>
        <DrawerFooter borderTopWidth="1px">
          <Button variant="outline" mr={3} onClick={onClose}>
            Cancel
          </Button>
          <Button
            isLoading={loading}
            isDisabled={
              Number.isNaN(positionX) || Number.isNaN(positionY) ? true : false
            }
            colorScheme="blue"
            onClick={handleSubmit}
          >
            Submit
          </Button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
};
