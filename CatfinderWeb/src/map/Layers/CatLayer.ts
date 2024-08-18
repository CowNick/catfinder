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
    catLayer? : GraphicLayer;

    initLater(map: Map)
    {
        this.catLayer = new GraphicLayer({ id: "cat_point_layer"});
        map.add(this.catLayer);
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
        let points = Cats.map((cat: { XCrood: any; YCoord: any }) => new Graphic({
            geometry: new Point({ longitude: cat.XCrood, latitude: cat.YCoord }),
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