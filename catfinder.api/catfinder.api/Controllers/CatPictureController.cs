using Asp.Versioning;
using catfinder.api.cat.DTO;
using catfinder.api.cat.Interface;
using Microsoft.AspNetCore.Mvc;

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
		public async Task<CatDTO> UploadAsync(IFormCollection form, CatDTO cat)
		{
			var files = form.Files.Select(r => r.OpenReadStream()).ToArray();
			return await _catPictureService.UploadAsync(files, cat);
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
