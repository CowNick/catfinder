export class MapUrl
{
	static MapEditingPOIUrl = `${(import.meta.env.APP_ARCGIS_SERVER_URL_BASE)}/arcgis/rest/services/catfinder/MapEditing/FeatureServer/${import.meta.env.APP_LAYER_POI_GDB_ID}`;
	static MapEditingStreetUrl = `${(import.meta.env.APP_ARCGIS_SERVER_URL_BASE)}/arcgis/rest/services/catfinder/MapEditing/FeatureServer/${import.meta.env.APP_LAYER_POI_STREET_GDB_ID}`;
}