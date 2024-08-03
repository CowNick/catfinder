using catfinder.api.cat.Interface;
using catfinder.api.orm.Context;
using catfinder.api.orm.Entities;
using Microsoft.EntityFrameworkCore;

namespace catfinder.api.cat.Service
{
	public class CatService : ICatService
	{
		public async Task<Cat?> GetCatAsync(string name)
		{
			using var db = new CatDBContext();
			return await db.Cats.FirstOrDefaultAsync(r => r.Name == name);
		}
	}
}
