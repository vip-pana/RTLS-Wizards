import axios from "axios";

const axiosCloud = axios.create({
  // cambia successivamente con URL cloud
  baseURL: "http://localhost:7071/api/",
});
export default axiosCloud;

export const ENDPOINT = {
  anchor: "anchor",
  tag: "tag",
  site: "site",
  machine: "machine",
  history: "history",
};
