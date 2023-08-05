using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace AptarCloud.Models
{
    public class PositionModel
    {
        public string? id { get; set; } = Guid.NewGuid().ToString();
        public double x { get; set; }
        public double y { get; set; }
        public string? macAddress { get; set; }
        public string type { get; set; }
        public DateTime timestamp { get; set; } = DateTime.Now.ToLocalTime();
    }
}