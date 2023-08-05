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
using System.Linq;
using Microsoft.Azure.Cosmos;
using System.Collections.Generic;

namespace AptarCloud.Functions
{
    public static class MachineHttp
    {
        private static Container machineContainer = CosmosDbContext.getContainerDbContext(CosmosDbContext.ContainerMachine);
        private static Container siteContainer = CosmosDbContext.getContainerDbContext(CosmosDbContext.ContainerSite);

        [FunctionName("GetAllMachines")]
        public static async Task<IActionResult> GetAllMachines([HttpTrigger(AuthorizationLevel.Anonymous, "get", Route = "machine")] HttpRequest req)
        {
            var items = machineContainer.GetItemQueryIterator<MachineModel>();

            return new OkObjectResult((await items.ReadNextAsync()).ToList());
        }

        [FunctionName("GetMachineById")]
        public static async Task<IActionResult> GetMachineById(
         [HttpTrigger(AuthorizationLevel.Anonymous, "get", Route = "machine/{id}")] HttpRequest req,
         string id)
        {
            try
            {
                var item = await machineContainer.ReadItemAsync<MachineModel>(id, new PartitionKey(id));
                return new OkObjectResult(item.Resource);
            }
            catch (CosmosException e) when (e.StatusCode == System.Net.HttpStatusCode.NotFound)
            {
                return new NotFoundResult();
            }
        }

        [FunctionName("GetMachineByName")]
        public static async Task<IActionResult> GetMachineByName([HttpTrigger(AuthorizationLevel.Anonymous, "get", Route = "machine/name/{name}")] HttpRequest req, string name)
        {
            try
            {
                var query = new QueryDefinition("SELECT * FROM c WHERE c.name = @name")
                    .WithParameter("@name", name);

                var iterator = machineContainer.GetItemQueryIterator<MachineModel>(query);
                var response = await iterator.ReadNextAsync();

                var item = response.FirstOrDefault();

                if (item == null)
                {
                    return new NotFoundResult();
                }

                return new OkObjectResult(item);
            }
            catch (CosmosException e) when (e.StatusCode == System.Net.HttpStatusCode.NotFound)
            {
                return new NotFoundResult();
            }
        }

        [FunctionName("AddMachine")]
        public static async Task<IActionResult> AddMachine(
        [HttpTrigger(AuthorizationLevel.Function, "post", Route = "machine")] HttpRequest req,
        ILogger log)
        {
            string requestBody = await new StreamReader(req.Body).ReadToEndAsync();
            dynamic data = JsonConvert.DeserializeObject<MachineModel>(requestBody);

            if (data != null && data.name != null && data.siteName != null )
            {

                SiteModel siteExist = null;
                QueryDefinition querySite = new QueryDefinition("SELECT * FROM c WHERE c.name = @siteName")
                .WithParameter("@siteName", data.siteName);

                var iteratorSite = siteContainer.GetItemQueryIterator<SiteModel>(querySite);
                var responseSite = await iteratorSite.ReadNextAsync();

                siteExist = responseSite.FirstOrDefault();
              
                MachineModel machine = new MachineModel()
                {
                    name = data.name,
                    siteName = siteExist == null ? null:siteExist.name,
                    site = siteExist == null ? null : siteExist,

                };

                try
                { await machineContainer.CreateItemAsync(machine); }
                catch (Exception ex)
                { return new BadRequestObjectResult(ex.ToString()); }

                return new OkObjectResult(machine);
            }
            else
            {
                return new BadRequestObjectResult("Dati errati o non inseriti");
            }
        }

        [FunctionName("GetMachineBySite")]
        public static async Task<IActionResult> GetMachineBySite(
        [HttpTrigger(AuthorizationLevel.Anonymous, "get", Route = "machine/site/{siteName}")] HttpRequest req,
        string siteName)
        {
            try
            {
                QueryDefinition query;

                if (siteName == "null")
                {
                    query = new QueryDefinition("SELECT * FROM c WHERE IS_NULL(c.site)");
                }
                else
                {

                    query = new QueryDefinition("SELECT * FROM c WHERE c.siteName = @siteName").WithParameter("@siteName", siteName);
                }

                var iterator = machineContainer.GetItemQueryIterator<MachineModel>(query);
                var response = await iterator.ReadNextAsync();

                if (response.Count == 0)
                {
                    return new NotFoundResult();
                }

                List<MachineModel> items = response.ToList();

                return new OkObjectResult(items);
            }
            catch (CosmosException e) when (e.StatusCode == System.Net.HttpStatusCode.NotFound)
            {
                return new NotFoundResult();
            }
        }

    }
}

