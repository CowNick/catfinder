using catfinder.api.cat.Interface;
using catfinder.api.cat.Service;
using Microsoft.Extensions.DependencyInjection;

namespace catfinder.api.cat
{
	public static class CatExtension
	{
		public static void AddCat(this IServiceCollection services)
		{
			services.AddScoped<ICatService, CatService>();
			services.AddScoped<ICatPictureService, CatPictureService>();
		}
	}
}
