import { IconType } from "react-icons";

export interface navItem {
  label: string;
  icon: IconType;
  path: string;
}

export interface device {
  id: string;
  macAddress: string;
  positions: position[];
  siteName: string;
  type: string;
}

export interface position {
  id: string;
  macAddress: string;
  timestamp: string;
  type: string;
  x: number;
  y: number;
}

export interface simplePosition {
  x: number;
  y: number;
}

export interface DeviceCardProps {
  macAddr?: string;
}

export interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export interface Site {
  name: string;
}

export interface Machine{
  name: string;
  siteName: string;
}

export interface History{
  tags: device[];
  site: Site;
  machine: Machine;
  anchors: device[];
  dateStart: string;
  dateEnd: string;
}
