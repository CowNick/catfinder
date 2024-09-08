using System;
using System.IO;
using System.Net.Http;
using System.Text.Json;
using System.Threading.Tasks;

using Microsoft.Extensions.Configuration;

namespace catfinder.api.picture.Service
{
	public class FreeImageHostStorageService : BaseImageStorageService
	{
		private readonly string _apiKey;

		public FreeImageHostStorageService(IConfiguration configuration, HttpClient httpClient)
			: base(httpClient)
		{
			_apiKey = configuration["FreeImageHostApiKey"] ?? throw new ArgumentNullException(nameof(configuration));
		}

		public override async Task<string> UploadImageAsync(Stream imageStream, string fileName)
		{
			using var content = new MultipartFormDataContent();
			using var streamContent = new StreamContent(imageStream);
			content.Add(streamContent, "source", fileName);
			content.Add(new StringContent(_apiKey), "key");

			var response = await _httpClient.PostAsync("https://freeimage.host/api/1/upload", content);
			response.EnsureSuccessStatusCode();

			var responseBody = await response.Content.ReadAsStringAsync();
			using var jsonDocument = JsonDocument.Parse(responseBody);
			var root = jsonDocument.RootElement;

			if (root.GetProperty("status_code").GetInt32() == 200)
			{
				return root.GetProperty("image").GetProperty("url").GetString()
					?? throw new Exception("Image URL not found in response");
			}
			else
			{
				throw new Exception($"Failed to upload image: {root.GetProperty("error").GetProperty("message").GetString() ?? "Unknown error"}");
			}
		}
	}
}
