using Asp.Versioning;
using catfinder.api.cat.Arcgis;
using catfinder.api.cat.Interface;
using catfinder.api.ViewModel;
using Microsoft.AspNetCore.Mvc;
using Newtonsoft.Json;
using RestSharp;

namespace catfinder.api.Controllers
{
	[Route("api/[controller]")]
	[ApiVersion("1.0", Deprecated = true)]
	public class ArcgisController : ControllerBase
	{
		private readonly IConfiguration _configuration;
		private readonly ILogger<CatController> _logger;
		private readonly ICatService _catService;


		public ArcgisController(
			IConfiguration configuration,
			ILogger<CatController> logger,
			ICatService catService)
		{
			_configuration = configuration;
			_logger = logger;
			_catService = catService;
		}

		[HttpPost("Token")]
		[ProducesResponseType<ArcgisToken>(StatusCodes.Status200OK)]
		[ProducesResponseType(StatusCodes.Status403Forbidden)]
		public async Task<IActionResult> GetArcgisTokenAsync()
		{
			var refererUrl = Request.Headers.Referer.FirstOrDefault()?.Trim('/')?.ToLower() ?? string.Empty;
			if(string.IsNullOrWhiteSpace(refererUrl))
			{
				return Forbid("Request must contain referer");
			}

			var arcgisConfig = _configuration.GetSection(ArcgisConfig.Position).Get<ArcgisConfig>();
			var requestOriginUri = new Uri(refererUrl);
			var requestOrigin = requestOriginUri.PathAndQuery != "/" ? requestOriginUri.AbsoluteUri.Replace(requestOriginUri.PathAndQuery, string.Empty).ToLower() : requestOriginUri.AbsoluteUri.TrimEnd('/');

			if (!arcgisConfig.AllowedReferer.ToLower().Split(',').Select(x => x.Trim('/')).Contains(requestOrigin))
			{
				return Forbid("Current application is not allowed");
			}
			return Ok(await CreateTokenResponse(arcgisConfig, requestOrigin, "referer"));
		}


		private async Task<ArcgisToken> CreateTokenResponse(ArcgisConfig config, string requestOrigin, string requestClient)
		{
			Dictionary<string, string> parameters = new Dictionary<string, string>
			{
				{ "username", config.UserName },
				{ "password", config.Password },
				{ "referer", requestOrigin },
				{ "client", requestClient },
				{ "expiration", "1440" },
				{ "f", "json" },
			};

			dynamic result = await QueryAsync(parameters, config.Server, config.TokenUrl, Method.Post);

			ArcgisToken arcgisToken = new ArcgisToken()
			{
				ArcgisServer = config.Server,
				UserName = config.UserName,
			};

			if (result != null)
			{
				arcgisToken.Expires = result.expires;
				arcgisToken.Token = result.token;
			}

			return arcgisToken;
		}

		private async Task<dynamic> QueryAsync(Dictionary<string, string> parameters, string server, string resource, Method method)
		{
			using RestClient restClient = new RestClient(server);
			RestRequest request = new RestRequest(resource, method);
			request.AddHeader("Content-Type", "application/x-www-form-urlencoded");
			request.AddParameter("f", "json");
			foreach (var parameter in parameters)
			{
				request.AddParameter(parameter.Key, parameter.Value);
			}

			var response = await restClient.ExecuteAsync(request);
			if (response.IsSuccessful)
			{
				dynamic? content = JsonConvert.DeserializeObject(response.Content);
				if (content?.error == null)
				{
					return content;
				}
				else
				{
					var responseError = JsonConvert.SerializeObject(content.error);
					throw new Exception($"Error in ArcGIS response: {responseError}");
				}
			}
			else
			{
				throw response.ErrorException;
			}
		}
	}
}
