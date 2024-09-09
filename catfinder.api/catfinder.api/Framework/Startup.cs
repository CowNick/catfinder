using catfinder.api.cat;
using catfinder.api.picture.Interface;
using catfinder.api.picture.Service;
using Volo.Abp;
using Volo.Abp.AspNetCore.Mvc;
using Volo.Abp.Autofac;
using Volo.Abp.Modularity;
using Microsoft.EntityFrameworkCore;
using catfinder.api.orm.Context;
using catfinder.api.picture.Config;
using Microsoft.Extensions.Options;

namespace catfinder.api.Framework
{
	[DependsOn(typeof(AbpAspNetCoreMvcModule))]
	[DependsOn(typeof(AbpAutofacModule))]
	public class Startup : AbpModule
	{
		public override async Task OnApplicationInitializationAsync(ApplicationInitializationContext context)
		{
			var app = context.GetApplicationBuilder();
			var env = context.GetEnvironment();

			// Configure the HTTP request pipeline.
			if (env.IsDevelopment())
			{
				app.UseExceptionHandler(new ExceptionHandlerOptions
				{
					AllowStatusCode404Response = true,
					ExceptionHandlingPath = "/error"
				});
				// The default HSTS value is 30 days. You may want to change this for production scenarios, see https://aka.ms/aspnetcore-hsts.
				app.UseHsts();

				app.UseSwagger();
				app.UseSwaggerUI();
			}

			app.UseHttpsRedirection();
			app.UseStaticFiles();
			app.UseRouting();
			app.UseConfiguredEndpoints();
			app.UseEndpoints(endpoints =>
			{
				endpoints.MapControllers();
			});
			app.UseCors(corsPolicyBuilder =>
			{
				corsPolicyBuilder.AllowAnyOrigin();
			});

			await base.OnApplicationInitializationAsync(context);
		}

		public override async Task ConfigureServicesAsync(ServiceConfigurationContext context)
		{
			var services = context.Services;
			var configuration = context.Services.GetConfiguration();

			context.Services.AddAbpApiVersioning(options =>
			{
				options.ReportApiVersions = true;
				options.AssumeDefaultVersionWhenUnspecified = true;
			});

			Configure<AbpAspNetCoreMvcOptions>(options =>
			{
				options.ChangeControllerModelApiExplorerGroupName = false;
			});

			services.AddDbContext<CatDBContext>(options => options.UseSqlServer("Initial Catalog=catfinderGeo;Data Source=10.1.0.108;User ID=tfuser;password=$transfinder2006;Encrypt=False", x => x.UseNetTopologySuite()));

			services.AddControllers();
			services.AddEndpointsApiExplorer();
			services.AddSwaggerGen();

			services.AddCat();

			// 绑定ImageStorage配置
			services.Configure<ImageStorageConfig>(configuration.GetSection("ImageStorage"));

			// 根据配置注册适当的IImageStorageService
			services.AddHttpClient<ImgbbStorageService>();
			services.AddHttpClient<FreeImageHostStorageService>();
			services.AddTransient<IImageStorageService>(sp =>
			{
				var config = sp.GetRequiredService<IOptions<ImageStorageConfig>>().Value;
				return config.Provider.ToLower() switch
				{
					"imgbb" => sp.GetRequiredService<ImgbbStorageService>(),
					"freeimagehost" => sp.GetRequiredService<FreeImageHostStorageService>(),
					_ => throw new InvalidOperationException($"Unsupported image storage provider: {config.Provider}")
				};
			});

			await base.ConfigureServicesAsync(context);
		}
	}
}
