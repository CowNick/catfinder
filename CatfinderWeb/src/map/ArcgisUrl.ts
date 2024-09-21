export class MapUrl
{
	private static readonly CommonRestPath = "arcgis/rest/services/catfinder";
	static readonly MapEditingPOIUrl = `${(import.meta.env.APP_ARCGIS_SERVER_URL_BASE)}/${MapUrl.CommonRestPath}/MapEditing/FeatureServer/${import.meta.env.APP_LAYER_POI_ID}`;
	static readonly MapEditingStreetUrl = `${(import.meta.env.APP_ARCGIS_SERVER_URL_BASE)}/${MapUrl.CommonRestPath}/MapEditing/FeatureServer/${import.meta.env.APP_LAYER_POI_STREET_ID}`;
	static readonly NARouteUrl = `${(import.meta.env.APP_ARCGIS_SERVER_URL_BASE)}/${MapUrl.CommonRestPath}/NetworkAnalysis/NAServer/route`;
	static readonly GeoLocatorUrl = `${(import.meta.env.APP_ARCGIS_SERVER_URL_BASE)}/${MapUrl.CommonRestPath}/CatLocator/GeocodeServer`;
	static readonly BuildNetworkGPUrl = `${(import.meta.env.APP_ARCGIS_SERVER_URL_BASE)}/${MapUrl.CommonRestPath}/BuildNetwork/GPServer/Build%20Network`;
}