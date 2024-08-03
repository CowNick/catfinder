using System;
using System.Collections.Generic;

namespace catfinder.api.orm.Entities;

public partial class CatAlias
{
    public int Id { get; set; }

    public int CatId { get; set; }

    public string Alias { get; set; } = null!;

    public virtual Cat Cat { get; set; } = null!;
}
