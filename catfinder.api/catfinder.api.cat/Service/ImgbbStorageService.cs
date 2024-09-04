using System;
using System.IO;
using System.Net.Http;
using System.Text.Json;
using System.Threading.Tasks;
using catfinder.api.picture.Interface;
using Microsoft.Extensions.Configuration;

namespace catfinder.api.picture.Service
{
	public class ImgbbStorageService : IImageStorageService
	{
		private readonly string _apiKey;
		private readonly HttpClient _httpClient;

		public ImgbbStorageService(IConfiguration configuration, HttpClient httpClient)
		{
			_apiKey = configuration["ImgbbApiKey"] ?? throw new ArgumentNullException(nameof(configuration));
			_httpClient = httpClient ?? throw new ArgumentNullException(nameof(httpClient));
		}

		public async Task<string> UploadImageAsync(Stream imageStream, string fileName)
		{
			using var content = new MultipartFormDataContent();
			using var streamContent = new StreamContent(imageStream);
			content.Add(streamContent, "image", fileName);

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