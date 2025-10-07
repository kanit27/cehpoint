// lib/axios.ts
import axios from "axios";

// The baseURL is no longer needed as we are in a monolithic app.
// API calls will be made to relative paths like '/api/users'.
const axiosInstance = axios.create({});

export default axiosInstance;