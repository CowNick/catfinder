using catfinder.api.cat;
using catfinder.api.picture.Interface;
using catfinder.api.picture.Service;
using Volo.Abp;
using Volo.Abp.AspNetCore.Mvc;
using Volo.Abp.Autofac;
using Volo.Abp.Modularity;
using Microsoft.EntityFrameworkCore;
using catfinder.api.orm.Context;

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

			services.AddHttpClient<IImageStorageService, ImgbbStorageService>();
			services.AddHttpClient<IImageStorageService, FreeImageHostStorageService>();

			await base.ConfigureServicesAsync(context);
		}
	}
}
