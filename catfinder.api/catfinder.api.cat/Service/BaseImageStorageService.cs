using System;
using System.IO;
using System.Net.Http;
using System.Threading.Tasks;
using catfinder.api.picture.Interface;

namespace catfinder.api.picture.Service
{
	public abstract class BaseImageStorageService : IImageStorageService
	{
		protected readonly HttpClient _httpClient;

		protected BaseImageStorageService(HttpClient httpClient)
		{
			_httpClient = httpClient ?? throw new ArgumentNullException(nameof(httpClient));
		}

		public abstract Task<string> UploadImageAsync(Stream imageStream, string fileName);

		public virtual async Task<Stream> GetImageStreamFromUrlAsync(string imageUrl)
		{
			var response = await _httpClient.GetAsync(imageUrl);
			response.EnsureSuccessStatusCode();
			return await response.Content.ReadAsStreamAsync();
		}
	}
}
