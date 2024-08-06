using System;
using System.Collections.Generic;

namespace catfinder.api.orm.Entities;

public partial class Cat
{
    public int Id { get; set; }

    public string Name { get; set; } = null!;

    public string? Description { get; set; }

    public decimal? Xcoord { get; set; }

    public decimal? Ycoord { get; set; }

    public string? Type { get; set; }

    public string? Tags { get; set; }

    public virtual ICollection<CatAlias> CatAliases { get; set; } = new List<CatAlias>();

    public virtual ICollection<CatPicture> CatPictures { get; set; } = new List<CatPicture>();
}
