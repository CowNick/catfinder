using System;
using System.Collections.Generic;

namespace catfinder.api.orm.Entities;

public partial class Catboundary
{
    public int Objectid { get; set; }

    public byte[]? GdbGeomattrData { get; set; }

    public int? Catid { get; set; }
}
