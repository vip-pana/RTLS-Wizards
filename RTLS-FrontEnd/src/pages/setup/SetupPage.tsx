import { Box, Button, Heading, Stack, Text } from "@chakra-ui/react";

export const SetupPage = ({
  setActiveStep,
}: {
  setActiveStep: React.Dispatch<React.SetStateAction<number>>;
}) => {
  return (
    <Stack>
      <Box textAlign={"center"} m={50}>
        <Heading size={"lg"} marginBottom={5}>
          Welcome to the RTLS system setup page!
        </Heading>
        <Text marginBottom={3}>
          To start tracking, it is important to place the anchors in the desired
          places within the area you wish to monitor. Make sure you fiscally
          measure the size of the room using a meter and enter the correct
          coordinates of the anchors. The first one is still set by default to
          (0.1) and remains fixed. Once you enter all the information, you will
          be ready to start the tracking.
        </Text>
        <Button
          colorScheme="teal"
          size="lg"
          m={50}
          onClick={() => setActiveStep(0)}
        >
          Start
        </Button>
      </Box>
    </Stack>
  );
};
