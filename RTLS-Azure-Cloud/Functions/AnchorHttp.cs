using System;
using System.IO;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Azure.WebJobs;
using Microsoft.Azure.WebJobs.Extensions.Http;
using Microsoft.AspNetCore.Http;
using Newtonsoft.Json;
using AptarCloud.Models;
using Microsoft.Azure.Cosmos;
using System.Linq;
using System.Collections.Generic;
using System.Net.Mail;

namespace AptarCloud.Functions
{
    public static class AnchorHttp
    {
        private static Container anchorContainer = CosmosDbContext.getContainerDbContext(CosmosDbContext.ContainerAnchor);
        private static Container siteContainer = CosmosDbContext.getContainerDbContext(CosmosDbContext.ContainerSite);
        private static Container tagContainer = CosmosDbContext.getContainerDbContext(CosmosDbContext.ContainerTag);


        [FunctionName("AddAnchor")]
        public static async Task<IActionResult> Add(
            [HttpTrigger(AuthorizationLevel.Anonymous, "post", Route = "anchor")] HttpRequest req)
        {
            string requestBody = await new StreamReader(req.Body).ReadToEndAsync();
            dynamic data = JsonConvert.DeserializeObject<DeviceModel>(requestBody);

            if (data != null && data.macAddress != null && data.type != null && data.connected != null)
            {
                QueryDefinition query = new QueryDefinition("SELECT * FROM c WHERE c.macAddress = @macAddress")
                    .WithParameter("@macAddress", data.macAddress);

                var iterator = anchorContainer.GetItemQueryIterator<DeviceModel>(query);
                var response = await iterator.ReadNextAsync();

                var deviceExist = response.FirstOrDefault();


                PositionModel position = new PositionModel()
                {
                    x = 0,
                    y = 0,
                    macAddress = data.macAddress,
                    type = data.type
                };
                List<PositionModel> positionsList= new List<PositionModel> { position };

                SiteModel siteExist = null;
                if(data.siteName != null)
                {
                    QueryDefinition querySite = new QueryDefinition("SELECT * FROM c WHERE c.name = @site")
                    .WithParameter("@site", data.siteName);

                    var iteratorSite = siteContainer.GetItemQueryIterator<SiteModel>(querySite);
                    var responseSite = await iteratorSite.ReadNextAsync();

                    siteExist = responseSite.FirstOrDefault();
                }
                
                if (deviceExist != null)
                { 

                    DeviceModel item = new DeviceModel()
                    {
                        id = deviceExist.id,
                        macAddress = deviceExist.macAddress,
                        type = deviceExist.type,
                        connected = deviceExist.connected,
                        positions = deviceExist.positions,
                        site = siteExist != null ? siteExist : null,
                        siteName = siteExist != null ? siteExist.name: null,
                        machineName = data.machineName != null ? data.machineName : deviceExist.machineName
                    };
                    await anchorContainer.UpsertItemAsync(item);
                    return new OkObjectResult("Elemento aggiornato con successo!");
                }

                DeviceModel anchor = new DeviceModel()
                {
                    macAddress = data.macAddress,
                    type = data.type,
                    positions = positionsList,
                    connected = data.connected,
                    site = data.siteName == null ? null : siteExist,
                    siteName = data.siteName == null ? null : siteExist.name,
                    machineName = data.machineName == null ? null : data.machineName
                };

                try
                { await anchorContainer.CreateItemAsync(anchor); }
                catch (Exception ex)
                { return new BadRequestObjectResult(ex.ToString()); }

                return new OkObjectResult(anchor);
            }
            else
            {
                return new BadRequestObjectResult("Dati errati o non inseriti");
            }

        }

        [FunctionName("GetAnchor")]
        public static async Task<IActionResult> Get([HttpTrigger(AuthorizationLevel.Anonymous, "get", Route = "anchor")] HttpRequest req)
        {
            var items = anchorContainer.GetItemQueryIterator<DeviceModel>();

            return new OkObjectResult((await items.ReadNextAsync()).ToList());
        }

