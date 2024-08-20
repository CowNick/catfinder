export class MapUrl
{
	private static readonly CommonRestPath = "arcgis/rest/services/catfinder";
	static MapEditingPOIUrl = `${(import.meta.env.APP_ARCGIS_SERVER_URL_BASE)}/${MapUrl.CommonRestPath}/MapEditing/FeatureServer/${import.meta.env.APP_LAYER_POI_GDB_ID}`;
	static MapEditingStreetUrl = `${(import.meta.env.APP_ARCGIS_SERVER_URL_BASE)}/${MapUrl.CommonRestPath}/MapEditing/FeatureServer/${import.meta.env.APP_LAYER_POI_STREET_GDB_ID}`;
	static NARouteUrl = `${(import.meta.env.APP_ARCGIS_SERVER_URL_BASE)}/${MapUrl.CommonRestPath}/NetworkAnalysis/NAServer/route`;
}