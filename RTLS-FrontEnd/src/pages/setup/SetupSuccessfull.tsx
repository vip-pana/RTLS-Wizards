import { CheckIcon } from "@chakra-ui/icons";
import { Button, Heading, Stack } from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";

export const SetupSuccessfull = () => {
  const navigate = useNavigate();

  return (
    <Stack h={"70vh"} alignItems={"center"}>
      <CheckIcon w={8} h={8} color="teal" mt={100} />
      <Heading mb={5}>Devices succesfully setted!</Heading>
      <Button
        colorScheme="teal"
        mb={5}
        onClick={() => {
          localStorage.setItem("isSetted", "true");
          navigate("/");
        }}
      >
        Dashboard
      </Button>
    </Stack>
  );
};
