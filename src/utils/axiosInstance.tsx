import Axios from "axios";
import { setupCache } from "axios-cache-interceptor";

const axiosInstance = setupCache(Axios);

export default axiosInstance;
