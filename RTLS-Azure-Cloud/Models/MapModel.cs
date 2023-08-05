using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace AptarCloud.Models
{
    public class MapModel
    {
        public string id { get; set; } = Guid.NewGuid().ToString();

        public double length { get; set; }

        public double width { get; set; }

        public double squareMeters { get; set; }

    }
}
