using Asp.Versioning;
using catfinder.api.cat.DTO;
using catfinder.api.cat.Interface;
using Microsoft.AspNetCore.Mvc;
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

		public CatPictureController(ILogger<CatPictureController> logger, ICatPictureService catPictureService)
		{
			_logger = logger;
			_catPictureService = catPictureService;
		}

		[HttpPost]
		public async Task<IActionResult> UploadAsync(IFormCollection form)
		{
			if(!form.TryGetValue("cat", out var cat))
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
				.Select(r => (r.OpenReadStream(), Path.GetExtension(r.FileName))).ToArray();
			await _catPictureService.UploadAsync(files, catDTO);
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
	}
}
