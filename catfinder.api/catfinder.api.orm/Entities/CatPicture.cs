using System;
using System.Collections.Generic;

namespace catfinder.api.orm.Entities;

public partial class CatPicture
{
    public int Id { get; set; }

    public int? CatId { get; set; }

    public string? Path { get; set; }

    public decimal? Xcoord { get; set; }

    public decimal? Ycoord { get; set; }

    public string? HashCode { get; set; }

    public virtual Cat? Cat { get; set; }
}
