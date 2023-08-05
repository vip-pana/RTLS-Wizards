import {
  Table,
  TableContainer,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
} from "@chakra-ui/react";

import tagIcon from "../assets/tagIcon.png";
import sensorIcon from "../assets/sensorIcon.png";

export const LegendTable = () => {
  return (
    <TableContainer>
      <Table variant="simple">
        <Thead>
          <Tr>
            <Th>ICON</Th>
            <Th>LABEL</Th>
          </Tr>
        </Thead>
        <Tbody>
          <Tr>
            <Td>
              <img
                src={`${tagIcon}`}
                alt="tag icon"
                style={{ height: "30px" }}
              />
            </Td>
            <Td>Tag</Td>
          </Tr>
          <Tr>
            <Td>
              <img
                src={`${sensorIcon}`}
                alt="tag icon"
                style={{ height: "30px" }}
              />
            </Td>
            <Td>Sensor</Td>
          </Tr>
        </Tbody>
      </Table>
    </TableContainer>
  );
};
