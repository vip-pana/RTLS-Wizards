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
using AptarCloud.Models;
using Azure;
using System.Linq;
using System.Net.Mail;
using System.Collections.Generic;
using System.Security.Policy;

namespace AptarCloud.Functions
{
    public static class TagHttp
    {
        private static Container tagContainer = CosmosDbContext.getContainerDbContext(CosmosDbContext.ContainerTag);
        private static Container siteContainer = CosmosDbContext.getContainerDbContext(CosmosDbContext.ContainerSite);

        [FunctionName("AddTag")]
        public static async Task<IActionResult> Add([HttpTrigger(AuthorizationLevel.Anonymous, "post", Route = "tag")] HttpRequest req, ILogger log)
        {
            log.LogInformation($"Add tag initialized");

            string requestBody = await new StreamReader(req.Body).ReadToEndAsync();
            dynamic data = JsonConvert.DeserializeObject<DeviceModel>(requestBody);

            if (data != null && data.macAddress != null && data.type != null)
            {

                QueryDefinition query = new QueryDefinition("SELECT * FROM c WHERE c.macAddress = @macAddress")
                    .WithParameter("@macAddress", data.macAddress);

                var iterator = tagContainer.GetItemQueryIterator<DeviceModel>(query);
                var response = await iterator.ReadNextAsync();

                SiteModel siteExist = null;
                if (data.siteName != null)
                {
                    QueryDefinition querySite = new QueryDefinition("SELECT * FROM c WHERE c.name = @site")
                    .WithParameter("@site", data.siteName);

                    var iteratorSite = siteContainer.GetItemQueryIterator<SiteModel>(querySite);
                    var responseSite = await iteratorSite.ReadNextAsync();
                    siteExist = responseSite.FirstOrDefault();
                }

                var deviceExist = response.FirstOrDefault();

                if (deviceExist != null)
                {
                    deviceExist.site = data.siteName == null ? null : siteExist;
                    deviceExist.siteName = data.siteName == null ? null : siteExist.name;
                    deviceExist.machineName = data.machineName != null ? data.machineName : deviceExist.machineName;
                    await tagContainer.UpsertItemAsync(deviceExist);
                    return new OkObjectResult(deviceExist);
                }

                DeviceModel tag = new DeviceModel()
                {
                    macAddress = data.macAddress,
                    type = data.type,
                    positions = data.positions != null ? data.positions : new List<PositionModel>(),
                    site = data.siteName == null ? null : siteExist,
                    siteName = data.siteName == null ? null : siteExist.name,
                    machineName = data.machineName == null ? null : data.machineName
                };

                try
                { await tagContainer.CreateItemAsync(tag); }
                catch (Exception ex)
                { return new BadRequestObjectResult(ex.ToString()); }

                return new OkObjectResult(tag);
            }
            else
            {
                return new BadRequestObjectResult("Dati errati o non inseriti");
            }
        }

        [FunctionName("GetTag")]
        public static async Task<IActionResult> Get([HttpTrigger(AuthorizationLevel.Anonymous, "get", Route = "tag")] HttpRequest req)
        {
            var items = tagContainer.GetItemQueryIterator<DeviceModel>();

            return new OkObjectResult((await items.ReadNextAsync()).ToList());
        }

        [FunctionName("GetTagById")]
        public static async Task<IActionResult> GetById(
          [HttpTrigger(AuthorizationLevel.Anonymous, "get", Route = "tag/{id}")] HttpRequest req,
          string id)
        {
            try
            {
                var item = await tagContainer.ReadItemAsync<DeviceModel>(id, new PartitionKey(id));
                return new OkObjectResult(item.Resource);
            }
            catch (CosmosException e) when (e.StatusCode == System.Net.HttpStatusCode.NotFound)
            {
                return new NotFoundResult();
            }
        }

