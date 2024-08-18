using catfinder.api.cat.DTO;

namespace catfinder.api.cat.Interface
{
	public interface ICatPictureService
	{
		Task UploadAsync((Stream stream, string ext)[] files, CatDTO cat);

		Task<CatPictureDTO[]> SearchAsync(string path);
	}
}
