----EF core db frist----

Scaffold-DbContext 'Initial Catalog=catfinderGeo;Data Source=localhost;User ID=tfuser;password=$transfinder2006;Trusted_Connection=True;Encrypt=False' Microsoft.EntityFrameworkCore.SqlServer -OutputDir Entities -Force -ContextDir Context -Tables "Cat","CatAlias","CatPicture","CATBOUNDARY" -Context CatDBContext
