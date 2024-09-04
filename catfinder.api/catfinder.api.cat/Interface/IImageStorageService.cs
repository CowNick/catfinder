using System.IO;
using System.Threading.Tasks;

namespace catfinder.api.picture.Interface
{
	public interface IImageStorageService
	{
		Task<string> UploadImageAsync(Stream imageStream, string fileName);
	}
}