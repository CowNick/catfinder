import Map from "@arcgis/core/Map"
import FeatureLayer from "@arcgis/core/layers/FeatureLayer"
import { SimpleRenderer } from "@arcgis/core/renderers"
import SpatialReference from "@arcgis/core/geometry/SpatialReference"
import { SimpleLineSymbol } from "@arcgis/core/symbols"
import Color from "@arcgis/core/Color"
import { MapUrl } from '@/map/ArcgisUrl'

export class StreetLayer
{
    private _streetlayer? : FeatureLayer;

    displayStreetEdit(map: Map)
    {
        this._streetlayer =  new FeatureLayer({
            id: "street_layer",
            spatialReference: SpatialReference.WebMercator,
			source: [],
			objectIdField: "ObjectId",
			fields: [
				{name: "ObjectId", type:"integer" },
				{name:"fclass", type:"string"},
				{name:"name", type: "string"}
			],
			geometryType:"polyline",
			renderer: new SimpleRenderer({
				symbol: this.getStreetSymbol()
			}),
            url: MapUrl.MapEditingStreetUrl,
		});

        map.add(this._streetlayer);
    }

    private getStreetSymbol()
    {
        const color = Color.fromHex('#6B7CFC');
        color.a = 1;
    
        return new SimpleLineSymbol({
            color: color,
            width: 2,
        });
    }
}