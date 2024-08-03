using catfinder.api.orm.Entities;

namespace catfinder.api.cat.Interface
{
	public interface ICatService
	{
		Task<Cat?> GetCatAsync(string name);
	}
}
