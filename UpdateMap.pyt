# -*- coding: utf-8 -*-

import arcpy
import os
import datetime
import zipfile
import sys
import traceback
import configparser
import requests


class Toolbox(object):

    def __init__(self):
        """Define the toolbox (the name of the toolbox is the name of the
        .pyt file)."""
        self.label = "UpdateMap"
        self.alias = ""

        # List of tool classes associated with this toolbox
        self.tools = [UpdateMap]


class UpdateMap(object):

    def __init__(self):
        """Define the tool (tool name is the name of the class)."""
        self.label = "UpdateMap"
        self.description = "Update Map"
        self.canRunInBackground = False

    def getParameterInfo(self):
        """Define parameter definitions"""
        sde_path = arcpy.Parameter(displayName="SDE Path",
                                     name="sde_path",
                                     datatype="String",
                                     parameterType="Required",
                                     direction="Input")

        zip_path = arcpy.Parameter(displayName="Zip Path",
                                   name="zip_path",
                                   datatype="String",
                                   parameterType="Required",
                                   direction="Input")

        params = [sde_path, zip_path]
        return params

    def isLicensed(self):
        """Set whether tool is licensed to execute."""
        return True

    def updateParameters(self, parameters):
        """Modify the values and properties of parameters before internal
        validation is performed.  This method is called whenever a parameter
        has been changed."""
        return

    def updateMessages(self, parameters):
        """Modify the messages created by internal validation for each tool
        parameter.  This method is called after internal validation."""
        return

    def execute(self, parameters, messages):
        """The source code of the tool."""
        sde_path = str(parameters[0].value)
        zip_path = str(parameters[1].value)
        update_street_table(zip_path, sde_path)
        return

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

        try:
            arcpy.AcceptConnections(sde_path, False)
            arcpy.DisconnectUser(sde_path, "ALL")
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
        finally:
            arcpy.AcceptConnections(sde_path, True)
    except arcpy.ExecuteError:
        errorLog = arcpy.GetMessages()
        raise SystemError()

    except Exception as e:
        tb = sys.exc_info()[2]
        tbinfo = traceback.format_tb(tb)[0]
        raise SystemError()
