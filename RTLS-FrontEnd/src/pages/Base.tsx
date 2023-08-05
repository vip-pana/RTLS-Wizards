import { Text, Box, HStack, IconButton, useMediaQuery } from "@chakra-ui/react";
import { Outlet } from "react-router-dom";
import { MdMenu } from "react-icons/md";
import { useEffect, useState } from "react";
import { Sidebar } from "../components/base/Sidebar";

export const Base = () => {
  const [collapse, setCollapse] = useState(false);
  const [isLargerThan1280] = useMediaQuery(["(min-width: 1280px)"]);

  useEffect(() => {
    if (isLargerThan1280 == false) {
      setCollapse(true);
    }
  }, [isLargerThan1280]);

  return (
    <HStack w={"full"} h={"100vh"} pl={2} pt={2}>
      <Sidebar collapse={collapse} />
      {/* button for collapse */}
      <Box as="main" w="full" h="full" shadow={"2xl"} borderRadius="3xl">
        <IconButton
          aria-label="Menu Colapse"
          icon={<MdMenu />}
          top={10}
          left={6}
          onClick={() => {
            setCollapse(!collapse);
          }}
        />
        <Box h={"80%"} ml={20}>
          <Outlet />
        </Box>
        <Text position={"absolute"} top={10} right={6}>
          {sessionStorage.getItem("site")}
        </Text>
      </Box>
    </HStack>
  );
};
