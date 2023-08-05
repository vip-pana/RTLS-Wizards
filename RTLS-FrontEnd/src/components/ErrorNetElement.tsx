import { WarningIcon } from "@chakra-ui/icons";
import { Button, Heading, Stack } from "@chakra-ui/react";

export const ErrorNetElement = ({ api }: { api: () => Promise<void> }) => {
  return (
    <Stack h={"70vh"} alignItems={"center"}>
      <WarningIcon w={8} h={8} color="red.500" mt={100} />
      <Heading mb={5}>Something went wrong!</Heading>
      <Button colorScheme="red" mb={5} onClick={api}>
        Refresh
      </Button>
    </Stack>
  );
};