        [FunctionName("GetAnchorById")]
        public static async Task<IActionResult> GetById(
          [HttpTrigger(AuthorizationLevel.Anonymous, "get", Route = "anchor/{id}")] HttpRequest req,
          string id)
        {
            try
            {
                var item = await anchorContainer.ReadItemAsync<DeviceModel>(id, new PartitionKey(id));
                return new OkObjectResult(item.Resource);
            }
            catch (CosmosException e) when (e.StatusCode == System.Net.HttpStatusCode.NotFound)
            {
                return new NotFoundResult();
            }
        }

        [FunctionName("GetAnchorBySite")]
        public static async Task<IActionResult> GetBySite(
            [HttpTrigger(AuthorizationLevel.Anonymous, "get", Route = "anchor/site/{siteName}")] HttpRequest req,
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

                var iterator = anchorContainer.GetItemQueryIterator<DeviceModel>(query);
                var response = await iterator.ReadNextAsync();

                List<DeviceModel> items = response.ToList();

                return new OkObjectResult(items);
            }
            catch (CosmosException e) when (e.StatusCode == System.Net.HttpStatusCode.NotFound)
            {
                return new NotFoundResult();
            }
        }

        [FunctionName("GetAnchorByMac")]
        public static async Task<IActionResult> GetAnchorByMac([HttpTrigger(AuthorizationLevel.Anonymous, "get", Route = "anchor/mac/{macAddress}")] HttpRequest req, string macAddress)
        {
            try
            {
                var query = new QueryDefinition("SELECT * FROM c WHERE c.macAddress = @macAddress")
                    .WithParameter("@macAddress", macAddress);

                var iterator = anchorContainer.GetItemQueryIterator<DeviceModel>(query);
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


        [FunctionName("UpdateAnchor")]
        public static async Task<IActionResult> Update([HttpTrigger(AuthorizationLevel.Anonymous, "put", Route = "anchor/{id}")] HttpRequest req, string id)
        {
            try
            {
                string requestData = await new StreamReader(req.Body).ReadToEndAsync();
                var data = JsonConvert.DeserializeObject<DeviceModel>(requestData);

                var item = await anchorContainer.ReadItemAsync<DeviceModel>(id, new PartitionKey(id));

                item.Resource.macAddress = data.macAddress;
                item.Resource.positions = data.positions;
                item.Resource.connected= data.connected;
                item.Resource.machineName = data.machineName;
                item.Resource.siteName = data.siteName;
                await anchorContainer.UpsertItemAsync(item.Resource);

                return new OkObjectResult(item.Resource);
            }
            catch (CosmosException e) when (e.StatusCode == System.Net.HttpStatusCode.NotFound)
            {
                return new NotFoundResult();
            }
        }


        [FunctionName("UpdateAnchorPositionsByMac")]
        public static async Task<IActionResult> UpdateAnchorPositionsByMac([HttpTrigger(AuthorizationLevel.Anonymous, "put", Route = "anchor/mac/positions/{macAddress}")] HttpRequest req, string macAddress)
        {
            try
            {
                string requestData = await new StreamReader(req.Body).ReadToEndAsync();
                var data = JsonConvert.DeserializeObject<SimplePositionModel>(requestData);

                if (data.x == null || data.y == null)
                {
                    return new NotFoundResult();
                }

                var query = new QueryDefinition("SELECT * FROM c WHERE c.macAddress = @macAddress").WithParameter("@macAddress", macAddress);

                var iterator = anchorContainer.GetItemQueryIterator<DeviceModel>(query);
                var response = await iterator.ReadNextAsync();

                var item = response.FirstOrDefault();

                if (item == null)
                {
                    return new NotFoundResult();
                }

                item.positions[0].x = data.x;
                item.positions[0].y = data.y;
                await anchorContainer.UpsertItemAsync(item);

                return new OkObjectResult(item);
            }
            catch (CosmosException e) when (e.StatusCode == System.Net.HttpStatusCode.NotFound)
            {
                return new NotFoundResult();
            }
        }

        [FunctionName("DissasociateAnchorFromSite")]
        public static async Task<IActionResult> DissociateAnchorFromSite(
         [HttpTrigger(AuthorizationLevel.Anonymous, "put", Route = "anchor/dissociate/{macAddress}")] HttpRequest req,
         string macAddress)
        {
            try
            {
                var query = new QueryDefinition("SELECT * FROM c WHERE c.macAddress = @macAddress")
                    .WithParameter("@macAddress", macAddress);

                var iterator = anchorContainer.GetItemQueryIterator<DeviceModel>(query);
                var response = await iterator.ReadNextAsync();

                var item = response.FirstOrDefault();

                if (item == null)
                {
                    return new NotFoundResult();
                }

                item.siteName = null;
                item.site = null;
                item.machineName = null;
                await anchorContainer.UpsertItemAsync(item);
                return new OkObjectResult(item);
            }
            catch (CosmosException e) when (e.StatusCode == System.Net.HttpStatusCode.NotFound)
            {
                return new NotFoundResult();
            }
        }

        [FunctionName("DeleteAnchor")]
        public static async Task<IActionResult> Delete(
        [HttpTrigger(AuthorizationLevel.Anonymous, "delete", Route = "anchor/{id}")] HttpRequest req, string id)
        {
            try
            {
                var item = await anchorContainer.ReadItemAsync<DeviceModel>(id, new PartitionKey(id));

                await anchorContainer.DeleteItemAsync<DeviceModel>(id, new PartitionKey(id));
                return new OkResult();
            }
            catch (CosmosException e) when (e.StatusCode == System.Net.HttpStatusCode.NotFound)
            {
                return new NotFoundResult();
            }
        }


        [FunctionName("DissasociateAllFromSite")]
        public static async Task<IActionResult> DissasociateAllFromSite(
         [HttpTrigger(AuthorizationLevel.Anonymous, "put", Route = "anchor/all/dissociate/{siteName}")] HttpRequest req, string siteName)
        {
            try
            {
                var query = new QueryDefinition("SELECT * FROM c WHERE c.siteName = @siteName")
                    .WithParameter("@siteName", siteName);

                var iterator = anchorContainer.GetItemQueryIterator<DeviceModel>(query);
                var response = await iterator.ReadNextAsync();

                var items = response.ToList();

                if (items == null)
                {
                    return new NotFoundResult();
                }

                for (int i=0; i<items.Count;i++)
                {
                    items[i].siteName = null;
                    items[i].site = null;
                    items[i].machineName = null;
                }

                foreach (var item in items)
                {
                    await anchorContainer.UpsertItemAsync(item);
                }

                // Faccio la stessa cosa per i tags
                var queryTags = new QueryDefinition("SELECT * FROM c WHERE c.siteName = @siteName")
                    .WithParameter("@siteName", siteName);

                var iteratorTags = tagContainer.GetItemQueryIterator<DeviceModel>(queryTags);
                var responseTags = await iteratorTags.ReadNextAsync();
                var itemsTags = responseTags.ToList();

                if (itemsTags == null)
                {
                    return new NotFoundResult();
                }

                for (int j = 0; j < itemsTags.Count; j++)
                {
                    itemsTags[j].siteName = null;
                    itemsTags[j].site = null;
                    itemsTags[j].machineName = null;
                }

                foreach (var itemTag in itemsTags)
                {
                    await tagContainer.UpsertItemAsync(itemTag);
                }

                return new OkObjectResult(items);
            }
            catch (CosmosException e) when (e.StatusCode == System.Net.HttpStatusCode.NotFound)
            {
                return new NotFoundResult();
            }
        }

        // Utilizzato per trigger timer ControlWifi
        public static async Task<IActionResult> GetAnchorsMethod()
        {
            var items = anchorContainer.GetItemQueryIterator<DeviceModel>();

            return new OkObjectResult((await items.ReadNextAsync()).ToList());
        }


    }
}
