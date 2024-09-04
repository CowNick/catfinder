import Map from "@arcgis/core/Map"
import Graphic from '@arcgis/core/Graphic'
import Point from '@arcgis/core/geometry/Point'
import { SimpleMarkerSymbol, SimpleLineSymbol } from "@arcgis/core/symbols"
import GraphicLayer from '@arcgis/core/layers/GraphicsLayer'
import Color from "@arcgis/core/Color"
import { HttpStatusCode } from "axios"
import { getAxiosWrapper } from "@/axios/axios"

export class CatGraphicLayer
{
	private _catLayer?: GraphicLayer;

	get catLayer(): GraphicLayer | undefined {
		return this._catLayer;
	}

	initLater(map: Map)
	{
		this._catLayer = new GraphicLayer({ id: "cat_point_layer"});
		map.add(this._catLayer);
	}

	async SearchCat(keywords: string) {
		let axiosInstance = getAxiosWrapper();
		let response = await axiosInstance.get(`api/cats?text=${keywords}`);
		if (response.status !== HttpStatusCode.Ok)
		{
			return;
		}
		this.addCatsInMap(response.data);
	}

	addCatsInMap(Cats: Array<any>) 
	{
		if (this.catLayer == null)
		{
			return;
		}
		this.catLayer.removeAll();
		if (Cats.length == 0)
		{
			return;
		}
		let points = Cats.map((cat: { xcoord: any, ycoord: any, name: string, id:  number, catPictures: string[] }) => new Graphic({
			geometry: new Point({ longitude: cat.xcoord, latitude: cat.ycoord }),
			attributes: {
			name: cat.name,
			ObjectId: cat.id,
			pictureUrl: cat.catPictures[0] || '',
			},
			symbol: this.getPoiSymbol()
		}));
		this.catLayer.addMany(points);
	}

	clearCatsInMap()
	{
		this.catLayer?.removeAll();
	}

	private getPoiSymbol()
	{
		const color = Color.fromHex('#6B7CFC');
		color.a = 1;
	
		return new SimpleMarkerSymbol({
			color: color,
			size: 16,
			outline: new SimpleLineSymbol({
				width: 1.333
			})
		});
	}
}