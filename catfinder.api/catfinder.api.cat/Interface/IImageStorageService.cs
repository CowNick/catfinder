using System.Threading.Tasks;

namespace catfinder.api.picture.Interface
{
	public interface IImageStorageService
	{
		Task<string> UploadImageAsync(byte[] imageBytes, string fileName);
		Task<byte[]> GetImageBytesFromUrlAsync(string imageUrl);
	}
}