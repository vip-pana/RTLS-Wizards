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
using System.Linq;
using System.Collections.Generic;

namespace AptarCloud.Functions
{
    public static class DistanceHttp
    {
        private static Container distanceContainer = CosmosDbContext.getContainerDbContext(CosmosDbContext.ContainerDistance);
        private static Container tagContainer = CosmosDbContext.getContainerDbContext(CosmosDbContext.ContainerTag);
        private static Container anchorContainer = CosmosDbContext.getContainerDbContext(CosmosDbContext.ContainerAnchor);


        [FunctionName("AddDistance")]
        public static async Task<IActionResult> Add([HttpTrigger(AuthorizationLevel.Anonymous, "post", Route = "distance")] HttpRequest req)
        {
            string requestBody = await new StreamReader(req.Body).ReadToEndAsync();
            dynamic data = JsonConvert.DeserializeObject<DistanceRequestModel>(requestBody);

            if (data != null && data.measure != null && data.tagMac != null && data.anchorMac != null)
            {

                var tagExist = await TagHttp.GetDeviceByMac(data.tagMac, tagContainer);
                var anchorExist = await TagHttp.GetDeviceByMac(data.anchorMac, anchorContainer);

                DistanceModel distance = new DistanceModel()
                {
                    measure = data.measure,
                    tag = tagExist.Value,
                    anchor = anchorExist.Value
                };

                try
                { await distanceContainer.CreateItemAsync(distance); }
                catch (Exception ex)
                { return new BadRequestObjectResult(ex.ToString()); }

                return new OkObjectResult(distance);
            }
            else
            {
                return new BadRequestObjectResult("Dati errati o non inseriti");
            }
        }

        [FunctionName("GetDistance")]
        public static async Task<IActionResult> GetAll([HttpTrigger(AuthorizationLevel.Anonymous, "get", Route = "distance")] HttpRequest req)
        {
            var items = distanceContainer.GetItemQueryIterator<DistanceModel>();

            return new OkObjectResult((await items.ReadNextAsync()).ToList());
        }

        [FunctionName("GetDistanceById")]
        public static async Task<IActionResult> GetById([HttpTrigger(AuthorizationLevel.Anonymous, "get", Route = "distance/{id}")] HttpRequest req, string id)
        {
            try
            {
                var item = await distanceContainer.ReadItemAsync<DistanceModel>(id, new PartitionKey(id));
                return new OkObjectResult(item.Resource);
            }
            catch (CosmosException e) when (e.StatusCode == System.Net.HttpStatusCode.NotFound)
            {
                return new NotFoundResult();
            }
        }

        [FunctionName("DeleteDistance")]
        public static async Task<IActionResult> Delete(
       [HttpTrigger(AuthorizationLevel.Anonymous, "delete", Route = "distance/{id}")] HttpRequest req, string id)
        {
            try
            {
                var item = await distanceContainer.ReadItemAsync<MapModel>(id, new PartitionKey(id));

                await distanceContainer.DeleteItemAsync<DistanceModel>(id, new PartitionKey(id));
                return new OkResult();
            }
            catch (CosmosException e) when (e.StatusCode == System.Net.HttpStatusCode.NotFound)
            {
                return new NotFoundResult();
            }
        }

        public static async Task<IActionResult> GetDistancesMethod()
        {
            var iterator = distanceContainer.GetItemQueryIterator<DistanceModel>();
            var results = new List<DistanceModel>();

            while (iterator.HasMoreResults)
            {
                var response = await iterator.ReadNextAsync();
                results.AddRange(response.ToList());
            }

            return new OkObjectResult(results);
        }
    }
}

