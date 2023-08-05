import { SiGooglemaps } from "react-icons/si";
import { HiSearch } from "react-icons/hi";
import { HiTag } from "react-icons/hi";
import { FaDoorOpen } from "react-icons/fa";
import { RepeatClockIcon } from "@chakra-ui/icons";

export const items = [
  {
    label: "Map",
    icon: SiGooglemaps,
    path: "/",
  },
  {
    label: "Devices",
    icon: HiTag,
    path: "/device-grid",
  },
  {
    label: "Search Rec",
    icon: HiSearch,
    path: "/Search",
  },
  {
    label: "History",
    icon: RepeatClockIcon,
    path: "/history",
  },
  {
    label: "Logout site",
    icon: FaDoorOpen,
    path: "",
  },
];
