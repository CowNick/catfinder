using catfinder.api.cat.DTO;
using catfinder.api.cat.Interface;
using catfinder.api.orm.Context;
using Microsoft.EntityFrameworkCore;

namespace catfinder.api.cat.Service
{
	public class CatService : ICatService
	{
		public async Task<CatDTO[]> GetCatAsync()
		{
			using var db = new CatDBContext();
			var cats = await db.Cats
				.Include(c => c.CatPictures)
				.Select(cat => new CatDTO
				{
					Id = cat.Id,
					Name = cat.Name,
					Xcoord = cat.Xcoord,
					Ycoord = cat.Ycoord,
					CatPictures = cat.CatPictures.Select(cp => cp.Path).ToList()
				}).ToArrayAsync();

			return cats;
		}

		public async Task<CatDTO[]> GetCatByTextAsync(string text)
		{
			if (string.IsNullOrWhiteSpace(text))
			{
				return [];
			}

			using var db = new CatDBContext();
			var cats = await db.Cats.Include(r => r.CatAliases).Include(r => r.CatPictures).Where(
				r => r.Name.Contains(text) ||
				r.Description.Contains(text) ||
				(r.Type != null && r.Type.Contains(text)) ||
				(r.Tags != null && r.Tags.Contains(text)) ||
				r.CatAliases.Any(o => o.Alias.Contains(text))).ToArrayAsync();
			var result = cats.Select(r =>
			{
				var cat = new CatDTO
				{
					Id = r.Id,
					Name = r.Name,
					Description = r.Description,
					Xcoord = r.Xcoord,
					Ycoord = r.Ycoord,
					Tags = r.Tags,
					Type = r.Type,
				};
				cat.CatAliases.AddRange(r.CatAliases.Select(o => o.Alias));
				cat.CatPictures.AddRange(r.CatPictures.Select(o => o.Path));
				return cat;
			}).ToArray();
			return result;
		}
	}
}
