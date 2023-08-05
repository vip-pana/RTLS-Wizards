using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace AptarCloud.Models
{
    public class SiteModel
    {
        public string? id { get; set; } = Guid.NewGuid().ToString();

        public string name { get; set; }

    }
}
