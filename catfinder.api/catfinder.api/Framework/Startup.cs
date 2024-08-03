using catfinder.api.cat;
using Volo.Abp;
using Volo.Abp.AspNetCore.Mvc;
using Volo.Abp.Autofac;
using Volo.Abp.Modularity;

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
				app.UseExceptionHandler("/Error");
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

			await base.OnApplicationInitializationAsync(context);
		}

		public override async Task ConfigureServicesAsync(ServiceConfigurationContext context)
		{
			var services = context.Services;

			services.AddControllers();
			services.AddEndpointsApiExplorer();
			services.AddSwaggerGen();

			services.AddCat();

			await base.ConfigureServicesAsync(context);
		}
	}
}
