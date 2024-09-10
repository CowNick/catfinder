using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Threading.Tasks;

using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;

using catfinder.api.cat.DTO;
using catfinder.api.cat.Interface;
using catfinder.api.orm.Context;
using catfinder.api.orm.Entities;
using catfinder.api.picture.Interface;
using catfinder.api.picture.Utils;

namespace catfinder.api.cat.Service
{
	public class CatPictureService : ICatPictureService
	{
		private readonly IConfiguration _configuration;
		private readonly IImageStorageService _imageStorageService;

		public CatPictureService(IConfiguration configuration, IImageStorageService imageStorageService)
		{
			_configuration = configuration;
			_imageStorageService = imageStorageService;
		}

		public async Task<List<CatPictureGroup>> UploadAsync((byte[] bytes, string ext)[] files, CatDTO cat)
		{
			var catPictures = await GetCatPictures(files, cat);
			var groups = await GetCatPictureGroups(catPictures);
			await UpdateCatPictures(groups, cat);
			return groups;
		}

		private async Task<List<CatPicture>> GetCatPictures((byte[] bytes, string ext)[] files, CatDTO cat)
		{
			var fileUrls = await UploadToImageStorageAsync(files);
			cat.CatPictures.AddRange(fileUrls);

			List<CatPicture> catPictures = [];
			foreach (var (bytes, ext) in files)
			{
				CatPicture catPicture = new()
				{
					Path = fileUrls[Array.IndexOf(files, (bytes, ext))],
					Xcoord = cat.Xcoord,
					Ycoord = cat.Ycoord,
					HashCode = ImageSimilarityUtil.ProduceFingerFromBytes(bytes),
				};

				catPictures.Add(catPicture);
			}

			return catPictures;
		}

		private async Task<List<string>> UploadToImageStorageAsync((byte[] bytes, string ext)[] files)
		{
			List<string> urlList = [];
			foreach (var (bytes, ext) in files)
			{
				var fileName = Path.GetRandomFileName() + ext;
				var url = await _imageStorageService.UploadImageAsync(bytes, fileName);
				urlList.Add(url);
			}

			return urlList;
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
			using var db = new CatDBContext();
			var pictures = await db.CatPictures.ToListAsync();
			var result = pictures.Where(r => Math.Sqrt((double)((r.Xcoord - catPicture.Xcoord) * (r.Xcoord - catPicture.Xcoord) + (r.Ycoord - catPicture.Ycoord) * (r.Ycoord - catPicture.Ycoord))) < 10);

			return result.Select(r => r.Id).ToList();
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
				if (group.ExistCatPictures.Count > 0)
				{
					var exist = group.ExistCatPictures[0];
					if (exist != null)
					{
						group.NewCatPictures.ForEach(r => r.CatId = exist.CatId);
						await db.AddRangeAsync(group.NewCatPictures);
						await db.SaveChangesAsync();
						continue;
					}
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
		#endregion
	}

	public sealed class CatPictureGroup
	{
		public List<CatPicture> NewCatPictures { get; set; } = [];

		public List<CatPicture> ExistCatPictures { get; set; } = [];
	}

}
