import {
  Card,
  CardBody,
  CardHeader,
  HStack,
  Heading,
  IconButton,
  Skeleton,
  SkeletonCircle,
  Table,
  TableContainer,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
  useToast,
} from "@chakra-ui/react";
import { FaSearch } from "react-icons/fa";
import { useEffect, useState } from "react";
import axiosCloud, { ENDPOINT } from "../features/AxiosCloud.ts";
import { device } from "../features/Interface.tsx";
import { useNavigate } from "react-router-dom";
import { AxiosError } from "axios";

export const DeviceGrid = ({ type }: { type: string }) => {
  const [loading, setLoading] = useState(true);
  const [deviceList, setDeviceList] = useState<device[]>();
  const navigate = useNavigate();
  const toast = useToast();

  useEffect(() => {
    const interval = setInterval(() => {
      getDevice();
    }, getTimeFrequency());
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const getTimeFrequency = () => {
    const timer = localStorage.getItem("refreshingTime");
    if (timer) {
      return parseInt(timer);
    } else {
      return 2000;
    }
  };

  useEffect(() => {
    getDevice();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const getDevice = async () => {
    await axiosCloud
      .get(
        (type == "anchor" ? ENDPOINT.anchor : ENDPOINT.tag) +
          "/site/" +
            sessionStorage.getItem("site")
      )
      .then((result) => {
        setDeviceList(result.data);
        setLoading(false);
      })
      .catch((error: AxiosError) => {
        if (error.message == "Network Error") {
          toast({
            status: "error",
            title: "Server Error",
            variant: "solid",
            duration: 5000,
            isClosable: true,
            position: "top-right",
          });
        }
      });
  };

  return (
    <>
      <Card mt={50} mr={50} minW={"40%"} shadow={"2xl"}>
        <CardHeader>
          <HStack>
            <Heading>{type == "anchor" ? "Anchor" : "Tag"}</Heading>
          </HStack>
        </CardHeader>
        <CardBody>
          <TableContainer>
            <Table variant="striped" colorScheme="blackAlpha">
              <Thead>
                <Tr>
                  <Th>mac Address</Th>
                  <Th textAlign={"center"}>X</Th>
                  <Th textAlign={"center"}>Y</Th>
                  <Th>Action</Th>
                </Tr>
              </Thead>
              <Tbody>
                {loading ? (
                  <>
                    <Tr>
                      <Td>
                        <Skeleton height="20px" />
                      </Td>
                      <Td>
                        <Skeleton height="20px" />
                      </Td>
                      <Td>
                        <Skeleton height="20px" />
                      </Td>
                      <Td>
                        <SkeletonCircle size="10" />
                      </Td>
                    </Tr>
                    <Tr>
                      <Td>
                        <Skeleton height="20px" />
                      </Td>
                      <Td>
                        <Skeleton height="20px" />
                      </Td>
                      <Td>
                        <Skeleton height="20px" />
                      </Td>
                      <Td>
                        <SkeletonCircle size="10" />
                      </Td>
                    </Tr>
                  </>
                ) : (
                  <>
                    {deviceList?.map((device, index) => (
                      <Tr key={index}>
                        <Td>{device.macAddress}</Td>
                        <Td textAlign={"center"}>
                          {device.positions[0]
                            ? `${device.positions[0].x.toFixed(2)}`
                            : "NaN"}
                        </Td>
                        <Td textAlign={"center"}>
                          {device.positions[0]
                            ? `${device.positions[0].y.toFixed(2)}`
                            : "NaN"}
                        </Td>
                        <Td>
                          <IconButton
                            size={"xs"}
                            shadow={"md"}
                            borderRadius={"3xl"}
                            colorScheme="teal"
                            icon={<FaSearch />}
                            aria-label={"detail"}
                            onClick={() =>
                              navigate(`${type}/${device.macAddress}`)
                            }
                          />
                        </Td>
                      </Tr>
                    ))}
                  </>
                )}
              </Tbody>
            </Table>
          </TableContainer>
        </CardBody>
      </Card>
    </>
  );
};
