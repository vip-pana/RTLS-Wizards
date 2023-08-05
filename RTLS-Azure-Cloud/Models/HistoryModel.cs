using System;
using System.Collections.Generic;

namespace AptarCloud.Models
{
    public class HistoryModel
    {
        public string? id { get; set; } = Guid.NewGuid().ToString();
        public SiteModel? site { get; set; }
        public MachineModel? machine { get; set; }
        public List<DeviceModel>? tags { get; set; }
        public List<DeviceModel>? anchors { get; set; }
        public DateTime dateStart { get; set; } = DateTime.Now.ToLocalTime();
        public DateTime? dateEnd { get; set; }
    }
}

