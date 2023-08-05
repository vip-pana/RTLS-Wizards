using System;
using System.IO;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Azure.WebJobs;
using Microsoft.Azure.WebJobs.Extensions.Http;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Logging;
using Newtonsoft.Json;
using AptarCloud.Models;
using Microsoft.Azure.Cosmos;
using System.Collections.Generic;
using System.Linq;

namespace AptarCloud.Functions
{
    public static class SiteHttp
    {
        private static Container siteContainer = CosmosDbContext.getContainerDbContext(CosmosDbContext.ContainerSite);


        [FunctionName("AddSite")]
        public static async Task<IActionResult> Add(
            [HttpTrigger(AuthorizationLevel.Function, "post", Route = "site")] HttpRequest req,
            ILogger log)
        {
            string requestBody = await new StreamReader(req.Body).ReadToEndAsync();
            dynamic data = JsonConvert.DeserializeObject<SiteModel>(requestBody);

            if (data != null && data.name != null)
            {
                QueryDefinition query = new QueryDefinition("SELECT * FROM c WHERE c.name = @name")
                    .WithParameter("@name", data.name);

                var iterator = siteContainer.GetItemQueryIterator<SiteModel>(query);
                var response = await iterator.ReadNextAsync();

                var siteExist = response.FirstOrDefault();

                if (siteExist != null)
                {
                    return new BadRequestObjectResult("Elemento già esistente!");
                }
              
                SiteModel site = new SiteModel()
                {
                    name = data.name,
                };

                try
                { await siteContainer.CreateItemAsync(site); }
                catch (Exception ex)
                { return new BadRequestObjectResult(ex.ToString()); }

                return new OkObjectResult(site);
            }
            else
            {
                return new BadRequestObjectResult("Dati errati o non inseriti");
            }
        }

        [FunctionName("GetSite")]
        public static async Task<IActionResult> Get([HttpTrigger(AuthorizationLevel.Anonymous, "get", Route = "site")] HttpRequest req)
        {
            var items = siteContainer.GetItemQueryIterator<SiteModel>();

            return new OkObjectResult((await items.ReadNextAsync()).ToList());
        }
    }
}
