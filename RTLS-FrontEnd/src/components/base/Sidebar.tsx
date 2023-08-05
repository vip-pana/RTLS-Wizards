import { Box, Flex } from "@chakra-ui/react";
import { NavigateFunction, useNavigate } from "react-router-dom";
import { Navigation } from "./navigation/Index";
import { Logo } from "./Logo";
import { BottomBox } from "./BottomBox";

export const Sidebar = ({ collapse }: { collapse: boolean }) => {
  const navigate: NavigateFunction = useNavigate();

  return (
    <>
      <Flex
        as={"aside"}
        w={"full"}
        h={"full"}
        position={"relative"}
        maxW={!collapse ? 200 : 57}
        alignItems={"center"}
        p={4}
        flexDirection={"column"}
        justifyContent={"space-between"}
        borderRadius={"3xl"}
        boxShadow={"2xl"}
      >
        <Box w="full">
          <Logo navigate={navigate} collapse={collapse} />
          <Navigation navigate={navigate} collapse={collapse} />
          <BottomBox collapse={collapse} />
        </Box>
      </Flex>
    </>
  );
};
