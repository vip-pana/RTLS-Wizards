using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace AptarCloud.Models
{
    public class DistanceRequestModel
    {
        public double measure { get; set; }
        public string tagMac { get; set; }
        public string anchorMac { get; set; }
    }
}
