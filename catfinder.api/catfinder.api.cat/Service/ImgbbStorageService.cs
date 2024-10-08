using System;
using System.IO;
using System.Net.Http;
using System.Text.Json;
using System.Threading.Tasks;

using Microsoft.Extensions.Configuration;

namespace catfinder.api.picture.Service
{
	public class ImgbbStorageService : BaseImageStorageService
	{
		private readonly string _apiKey;

		public ImgbbStorageService(IConfiguration configuration, HttpClient httpClient)
			: base(httpClient)
		{
			_apiKey = configuration["ImgbbApiKey"] ?? throw new ArgumentNullException(nameof(configuration));
		}

		public override async Task<string> UploadImageAsync(byte[] imageBytes, string fileName)
		{
			using var content = new MultipartFormDataContent();
			content.Add(new ByteArrayContent(imageBytes), "image", fileName);

			var response = await _httpClient.PostAsync($"https://api.imgbb.com/1/upload?key={_apiKey}", content);
			response.EnsureSuccessStatusCode();

			var responseBody = await response.Content.ReadAsStringAsync();
			using var jsonDocument = JsonDocument.Parse(responseBody);
			var root = jsonDocument.RootElement;

			if (root.GetProperty("success").GetBoolean())
			{
				return root.GetProperty("data").GetProperty("url").GetString()
					?? throw new Exception("Image URL not found in response");
			}
			else
			{
				throw new Exception($"Failed to upload image: {root.GetProperty("error").GetString() ?? "Unknown error"}");
			}
		}
	}
}