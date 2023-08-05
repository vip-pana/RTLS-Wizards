using Microsoft.Azure.Cosmos;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace AptarCloud
{
    internal class CosmosDbContext
    {
        public static readonly string cosmosDbEndpoint = "https://rtlswizards2.documents.azure.com:443/";
        public static readonly string cosmosDbKey = "lYqzehKTj99e3JywkHwWPawkWRzTTjcGb4q6iYGniM3VTGp7nu5ezUT9bF7i0umLdXjsB8Wn56JrACDbe8duzg==";

        public static readonly string DatabaseName = "rtls";
        public static readonly string ContainerTag = "tag";
        public static readonly string ContainerPosition = "position";
        public static readonly string ContainerAnchor= "anchor";
        public static readonly string ContainerMap= "map";
        public static readonly string ContainerDistance= "distance";
        public static readonly string ContainerSite= "site";
        public static readonly string ContainerMachine = "machine";
        public static readonly string ContainerHistory = "history";


        public static Container getContainerDbContext(string containerName) { 
            var cosmosClient = new CosmosClient(cosmosDbEndpoint, cosmosDbKey); 
            return cosmosClient.GetContainer(DatabaseName, containerName);
        }

    }
}
