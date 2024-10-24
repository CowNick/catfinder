import arcpy
import zipfile
import os

# sde_path = arcpy.GetParameterAsText(0)
# zip_path = arcpy.GetParameterAsText(1)

sde_path = r"D:\GIS Training\arcgis\ArcTutor\CatTest.sde"
zip_path = r"D:\GIS Training\FinallyData\shanghai-latest-free.shp.zip"

def update_street_table(zip_file_path, sde_path):
    try:
        extract_path = os.path.dirname(zip_file_path) + r'\UpdateMap'
        # 解压 ZIP 文件
        with zipfile.ZipFile(zip_file_path, 'r') as zip_ref:
            zip_ref.extractall(extract_path)

        # 获取解压后的 SHP 文件路径
        shp_file = [f for f in os.listdir(extract_path) if f.endswith('.shp')]

        if not shp_file:
            raise FileNotFoundError("未找到 SHP 文件")

        shp_file_path = os.path.join(extract_path, "gis_osm_railways_free_1.shp")

        street_path = os.path.join(sde_path, "Transportation", "Streets")

        arcpy.Delete_management(os.path.join(sde_path, "Transportation", "Streets_ND"))
        arcpy.Delete_management(os.path.join(sde_path, "Transportation", "Streets_ND_Junctions"))

        # 删除 street 表中的原始数据
        arcpy.DeleteRows_management(street_path)

        # 定义投影转换
        wgs84_sr = arcpy.SpatialReference(4326)  # WGS84
        web_mercator_sr = arcpy.SpatialReference(3857)  # Web Mercator

        # 创建临时要素类以存储投影后的数据
        projected_shp = "in_memory/projected_shp"

        # 投影转换
        arcpy.Project_management(shp_file_path, projected_shp, web_mercator_sr)

        # 追加新的数据
        arcpy.Append_management(projected_shp, street_path, "NO_TEST")

        # 重新构建网络
        arcpy.na.CreateNetworkDataset(os.path.join(sde_path, "Transportation"), "Streets_ND", "DBO.Streets", "ELEVATION_FIELDS")

        arcpy.Delete_management(projected_shp)
    except arcpy.ExecuteError:
        errorLog = arcpy.GetMessages()
        raise SystemError()

    except Exception as e:
        tb = sys.exc_info()[2]
        tbinfo = traceback.format_tb(tb)[0]
        raise SystemError()

# 示例调用
update_street_table(zip_path, sde_path)