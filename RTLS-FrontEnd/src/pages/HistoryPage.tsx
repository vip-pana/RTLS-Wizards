import {
  Heading,
  Stack,
  Box,
  Select,
  SimpleGrid,
  Input,
  Button,
  useToast,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableContainer,
} from "@chakra-ui/react";
import { EditIcon } from '@chakra-ui/icons'
import { useEffect, useState } from "react";
import { SearchIcon } from "@chakra-ui/icons";
import axiosCloud, { ENDPOINT } from "../features/AxiosCloud";
import { Site, Machine, History } from "../features/Interface";
import { AxiosError } from "axios";

export const HistoryPage = () => {
  const [date, setDate] = useState<string>();
  const toast = useToast();
  const [machineList, setMachineList] = useState<Machine[]>();
  const [machine,setMachine] = useState();
  const [site, setSite] = useState("");
  const [siteList, setSiteList] = useState<Site[]>();
  const [loading, setLoading] = useState<boolean>(false);
  const [historyList, setHistoryList] = useState<History[]>();

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
  
  const getMachineList = async () => {
    setLoading(true);
    await axiosCloud
      .get(ENDPOINT.machine)
      .then((res) => {
        setMachineList(res.data);
        setLoading(false);
      })
      .catch((err: AxiosError) => {
        setLoading(false);
        if (err.message == "Network Error" || err.code == "ERR_NETWORK") {
          toast({
            status: "error",
            title: "Server Error",
            variant: "solid",
            duration: 3000,
            isClosable: true,
            position: "top-right",
          });
        }
      });
  };
  const handleSubmit = async () => {
    
    console.log(site);
    console.log(machine);
    if (machine != "" && site !="") {
      setLoading(true);
      console.log(date?.length)
      console.log(date);
      console.log(ENDPOINT.history + "/" + site + "/" + machine + "/" + date);
      await axiosCloud
        .get(ENDPOINT.history + "/" + site + "/" + machine + "/" + date)
        .then((res) => {
          setHistoryList(res.data);
          console.log(historyList);
          setLoading(false);
        })
        .catch((err: AxiosError) => {
          setLoading(false);
          console.log("err.code");
          if (err.message == "Network Error" || err.code == "ERR_NETWORK") {
            toast({
              status: "error",
              title: "Server Error",
              variant: "solid",
              duration: 3000,
              isClosable: true,
              position: "top-right",
            });
          }
        });
    } else {
      toast({
        status: "error",
        title: "Please, select a site and a machine.",
        variant: "solid",
        duration: 3000,
        isClosable: true,
        position: "top-right",
      });
    }
  }

  useEffect(
    () => {
      getMachineList();
      getSiteList();
    },[]
  );

    // Esegui handleSubmit quando il valore di 'date' cambia
    useEffect(() => {
      if (machine != "" && site != "" && date) {
        setDate(prevDate => {
          console.log(prevDate?.length)
          return prevDate?.length == 0 ? "null" : prevDate.slice(0,10)});
      }
    }, [date]);
    
  return (
    <>
      <Heading marginBottom={5}>History</Heading>
      <Stack width={"100%"} height={"100%"} padding={3} alignItems={"center"}>
        <SimpleGrid columns={3} spacing={5} marginBottom={5} width={"90%"}>
          <Box>
            <Select placeholder="Site"
                    required
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
          </Box>
          <Box>
            <Select placeholder="Machine" 
                    required
                    onChange={(e) => {
                      setMachine(e.target.value);
                    }}>
                      {machineList?.map((machine, index) => (
                        <option key={index} value={machine.name}>
                          {machine.name}
                        </option>
                      ))}

                    </Select>
          </Box>
          <Box>
            <Input
              placeholder="Select Date and Time"
              size="md"
              type="datetime-local"
              onChange={(e) => {
                setDate(e.target.value);
              }}
            />
          </Box>
        </SimpleGrid>
        <Button variant={"solid"} colorScheme="teal" rightIcon={<SearchIcon />} isLoading={loading} onClick={handleSubmit}>
          Search
        </Button>
      <TableContainer padding={5} alignItems={"center"} >
        <Table variant='simple' size="lg" padding={5} margin={5}>
          <Thead>
            <Tr>
              <Th>SITE</Th>
              <Th>MACHINE</Th>
              <Th>DATE RECORDING</Th>
              <Th> </Th>
            </Tr>
          </Thead>
          <Tbody>
          {historyList?.map((recording, index) => (
            <Tr key={index}>
              <Td>{recording.site.name}</Td>
              <Td>{recording.machine.name}</Td>
              <Td isNumeric>{recording.dateEnd.slice(0,10) + "  " + recording.dateEnd.slice(11,19)}</Td>
              <Td>
                <Button 
                  colorScheme='teal'
                  size="sm"
                  rightIcon={<EditIcon />}>
                    View
                </Button>
              </Td>
            </Tr>  
          ))}       
          </Tbody>
        </Table>
      </TableContainer>
      </Stack>
    </>
  );
};
