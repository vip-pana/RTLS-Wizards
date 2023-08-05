using System;
using System.Collections.Generic;

namespace AptarCloud.Models
{
    public class DeviceModel
    {
        public string? id { get; set; } = Guid.NewGuid().ToString();
        public string macAddress { get; set; }
        public string type { get; set; }
        public List<PositionModel>? positions { get; set; }
        public SiteModel? site { get; set; } 
        public string? siteName { get; set; } 
        public bool? connected { get; set; } = false;
        public string? machineName { get; set; }
    }
}
