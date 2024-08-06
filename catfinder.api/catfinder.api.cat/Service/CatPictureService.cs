using catfinder.api.cat.DTO;
using catfinder.api.cat.Interface;
using catfinder.api.orm.Context;
using catfinder.api.orm.Entities;
using catfinder.api.picture.Utils;
using Microsoft.EntityFrameworkCore;

namespace catfinder.api.cat.Service
{
	public class CatPictureService : ICatPictureService
	{
		public async Task<CatDTO> UploadAsync(Stream[] files, CatDTO cat)
		{
			using var db = new CatDBContext();
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

			if (string.IsNullOrEmpty(cat.Name))
			{
				await db.AddAsync(catPictures);
				await db.SaveChangesAsync();
				return cat;
			}

			Cat entity = new()
			{
				Name = cat.Name,
				Tags = cat.Tags,
				Type = cat.Type,
				Description = cat.Description,
				Xcoord = cat.Xcoord,
				Ycoord = cat.Ycoord,
				CatPictures = catPictures,
			};

			await db.AddAsync(entity);
			await db.SaveChangesAsync();
			return cat;
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

		private async Task<string[]> UploadToDrawingBoardAsync(Stream[] files)
		{
			// TODO, upaload to DrawingBoard
			return await Task.FromResult<string[]>([]);
		}
	}
}
