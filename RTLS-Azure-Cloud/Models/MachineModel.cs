using System;
namespace AptarCloud.Models
{
    public class MachineModel
    {
        public string? id { get; set; } = Guid.NewGuid().ToString();
        public string name { get; set; }
        public SiteModel? site { get; set; }
        public string? siteName { get; set; }
    }
}

