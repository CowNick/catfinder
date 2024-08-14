namespace catfinder.api.ViewModel
{
	public class ArcgisConfig
	{
		public const string Position = "Arcgis";
		public string? Server { get; set; }
		public string? UserName { get; set; }
		public string? Password { get; set; }
		public string? AllowedReferer { get; set; }
		public string? TokenUrl { get; set; }
	}
}
