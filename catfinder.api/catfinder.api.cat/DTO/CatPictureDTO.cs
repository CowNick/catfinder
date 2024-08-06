namespace catfinder.api.cat.DTO
{
	public class CatPictureDTO
	{
		public string? Name { get; set; }

		public string Path { get; set; } = null!;

		public decimal? Xcoord { get; set; }

		public decimal? Ycoord { get; set; }
	}
}
