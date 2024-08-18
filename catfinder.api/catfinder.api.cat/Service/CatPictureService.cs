using catfinder.api.cat.DTO;
using catfinder.api.cat.Interface;
using catfinder.api.orm.Context;
using catfinder.api.orm.Entities;
using catfinder.api.picture.Utils;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;

namespace catfinder.api.cat.Service
{
	public class CatPictureService(IConfiguration configuration) : ICatPictureService
	{
		public async Task UploadAsync((Stream stream, string ext)[] files, CatDTO cat)
		{
			var catPictures = await GetCatPictures(files, cat);
			var groups = await GetCatPictureGroups(catPictures);
			await UpdateCatPictures(groups, cat);
		}

		private const int _maxDistance = 15;

		public async Task<CatPictureDTO[]> SearchAsync(string path)
		{
			var hashCode = ImageSimilarityUtil.ProduceFinger(path);
			using var db = new CatDBContext();
			var hashCodes = await db.CatPictures.Select(r => new { r.Id, r.HashCode }).ToArrayAsync();
			var distancesObj = hashCodes.Select(r =>
			{
				var distance = string.IsNullOrEmpty(r.HashCode) ? _maxDistance : ImageSimilarityUtil.HammingDistance(hashCode, r.HashCode);
				return (r.Id, distance);
			}).Where(r => r.distance < _maxDistance).ToDictionary(r => r.Id, r => r.distance);
			var result = (await db.CatPictures.Include(r => r.Cat).Where(r => distancesObj.Keys.Contains(r.Id)).ToArrayAsync())
				.Select(r => (entity: r, distance: distancesObj[r.Id])).OrderBy(r => r.distance)
				.Select(r => new CatPictureDTO()
				{
					Name = r.entity.Cat?.Name,
					Path = r.entity.Path,
					Xcoord = r.entity.Xcoord,
					Ycoord = r.entity.Ycoord,
				}).ToArray();

			return result;
		}

		#region Upload

		private async Task<List<CatPicture>> GetCatPictures((Stream stream, string ext)[] files, CatDTO cat)
		{
			var filePathes = await UploadToDrawingBoardAsync(files);
			cat.CatPictures.AddRange(filePathes);

			List<CatPicture> catPictures = [];
			foreach (var path in filePathes)
			{
				CatPicture catPicture = new()
				{
					Path = path,
					Xcoord = cat.Xcoord,
					Ycoord = cat.Ycoord,
					HashCode = ImageSimilarityUtil.ProduceFinger(path),
				};

				catPictures.Add(catPicture);
			}

			return catPictures;
		}

		private async Task<List<string>> UploadToDrawingBoardAsync((Stream stream, string ext)[] files)
		{
			List<string> pathList = [];
			var root = configuration.GetSection("ImageStore").Value ?? throw new InvalidProgramException("Image store was invalid");
			foreach (var (stream, ext) in files)
			{
				var path = Path.Combine(root, Path.GetRandomFileName() + ext);
				using var fileStream = File.Create(path);
				await stream.CopyToAsync(fileStream);
				pathList.Add(path);
			}

			return pathList;
		}

		private async Task<List<CatPictureGroup>> GetCatPictureGroups(List<CatPicture> catPictures)
		{
			var firstCatPicture = catPictures[0];
			var nearIds = await GetNearIds(firstCatPicture);
			catPictures.Remove(firstCatPicture);
			var groups = CalculateSimilarityCatPicture(firstCatPicture, catPictures);
			groups = await SearchSimilarity(groups, nearIds);
			return groups;
		}

		private async Task<List<int>> GetNearIds(CatPicture catPicture)
		{
			return [];
		}

		private async Task<List<CatPictureGroup>> SearchSimilarity(List<CatPictureGroup> groups, List<int> nearIds)
		{
			using var db = new CatDBContext();
			var nearCatPictures = await db.CatPictures.Where(r => nearIds.Contains(r.Id)).ToArrayAsync();
			foreach (var group in groups)
			{
				var hashCode = group.NewCatPictures[0].HashCode;
				group.ExistCatPictures = nearCatPictures.Where(r => ImageSimilarityUtil.HammingDistance(hashCode, r.HashCode) < _maxDistance).ToList();
			}

			return groups;
		}

		private List<CatPictureGroup> CalculateSimilarityCatPicture(CatPicture controlCatPicture, List<CatPicture> catPictures)
		{
			List<CatPictureGroup> groups = [];

			List<CatPicture> Similarity = [];
			List<CatPicture> NextCalculate = [];
			CatPicture? nextControlCatPicture = null;

			foreach (var picture in catPictures)
			{
				if (ImageSimilarityUtil.HammingDistance(picture.HashCode, controlCatPicture.HashCode) < _maxDistance)
				{
					Similarity.Add(picture);
					continue;
				}

				if (nextControlCatPicture == null)
				{
					nextControlCatPicture = picture;
					continue;
				}

				NextCalculate.Add(picture);
			}

			Similarity.Add(controlCatPicture);
			groups.Add(new CatPictureGroup() { NewCatPictures = Similarity });

			if (nextControlCatPicture == null)
			{
				return groups;
			}

			if (NextCalculate.Count == 0)
			{
				groups.Add(new CatPictureGroup() { NewCatPictures = [nextControlCatPicture] });
				return groups;
			}

			var nextGroups = CalculateSimilarityCatPicture(nextControlCatPicture, NextCalculate);
			groups.AddRange(nextGroups);
			return groups;
		}

		private async Task UpdateCatPictures(List<CatPictureGroup> groups, CatDTO cat)
		{
			using var db = new CatDBContext();
			foreach (var group in groups)
			{
				var exist = group.ExistCatPictures[0];
				if (exist != null)
				{
					group.NewCatPictures.ForEach(r => r.CatId = exist.CatId);
					await db.SaveChangesAsync();
					continue;
				}

				Cat entity = new()
				{
					Name = cat.Name ?? "UnKnow",
					Tags = cat.Tags,
					Type = cat.Type,
					Description = cat.Description,
					Xcoord = cat.Xcoord,
					Ycoord = cat.Ycoord,
					CatPictures = group.NewCatPictures,
				};

				await db.AddAsync(entity);
				await db.SaveChangesAsync();
			}
		}

		private async Task CalculateCatPolygon(List<CatPictureGroup> groups)
		{
			using var db = new CatDBContext();
			foreach (var group in groups)
			{
				var catId = group.NewCatPictures[0].CatId;
				if (group.ExistCatPictures.Count == 0)
				{
					if (group.NewCatPictures.Count < 3)
					{
						continue;
					}

					await GenerateCatBoundary(group.NewCatPictures, catId.Value);
				}

				var cat = await db.Cats.Include(r => r.CatPictures).FirstAsync(r => r.Id == catId);
				if (cat.CatPictures.Count < 3)
				{
					continue;
				}

				var catBoundary = await db.Catboundaries.FirstAsync(r => r.Catid == catId);
				if (catBoundary == null)
				{
					await GenerateCatBoundary(cat.CatPictures.ToList(), catId.Value);
					continue;
				}

				await ReCalculateCatBoundary(catBoundary, group.NewCatPictures);
			}
		}

		private async Task GenerateCatBoundary(List<CatPicture> catPictures, int catId)
		{

		}

		private async Task ReCalculateCatBoundary(Catboundary catBoundary, List<CatPicture> catPictures)
		{

		}

		private sealed class CatPictureGroup
		{
			public List<CatPicture> NewCatPictures { get; set; } = [];

			public List<CatPicture> ExistCatPictures { get; set; } = [];
		}

		#endregion
	}
}
