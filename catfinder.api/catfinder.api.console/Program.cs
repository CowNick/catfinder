// See https://aka.ms/new-console-template for more information

using catfinder.api.picture.Utils;

var y1 = ImageSimilarityUtil.ProduceFinger(@"D:\GIS Training\FinallyData\TestImage\1.jpg");
var y2 = ImageSimilarityUtil.ProduceFinger(@"D:\GIS Training\FinallyData\TestImage\2.jpg");
var y3 = ImageSimilarityUtil.ProduceFinger(@"D:\GIS Training\FinallyData\TestImage\3.jpg");
var y4 = ImageSimilarityUtil.ProduceFinger(@"D:\GIS Training\FinallyData\TestImage\4.jpg");
var z = ImageSimilarityUtil.HammingDistance(y1, y2);

Console.WriteLine("Hello, World!");
