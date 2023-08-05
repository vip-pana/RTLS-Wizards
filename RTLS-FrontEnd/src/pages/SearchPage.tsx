import {
  Button,
  HStack,
  Heading,
  Input,
  Select,
  Stack,
  useToast,
} from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { Site } from "../features/Interface";
import { AxiosError } from "axios";
import axiosCloud, { ENDPOINT } from "../features/AxiosCloud";

export const SearchPage = () => {
  const [site, setSite] = useState("");

  const [siteList, setSiteList] = useState<Site[]>();
  const [recordList, setRecordList] = useState<Site[]>();

  const [loading, setLoading] = useState<boolean>(false);
  const toast = useToast();

  const getSiteList = () => {
    setLoading(true);
    axiosCloud
      .get(ENDPOINT.site)
      .then((res) => {
        setSiteList(res.data);
        setLoading(false);
      })
      .catch((err: AxiosError) => {
        setLoading(false);
        if (err.message == "Network Error" || err.code == "ERR_NETWORK") {
          toast({
            status: "error",
            title: "Server Error",
            duration: 3000,
            isClosable: true,
            position: "top-right",
          });
        }
      });
  };

  const handleSubmit = () => {
    if (site != "") {
      sessionStorage.setItem("site", site);
      location.reload();
    } else {
      toast({
        status: "error",
        title: "Please, select a site.",
        duration: 3000,
        isClosable: true,
        position: "top-right",
      });
    }
  };

  useEffect(
    () => getSiteList(),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  return (
    <Stack alignItems={"center"}>
      <Heading textAlign={"center"} mb={50}>
        Select the site
      </Heading>
      <HStack minW={500}>
        <Select
          variant={"filled"}
          placeholder="ex. demo site"
          onChange={(e) => {
            setSite(e.target.value);
          }}
        >
          {siteList?.map((site, index) => (
            <option key={index} value={site.name}>
              {site.name}
            </option>
          ))}
        </Select>
        <Input
          placeholder="Select Date and Time"
          size="md"
          type="datetime-local"
        />
        <Input
          placeholder="Select Date and Time"
          size="md"
          type="datetime-local"
        />
        <Select
          variant={"filled"}
          placeholder="ex. Machine 123"
          onChange={(e) => {
            setSite(e.target.value);
          }}
        >
          {siteList?.map((site, index) => (
            <option key={index} value={site.name}>
              {site.name}
            </option>
          ))}
        </Select>
        <Button colorScheme="teal" onClick={handleSubmit} isLoading={loading}>
          Search
        </Button>
      </HStack>
    </Stack>
  );
};
