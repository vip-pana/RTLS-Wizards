import { Flex, Image, Link } from "@chakra-ui/react";
import { NavigateFunction } from "react-router-dom";

export const Logo = ({
  navigate,
  collapse,
}: {
  navigate: NavigateFunction;
  collapse: boolean;
}) => {
  return (
    <Flex
      w="full"
      alignItems="center"
      flexDirection={collapse ? "row" : "column"}
    >
      <Link
        display="flex"
        alignItems="center"
        fontWeight={"bold"}
        fontSize={18}
        _hover={{ textDecoration: "none" }}
        onClick={() => navigate("/")}
      >
        <Image
          src="../../../ATR-02d63b4a.png"
          alt="Aptar logo"
          boxSize={22}
          mr={2}
        />
        {collapse ? <></> : <>RTLS APTAR</>}
      </Link>
    </Flex>
  );
};
