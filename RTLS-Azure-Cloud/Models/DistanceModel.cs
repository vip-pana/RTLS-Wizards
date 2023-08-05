using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace AptarCloud.Models
{
    public class DistanceModel
    {
        public string id { get; set; } = Guid.NewGuid().ToString();

        public double measure { get; set; }

        public DateTime timestamp { get; set; } = DateTime.Now.ToLocalTime();
        
        public DeviceModel tag { get; set; }
        
        public DeviceModel anchor { get; set; }
    }
}
