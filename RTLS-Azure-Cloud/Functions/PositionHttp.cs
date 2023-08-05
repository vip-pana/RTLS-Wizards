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
using Azure;
using System.Linq;

namespace AptarCloud.Functions
{

    public static class PositionHttp
    {
        private static Container positionContainer = CosmosDbContext.getContainerDbContext(CosmosDbContext.ContainerPosition);
        private static Container tagContainer = CosmosDbContext.getContainerDbContext(CosmosDbContext.ContainerTag);
        private static Container anchorContainer = CosmosDbContext.getContainerDbContext(CosmosDbContext.ContainerAnchor);


        [FunctionName("AddPosition")]
        public static async Task<IActionResult> Add(
            [HttpTrigger(AuthorizationLevel.Function, "post", Route = "position")] HttpRequest req)
        {

            string requestBody = await new StreamReader(req.Body).ReadToEndAsync();
            dynamic data = JsonConvert.DeserializeObject<PositionModel>(requestBody);

            if (data != null &&
                data.x != null && data.y != null &&
                data.macAddress != null)
            {
                PositionModel position = new PositionModel()
                {
                    x = data.x,
                    y = data.y,
                    macAddress = data.macAddress,
                    type = data.type
                };
                try
                {
                    await positionContainer.CreateItemAsync(position);
                    if (data.type == "tag")
                    {
                        dynamic tagExist = await TagHttp.GetDeviceByMac(data.macAddress, tagContainer);
                        DeviceModel tag = tagExist.Value;
                        tag.positions.Add(position);
                        await tagContainer.UpsertItemAsync(tag);
                    }
                    else if (data.type == "anchor")
                    {
                        dynamic anchorExist = await TagHttp.GetDeviceByMac(data.macAddress, anchorContainer);
                        DeviceModel anchor = anchorExist.Value;
                        anchor.positions.Add(position);
                        await anchorContainer.UpsertItemAsync(anchor);
                    }

                }
                catch (Exception ex)
                { return new BadRequestObjectResult(ex.ToString()); }

                return new OkObjectResult(data);
            }
            else
            {
                return new BadRequestObjectResult("Dati errati o non inseriti");
            }
        }

        [FunctionName("GetPosition")]
        public static async Task<IActionResult> Get([HttpTrigger(AuthorizationLevel.Anonymous, "get", Route = "position")] HttpRequest req)
        {
            var items = positionContainer.GetItemQueryIterator<PositionModel>();

            return new OkObjectResult((await items.ReadNextAsync()).ToList());
        }

        [FunctionName("GetPositionById")]
        public static async Task<IActionResult> GetById(
         [HttpTrigger(AuthorizationLevel.Anonymous, "get", Route = "position/{id}")] HttpRequest req, string id)
        {
            try
            {
                var item = await positionContainer.ReadItemAsync<PositionModel>(id, new PartitionKey(id));
                return new OkObjectResult(item.Resource);
            }
            catch (CosmosException e) when (e.StatusCode == System.Net.HttpStatusCode.NotFound)
            {
                return new NotFoundResult();
            }
        }

        [FunctionName("DeletePosition")]
        public static async Task<IActionResult> Delete(
        [HttpTrigger(AuthorizationLevel.Anonymous, "delete", Route = "position/{id}")] HttpRequest req, string id)
        {
            try
            {
                var item = await positionContainer.ReadItemAsync<PositionModel>(id, new PartitionKey(id));

                await positionContainer.DeleteItemAsync<PositionModel>(id, new PartitionKey(id));
                return new OkResult();
            }
            catch (CosmosException e) when (e.StatusCode == System.Net.HttpStatusCode.NotFound)
            {
                return new NotFoundResult();
            }
        }

        [FunctionName("GetPositionsByMac")]
        public static async Task<IActionResult> GetPositionsByMac([HttpTrigger(AuthorizationLevel.Anonymous, "get", Route = "position/mac/{macAddress}")] HttpRequest req, string macAddress)
        {
            try
            {
                var query = new QueryDefinition("SELECT * FROM c WHERE c.macAddress = @macAddress")
                    .WithParameter("@macAddress", macAddress);

                var iterator = positionContainer.GetItemQueryIterator<PositionModel>(query);
                var response = (await iterator.ReadNextAsync()).ToList();


                if (response == null)
                {
                    return new NotFoundResult();
                }

                return new OkObjectResult(response);
            }
            catch (CosmosException e) when (e.StatusCode == System.Net.HttpStatusCode.NotFound)
            {
                return new NotFoundResult();
            }
        }

        public static async Task<IActionResult> AddPositionMethod(dynamic position)
        {
            try
            {
                await positionContainer.CreateItemAsync(position);

                dynamic tagExist = await TagHttp.GetDeviceByMac(position.macAddress, tagContainer);
                DeviceModel tag = tagExist.Value;
                tag.positions.Add(position);
                await tagContainer.UpsertItemAsync(tag);

                return new OkObjectResult(position);

            }
            catch (Exception ex)
            { return new BadRequestObjectResult(ex.ToString()); }
        }

    }
}
