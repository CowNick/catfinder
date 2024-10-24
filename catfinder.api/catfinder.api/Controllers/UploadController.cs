using Asp.Versioning;
using Microsoft.AspNetCore.Mvc;

namespace catfinder.api.Controllers
{
	[ApiController]
	[Route("api/UploadFiles")]
	[ApiVersion("1.0", Deprecated = true)]
	public class UploadController(
		ILogger<UploadController> logger,
		IConfiguration configuration
		) : ControllerBase
	{
		[HttpPost]
		public async Task<IActionResult> UploadAsync(IFormCollection form)
		{
			var file = form.Files[0];
			var root = configuration.GetSection("UpdataMapStore").Value ?? throw new InvalidProgramException("Image store was invalid");
			var path = Path.Combine(root, file.FileName);
			using var fileStream = System.IO.File.Create(path);
			await file.CopyToAsync(fileStream);
			return Ok(path);
		}
	}
}
