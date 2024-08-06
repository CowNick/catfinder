using catfinder.api.cat.DTO;

namespace catfinder.api.cat.Interface
{
	public interface ICatPictureService
	{
		Task<CatDTO> UploadAsync(Stream[] files, CatDTO cat);

		Task<CatPictureDTO[]> SearchAsync(string path);
	}
}
