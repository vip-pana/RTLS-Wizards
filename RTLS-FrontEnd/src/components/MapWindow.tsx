import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { Box, Skeleton, useToast, Text, Stack } from "@chakra-ui/react";
import { Link } from "react-router-dom";

// LEAFLEET
import {
  MapContainer,
  ImageOverlay,
  Marker,
  Popup,
  Polyline,
} from "react-leaflet";
import L, { LatLng, LatLngBoundsExpression } from "leaflet";
import "leaflet/dist/leaflet.css";
import cartesiano from "../assets/white.png";
import userIcon from "../assets/tagIcon.png";
import sensorIcon from "../assets/sensorIcon.png";

import axiosCloud, { ENDPOINT } from "../features/AxiosCloud";
import { device, position } from "../features/Interface";
import { AxiosError } from "axios";

export const MapWindow = ({
  deviceDetail,
  setDeviceDetail,
  getTimeFrequency,
}: {
  deviceDetail: null | device;
  setDeviceDetail: Dispatch<SetStateAction<device | undefined>> | undefined;
  getTimeFrequency: () => number;
}) => {
  const mapSettings: {
    crs: L.CRS;
    tagMarker: L.Icon;
    sensorMarker: L.Icon;
    zoom: number;
    center: L.LatLngExpression | undefined;
    imageBounds: LatLngBoundsExpression;
  } = {
    crs: L.CRS.Simple,
    tagMarker: L.icon({
      iconUrl: userIcon,
      iconSize: [35, 35],
      iconAnchor: [18, 32],
      popupAnchor: [0.5, -25],
    }),
    sensorMarker: L.icon({
      iconUrl: sensorIcon,
      iconSize: [35, 35],
      iconAnchor: [0, 0],
      popupAnchor: [18, 15],
    }),
    zoom: 6,
    center: [3.5, 6],
 
  };
  const [tagList, setTagList] = useState<device[]>();
  const [anchorList, setAnchorList] = useState<device[]>();

  const [loading, setLoading] = useState(true);
  const toast = useToast();

  const [timer, setTimer] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      if (timer > 0) {
        setTimer(timer - 1);
      } else {
        setTimer(getTimeFrequency() / 1000);
      }
    }, 1000);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timer]);

  const getDevices = async () => {
    if (deviceDetail != null && setDeviceDetail != null) {
      await axiosCloud
        .get(deviceDetail.type + "/mac/" + deviceDetail.macAddress)
        .then((result) => {
          setDeviceDetail(result.data);
          checkZeroPostitions(deviceDetail);
          setLoading(false);
        })
        .catch((error: AxiosError) => {
          if (error.message == "Network Error") {
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
      await axiosCloud
        .get(ENDPOINT.tag + "/site/" + sessionStorage.getItem("site"))
        .then((result) => {
          let resultFiltered: device[] = result.data;
          resultFiltered = resultFiltered.filter((tag) => tag.positions[0]);
          setTagList(resultFiltered);
        })
        .catch((error: AxiosError) => {
          if (error.message == "Network Error") {
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
      await axiosCloud
        .get(ENDPOINT.anchor + "/site/" + sessionStorage.getItem("site"))
        .then((result) => {
          setAnchorList(result.data);
          setLoading(false);

          const checked: device[] = result.data;
          checked.map((anchor) => checkZeroPostitions(anchor));
        });
    }
  };

  // check if anchors have position x or y == 0
  const checkZeroPostitions = (device: device) => {
    if (device.positions[0].x == 0 || device.positions[0].y == 0) {
      toast({
        status: "warning",
        title: "Positions error",
        description: `WARNING: The ${device.type} ${device.macAddress} position is set to 0, please change the coordinates. Be sure to provide valid values to ensure proper tracking.`,
        duration: 3000,
        isClosable: true,
        position: "top-right",
      });
    }
  };

  // create a list of positions for tag
  let tagPositionsList: LatLng[] = [];
  const savePositions = (positions: position[]) => {
    for (let index = 0; index < positions.length; index++) {
      const newPos = new LatLng( positions[index].y,positions[index].x);
      tagPositionsList.push(newPos);
    }
  };

  // update positions by a timer
  useEffect(() => {
    const interval = setInterval(() => {
      getDevices();
    }, getTimeFrequency());
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // first update positions
  useEffect(() => {
    getDevices();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      {/* the timer */}
      <Text textAlign={"right"}>Next Request: {timer} s</Text>

      {!loading ? (
        <>
        <MapContainer
          center={mapSettings.center}
          zoom={mapSettings.zoom}
          crs={mapSettings.crs}
          minZoom={1}
          maxZoom={6}
          zoomSnap={0.1}
          dragging={false}
          style={{ width: "100%", height: "90%" }}
        >
          {deviceDetail?.positions[0] ? (
            <Marker
              position={
                new LatLng(
                  deviceDetail.positions[0].y,
                  deviceDetail.positions[0].x
                )
              }
              icon={
                deviceDetail.type == "anchor"
                  ? mapSettings.sensorMarker
                  : mapSettings.tagMarker
              }
            ></Marker>
            
          ) : (
            <></>
          )}

          {anchorList?.map((anchor, index) => (
            <Marker
              key={index}
              position={
                new LatLng(anchor.positions[0].y,anchor.positions[0].x)
              }
              icon={mapSettings.sensorMarker}
            >
                        <HTMLTableRowElement>Y</HTMLTableRowElement>

              <Popup>
                <Link to={`device-grid/${anchor.type}/${anchor.macAddress}`}>
                  {anchor.macAddress}
                </Link>
              </Popup>
            </Marker>
          ))}

          {tagList?.map((tag, index) => (
            <Box key={index}>
              <Marker
                position={
                  new LatLng(
                    tag.positions[tag.positions.length - 1].y,
                    tag.positions[tag.positions.length - 1].x
                  )
                }
                icon={mapSettings.tagMarker}
              >
                <Popup>
                  <Link to={`/device-grid/${tag.type}/${tag.macAddress}`}>
                    {tag.macAddress}
                  </Link>
                </Popup>
              </Marker>
              <>{savePositions(tag.positions)}</>
              <Polyline positions={tagPositionsList}></Polyline>
              <>{(tagPositionsList = [])}</>
            </Box>
          ))}
        </MapContainer>
        <Text textAlign={"center"} p={3}>X</Text>
        </>
      ) : (
        <>
        <Skeleton height="90%" />
        <Text textAlign={"center"} p={3}>X</Text>
        </>
      )}
    </>
  );
};

