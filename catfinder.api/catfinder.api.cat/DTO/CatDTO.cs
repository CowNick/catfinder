namespace catfinder.api.cat.DTO
{
	public class CatDTO
	{
		public int? Id { get; set; }

		public string? Name { get; set; }

		public string? Description { get; set; }

		public decimal? Xcoord { get; set; }

		public decimal? Ycoord { get; set; }

		public string? Type { get; set; }

		public string? Tags { get; set; }

		public List<string> CatAliases { get; } = [];

		public List<string> CatPictures { get; set; } = [];
	}
}
