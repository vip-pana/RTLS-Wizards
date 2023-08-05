import { Flex, IconButton, Text, Link, useColorMode } from "@chakra-ui/react";
import { CgSun, CgMoon } from "react-icons/cg";

export const BottomBox = ({ collapse }: { collapse: boolean }) => {
  const { colorMode, toggleColorMode } = useColorMode();

  return (
    <Flex
      shadow={!collapse ? "xl" : "none"}
      borderRadius="full"
      w="full"
      p={2}
      alignItems="center"
      justifyContent="space-between"
      gap={2}
      flexDirection={collapse ? "column-reverse" : "row"}
    >
      {!collapse && (
        <Flex
          w="full"
          flexDirection="column"
          gap={4}
          justifyContent="center"
          alignItems="flex-start"
        >
          <Link
            href={"https://github.com/AptarCodeForArduino"}
            isExternal
            _hover={{
              textDecoration: "none",
            }}
          >
            <Text fontSize="sm" fontWeight="bold" pb="0" lineHeight={0}>
              Theme
            </Text>
          </Link>
        </Flex>
      )}
      <IconButton
        aria-label="Settings"
        icon={colorMode === "light" ? <CgSun /> : <CgMoon />}
        borderRadius="full"
        color="gray.400"
        variant="ghost"
        onClick={() => toggleColorMode()}
        fontSize={20}
      />
    </Flex>
  );
};
