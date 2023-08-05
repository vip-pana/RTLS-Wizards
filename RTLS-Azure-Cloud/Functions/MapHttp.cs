using System;
using System.IO;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Azure.WebJobs;
using Microsoft.Azure.WebJobs.Extensions.Http;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Logging;
using Newtonsoft.Json;
using Microsoft.Azure.Cosmos;
using System.Linq;
using AptarCloud.Models;

namespace AptarCloud.Functions
{
    public static class MapHttp
    {
        private static Container mapContainer = CosmosDbContext.getContainerDbContext(CosmosDbContext.ContainerMap);

        [FunctionName("AddMap")]
        public static async Task<IActionResult> Add([HttpTrigger(AuthorizationLevel.Anonymous, "post", Route = "map")] HttpRequest req)
        {
            string requestBody = await new StreamReader(req.Body).ReadToEndAsync();
            dynamic data = JsonConvert.DeserializeObject<MapModel>(requestBody);

            if (data != null && data.length != null && data.width != null && data.squareMeters != null)
            {

                MapModel map = new MapModel()
                {
                    length = data.length,
                    width = data.width,
                    squareMeters = data.squareMeters,
                };

                try
                { await mapContainer.CreateItemAsync(map); }
                catch (Exception ex)
                { return new BadRequestObjectResult(ex.ToString()); }

                return new OkObjectResult(data);
            }
            else
            {
                return new BadRequestObjectResult("Dati errati o non inseriti");
            }
        }

        [FunctionName("GetMap")]
        public static async Task<IActionResult> GetMap([HttpTrigger(AuthorizationLevel.Anonymous, "get", Route = "map")] HttpRequest req)
        {
            var items = mapContainer.GetItemQueryIterator<MapModel>();

            return new OkObjectResult((await items.ReadNextAsync()).ToList());
        }

        [FunctionName("GetMapById")]
        public static async Task<IActionResult> GetMapById([HttpTrigger(AuthorizationLevel.Anonymous, "get", Route = "map/{id}")] HttpRequest req, string id)
        {
            try
            {
                var item = await mapContainer.ReadItemAsync<MapModel>(id, new PartitionKey(id));
                return new OkObjectResult(item.Resource);
            }
            catch (CosmosException e) when (e.StatusCode == System.Net.HttpStatusCode.NotFound)
            {
                return new NotFoundResult();
            }
        }

        [FunctionName("UpdateMap")]
        public static async Task<IActionResult> UpdateMap([HttpTrigger(AuthorizationLevel.Anonymous, "put", Route = "map/{id}")] HttpRequest req, string id)
        {
            try
            {
                string requestData = await new StreamReader(req.Body).ReadToEndAsync();
                var data = JsonConvert.DeserializeObject<MapModel>(requestData);

                var item = await mapContainer.ReadItemAsync<MapModel>(id, new PartitionKey(id));

                item.Resource.length = data.length;
                item.Resource.width = data.width;
                item.Resource.squareMeters = data.squareMeters;
                await mapContainer.UpsertItemAsync(item.Resource);

                return new OkObjectResult(item.Resource);
            }
            catch (CosmosException e) when (e.StatusCode == System.Net.HttpStatusCode.NotFound)
            {
                return new NotFoundResult();
            }
        }

        [FunctionName("DeleteMap")]
        public static async Task<IActionResult> DeleteMap(
        [HttpTrigger(AuthorizationLevel.Anonymous, "delete", Route = "map/{id}")] HttpRequest req, string id)
        {
            try
            {
                var item = await mapContainer.ReadItemAsync<MapModel>(id, new PartitionKey(id));

                await mapContainer.DeleteItemAsync<MapModel>(id, new PartitionKey(id));
                return new OkResult();
            }
            catch (CosmosException e) when (e.StatusCode == System.Net.HttpStatusCode.NotFound)
            {
                return new NotFoundResult();
            }
        }
    }
}
