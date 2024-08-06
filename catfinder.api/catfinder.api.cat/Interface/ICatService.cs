using catfinder.api.cat.DTO;

namespace catfinder.api.cat.Interface
{
	public interface ICatService
	{
		Task<CatDTO[]> GetCatByTextAsync(string text);

		Task<CatDTO[]> GetCatAsync();
	}
}
