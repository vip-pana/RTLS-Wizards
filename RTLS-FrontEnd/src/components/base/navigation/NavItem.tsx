import { Link, Box, Button, ListIcon } from "@chakra-ui/react";
import { NavLink, NavigateFunction, useLocation } from "react-router-dom";
import { navItem } from "../../../features/Interface";

export const NavItem = ({
  item,
  navigate,
  collapse,
  colorScheme,
}: {
  item: navItem;
  navigate: NavigateFunction;
  collapse: boolean;
  colorScheme: string;
}) => {
  const { label, icon, path } = item;
  const location = useLocation();

  return (
    <Box
      display="flex"
      alignItems="center"
      my={collapse ? 4 : 6}
      justifyContent="center"
    >
      {collapse ? (
        <Button
          rounded={"3xl"}
          variant={"ghost"}
          onClick={() => {
            if (path === "") {
              sessionStorage.removeItem("site");
              sessionStorage.removeItem("machineName");
              window.location.reload();
            } else {
              navigate(path);
            }
          }}
        >
          {/* Collapsed item */}
          <Link
            gap={2}
            display="flex"
            alignItems="center"
            fontWeight="medium"
            w="full"
            justifyContent={collapse ? "center" : ""}
            _hover={{ textDecoration: "none", color: colorScheme }}
          >
            <ListIcon as={icon} fontSize={22} m="0" />
          </Link>
        </Button>
      ) : (
        <>
          <Box
            gap={2}
            display="flex"
            alignItems="center"
            _hover={{ textDecoration: "none", color: colorScheme }}
            fontWeight="medium"
            color={location.pathname === path ? colorScheme : "gray"}
            w="full"
            justifyContent={collapse ? "center" : ""}
          >
            {/* expanded item */}
            <ListIcon
              as={icon}
              fontSize={22}
              m="0"
              onClick={() => {
                if (path === "") {
                  sessionStorage.removeItem("site");
                  sessionStorage.removeItem("machineName");
                  window.location.reload();
                } else {
                  navigate(path);
                }
              }}
            />
            {!collapse && path === "" ? (
              <NavLink
                to={path}
                onClick={() => {
                  sessionStorage.removeItem("site");
                  localStorage.removeItem("isSetted");
                  sessionStorage.removeItem("machineName");
                  window.location.reload();
                }}
              >
                {label}
              </NavLink>
            ) : (
              <NavLink to={path}>{label}</NavLink>
            )}
          </Box>
        </>
      )}
    </Box>
  );
};