        [FunctionName("UpdateTag")]
        public static async Task<IActionResult> Update([HttpTrigger(AuthorizationLevel.Anonymous, "put", Route = "tag/{id}")] HttpRequest req, string id)
        {
            try
            {
                string requestData = await new StreamReader(req.Body).ReadToEndAsync();
                var data = JsonConvert.DeserializeObject<DeviceModel>(requestData);

                var item = await tagContainer.ReadItemAsync<DeviceModel>(id, new PartitionKey(id));

                item.Resource.macAddress = data.macAddress;
                item.Resource.positions = data.positions;
                await tagContainer.UpsertItemAsync(item.Resource);

                return new OkObjectResult(item.Resource);
            }
            catch (CosmosException e) when (e.StatusCode == System.Net.HttpStatusCode.NotFound)
            {
                return new NotFoundResult();
            }
        }

        [FunctionName("DeleteTag")]
        public static async Task<IActionResult> Delete(
        [HttpTrigger(AuthorizationLevel.Anonymous, "delete", Route = "tag/{id}")] HttpRequest req, string id)
        {
            try
            {
                var item = await tagContainer.ReadItemAsync<DeviceModel>(id, new PartitionKey(id));

                await tagContainer.DeleteItemAsync<DeviceModel>(id, new PartitionKey(id));
                return new OkResult();
            }
            catch (CosmosException e) when (e.StatusCode == System.Net.HttpStatusCode.NotFound)
            {
                return new NotFoundResult();
            }
        }

        [FunctionName("GetTagByMac")]
        public static async Task<IActionResult> GetTagByMac([HttpTrigger(AuthorizationLevel.Anonymous, "get", Route = "tag/mac/{macAddress}")] HttpRequest req, string macAddress)
        {
            try
            {
                var result = await GetDeviceByMac(macAddress, tagContainer);
                return result;
            }
            catch (CosmosException e) when (e.StatusCode == System.Net.HttpStatusCode.NotFound)
            {
                return new NotFoundResult();
            }
        }

        public static async Task<IActionResult> GetDeviceByMac(string macAddress, Container container)
        {
            var query = new QueryDefinition("SELECT * FROM c WHERE c.macAddress = @macAddress")
                .WithParameter("@macAddress", macAddress);
            var iterator = container.GetItemQueryIterator<DeviceModel>(query);
            var response = await iterator.ReadNextAsync();
            var item = response.FirstOrDefault();

            return new OkObjectResult(item);

        }

        [FunctionName("GetTagBySite")]
        public static async Task<IActionResult> GetTagBySite(
            [HttpTrigger(AuthorizationLevel.Anonymous, "get", Route = "tag/site/{siteName}")] HttpRequest req,
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

                var iterator = tagContainer.GetItemQueryIterator<DeviceModel>(query);
                var response = await iterator.ReadNextAsync();

                List<DeviceModel> items = response.ToList();

                return new OkObjectResult(items);
            }
            catch (CosmosException e) when (e.StatusCode == System.Net.HttpStatusCode.NotFound)
            {
                return new NotFoundResult();
            }
        }

        [FunctionName("DissociateTagFromSite")]
        public static async Task<IActionResult> DissociateTagFromSite(
          [HttpTrigger(AuthorizationLevel.Anonymous, "put", Route = "tag/dissociate/{macAddress}")] HttpRequest req,
          string macAddress)
        {
            try
            {
                var query = new QueryDefinition("SELECT * FROM c WHERE c.macAddress = @macAddress")
                    .WithParameter("@macAddress", macAddress);

                var iterator = tagContainer.GetItemQueryIterator<DeviceModel>(query);
                var response = await iterator.ReadNextAsync();

                var item = response.FirstOrDefault();

                if (item == null)
                {
                    return new NotFoundResult();
                }

                item.siteName = null;
                item.site = null;
                await tagContainer.UpsertItemAsync(item);
                return new OkObjectResult(item);
            }
            catch (CosmosException e) when (e.StatusCode == System.Net.HttpStatusCode.NotFound)
            {
                return new NotFoundResult();
            }
        }
    }
}
