using catfinder.api.cat.DTO;
using catfinder.api.cat.Service;

namespace catfinder.api.cat.Interface
{
	public interface ICatPictureService
	{
		Task<List<CatPictureGroup>> UploadAsync((byte[] bytes, string ext)[] files, CatDTO cat);

		Task<CatPictureDTO[]> SearchAsync(string path);
	}
}
