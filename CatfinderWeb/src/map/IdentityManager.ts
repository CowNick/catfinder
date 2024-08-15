import IdentityManager from "@arcgis/core/identity/IdentityManager"
import { getAxiosWrapper } from "@/axios/axios"
import { HttpStatusCode } from "axios"
import { MapUrl } from '@/map/ArcgisUrl'
import { type ArcgisToken } from "@/api/model"


export async function ConfigArcGISIdentityManager()
{
	const axiosInstance = getAxiosWrapper();
	const response = await axiosInstance.post<ArcgisToken>("api/arcgis/token");
	if (response.status !== HttpStatusCode.Ok)
	{
		return;
	}
	const credentialsJSON = {
		serverInfos: [{
			server: import.meta.env.APP_ARCGIS_SERVER_URL_BASE,
			tokenServiceUrl: `${import.meta.env.APP_ARCGIS_SERVER_URL_BASE}/arcgis/admin/generateToken`,
			adminTokenServiceUrl: `${import.meta.env.APP_ARCGIS_SERVER_URL_BASE}/arcgis/admin/generateToken`,
			shortLivedTokenValidity: 60,
			currentVersion: 11.2,
			hasServer: true
		}],
		credentials: [{
			userId: response.data.UserName,
			server: `${import.meta.env.APP_ARCGIS_SERVER_URL_BASE}/arcgis`,
			token: response.data.Token,
			expires: +response.data.Expires,
			validity: 60,
			isAdmin: false,
			ssl: false,
			creationTime: response.data.Expires - (60000 * 60),
			scope: "server",
			resources: [
				MapUrl.MapEditingPOIUrl,
				MapUrl.MapEditingStreetUrl
			]
		}]
	};

	IdentityManager.destroyCredentials();
	IdentityManager.initialize(credentialsJSON);
}
