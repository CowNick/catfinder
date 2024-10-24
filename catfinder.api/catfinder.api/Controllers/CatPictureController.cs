using Asp.Versioning;
using catfinder.api.cat.DTO;
using catfinder.api.cat.Interface;
using catfinder.api.cat.Service;
using catfinder.api.orm.Context;
using catfinder.api.orm.Entities;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Text.Json;

namespace catfinder.api.Controllers
{
	[ApiController]
	[Route("api/CatPictures")]
	[ApiVersion("1.0", Deprecated = true)]
	public class CatPictureController : ControllerBase
	{
		private readonly ILogger<CatPictureController> _logger;

		private readonly ICatPictureService _catPictureService;
		private readonly IConfiguration _configuration;

		public CatPictureController(ILogger<CatPictureController> logger, ICatPictureService catPictureService, IConfiguration configuration)
		{
			_logger = logger;
			_catPictureService = catPictureService;
			_configuration = configuration;
		}

		[HttpPost]
		public async Task<IActionResult> UploadAsync(IFormCollection form)
		{
			if (!form.TryGetValue("cat", out var cat))
			{
				return BadRequest("Please open GPS position.");
			}

			var catDTO = JsonSerializer.Deserialize<CatDTO>(cat.ToString());
			if (catDTO == null)
			{
				return BadRequest("Please open GPS position.");
			}

			var files = form.Files
				.Where(r => r.FileName.EndsWith(".jpg", StringComparison.OrdinalIgnoreCase) || r.FileName.EndsWith(".png", StringComparison.OrdinalIgnoreCase))
				.Select(async r =>
				{
					using var memoryStream = new MemoryStream();
					await r.CopyToAsync(memoryStream);
					return (bytes: memoryStream.ToArray(), ext: Path.GetExtension(r.FileName));
				})
				.Select(t => t.Result)
				.ToArray();

			if (files.Count() > 0) 
			{
				var groups = await _catPictureService.UploadAsync(files, catDTO);
				await CalculateCatPolygon(groups);
			}
			
			return Created();
		}

		[HttpPost("search")]
		public async Task<CatPictureDTO[]> SearchAsync(IFormCollection form)
		{
			var file = form.Files[0];
			var path = Path.Combine(Path.GetTempPath(), Path.GetRandomFileName());
			using (var stream = System.IO.File.Create(path))
			{
				await file.CopyToAsync(stream);
			}

			return await _catPictureService.SearchAsync(path);
		}

		private async Task CalculateCatPolygon(List<CatPictureGroup> groups)
		{
			using var db = new CatDBContext();
			foreach (var group in groups)
			{
				var catId = group.NewCatPictures[0].CatId;
				if (group.ExistCatPictures.Count == 0)
				{
					if (group.NewCatPictures.Count < 3)
					{
						continue;
					}

					await GenerateCatBoundary(group.NewCatPictures, catId.Value);
				}

				var cat = await db.Cats.Include(r => r.CatPictures).FirstAsync(r => r.Id == catId);
				if (cat.CatPictures.Count < 3)
				{
					continue;
				}

				await GenerateCatBoundary(cat.CatPictures.ToList(), catId.Value);
			}
		}

		private async Task GenerateCatBoundary(List<CatPicture> catPictures, int catId)
		{
			var text = string.Join(',', catPictures.Select(r =>
			{
				var xy = ConvertWGS84ToSphericalMercator((double)r.Xcoord, (double)r.Ycoord);
				return $"{xy[0]} {xy[1]}";
			}));

			var sql = @$"
DECLARE @id as integer;
EXEC dbo.next_rowid 'dbo', 'CATBOUNDARY', @id OUTPUT; 

insert into [catfinderGeo].[dbo].[CATBOUNDARY] values 
(@id, {catId}, geometry::STGeomFromText('POLYGON (({text}))', 3857), null); ";
			using var db = new CatDBContext();
			await db.Database.ExecuteSqlRawAsync(sql);
		}

		public static double[] ConvertWGS84ToSphericalMercator(double lon, double lat)
		{
			double[] xy = new double[2];
			double radius = 6378137.0;
			xy[0] = lon * (Math.PI / 180.0) * radius;
			xy[1] = Math.Log(Math.Tan((Math.PI / 4) + ((lat * (Math.PI / 180.0)) / 2))) * radius;
			return xy;
		}
	}
}
