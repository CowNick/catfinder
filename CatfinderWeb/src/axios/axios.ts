import axios, { type AxiosInstance } from "axios";

export function getAxiosWrapper() : AxiosInstance
{
	const defaultInstance = axios.create();
	defaultInstance.interceptors.request.use((config) => {
		config.baseURL = import.meta.env.APP_API_URL_BASE;
		// config.headers.Authorization = "from vuex"
		return config;
	});

	return defaultInstance;
}

