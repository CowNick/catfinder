using Asp.Versioning;
using catfinder.api.cat.DTO;
using catfinder.api.cat.Interface;
using Microsoft.AspNetCore.Mvc;

namespace catfinder.api.Controllers
{
	[ApiController]
	[Route("api/Cats")]
	[ApiVersion("1.0", Deprecated = true)]
	public class CatController : ControllerBase
	{
		private readonly ILogger<CatController> _logger;

		private readonly ICatService _catService;

		public CatController(ILogger<CatController> logger, ICatService catService)
		{
			_logger = logger;
			_catService = catService;
		}

		[HttpGet]
		public async Task<CatDTO[]> GetAsync(string? text = null)
		{
			if (text == null) 
			{
				return await _catService.GetCatAsync();
			}

			return await _catService.GetCatByTextAsync(text);
		}
	}
}
