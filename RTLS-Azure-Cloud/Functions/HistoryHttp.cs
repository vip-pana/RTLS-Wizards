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
using System.Linq;
using Azure;
using System.Collections.Generic;
using System.Globalization;

namespace AptarCloud.Functions
{
    public static class HistoryHttp
    {
        private static Container historyContainer = CosmosDbContext.getContainerDbContext(CosmosDbContext.ContainerHistory);
        private static Container siteContainer = CosmosDbContext.getContainerDbContext(CosmosDbContext.ContainerSite);
        private static Container anchorContainer = CosmosDbContext.getContainerDbContext(CosmosDbContext.ContainerAnchor);
        private static Container tagContainer = CosmosDbContext.getContainerDbContext(CosmosDbContext.ContainerTag);
        private static Container machineContainer = CosmosDbContext.getContainerDbContext(CosmosDbContext.ContainerMachine);

        [FunctionName("GetHistoryByFilter")]
        public static async Task<IActionResult> GetHistoryByFilter(
            [HttpTrigger(AuthorizationLevel.Anonymous, "get", Route = "history/{siteName}/{machineName}/{dateRecording}")] HttpRequest req,
            string siteName, string machineName, string dateRecording)
        {
            try
            {
                var historyItems = new List<HistoryModel>();
                var queryText = "";
                QueryDefinition queryDefinition;

                // Recupero oggetti con data non nulla
                if (!string.IsNullOrEmpty(dateRecording) && dateRecording != "null")
                {
                    queryText = "SELECT * FROM c WHERE c.site.name = @siteName AND c.machine.name = @machineName AND (udf.GetDate(c.dateStart) = @date OR udf.GetDate(c.dateEnd) = @date)";
                    queryDefinition = new QueryDefinition(queryText)
                        .WithParameter("@siteName", siteName)
                        .WithParameter("@machineName", machineName)
                        .WithParameter("@date", dateRecording);

                    var iterator = historyContainer.GetItemQueryIterator<HistoryModel>(queryDefinition);
                    while (iterator.HasMoreResults)
                    {
                        var response = await iterator.ReadNextAsync();
                        historyItems.AddRange(response.ToList());
                    }
                }
                else
                {
                    // Recupero i due oggetti dal name 
                    queryText = "SELECT * FROM c WHERE c.site.name = @siteName AND c.machine.name = @machineName";
                    queryDefinition = new QueryDefinition(queryText)
                        .WithParameter("@siteName", siteName)
                        .WithParameter("@machineName", machineName);

                    var iterator = historyContainer.GetItemQueryIterator<HistoryModel>(queryDefinition);
                    while (iterator.HasMoreResults)
                    {
                        var response = await iterator.ReadNextAsync();
                        historyItems.AddRange(response.ToList());
                    }
                }

                return new OkObjectResult(historyItems);

            }
            catch (CosmosException e) when (e.StatusCode == System.Net.HttpStatusCode.NotFound)
            {
                return new NotFoundResult();
            }

        }

        [FunctionName("StartRecording")]
        public static async Task<IActionResult> StartRecording([HttpTrigger(AuthorizationLevel.Anonymous, "post", Route = "startrec")] HttpRequest req)
        {
            string requestBody = await new StreamReader(req.Body).ReadToEndAsync();
            dynamic data = JsonConvert.DeserializeObject<StartRecording>(requestBody);

            if (data != null && data.machineName != null && data.siteName != null)
            {
                string machineName = data.machineName;
                string siteName = data.siteName;
                List<DeviceModel> tags = new List<DeviceModel>();
                List<DeviceModel> anchors = new List<DeviceModel>();

                try {

                    // Recupero site da siteName
                    SiteModel siteExist = null;
                    QueryDefinition querySite = new QueryDefinition("SELECT * FROM c WHERE c.name = @siteName")
                        .WithParameter("@siteName", siteName);

                    var iteratorSite = siteContainer.GetItemQueryIterator<SiteModel>(querySite);
                    var responseSite = await iteratorSite.ReadNextAsync();
                    siteExist = responseSite.FirstOrDefault();

                    // Recupero machine da machineName
                    MachineModel machineExist = null;
                    QueryDefinition queryMachine = new QueryDefinition("SELECT * FROM c WHERE c.name = @machineName")
                        .WithParameter("@machineName", machineName);

                    var iteratorMachine = machineContainer.GetItemQueryIterator<MachineModel>(queryMachine);
                    var responseMachine = await iteratorMachine.ReadNextAsync();
                    machineExist = responseMachine.FirstOrDefault();

                    if (machineExist != null && siteName !=null)
                    {
                        // Trovo ancore con quei requisiti
                        QueryDefinition queryAnchor = new QueryDefinition("SELECT * FROM c WHERE c.siteName = @siteName AND c.machineName = @machineName")
                            .WithParameter("@siteName", siteName)
                            .WithParameter("@machineName", machineName);
                        var iteratorAnchor = anchorContainer.GetItemQueryIterator<DeviceModel>(queryAnchor);
                        var responseAnchor = await iteratorAnchor.ReadNextAsync();
                        anchors = responseAnchor.ToList();

                        // Trovo tags con quei requisiti
                        QueryDefinition queryTag = new QueryDefinition("SELECT * FROM c WHERE c.siteName = @siteName AND c.machineName = @machineName")
                            .WithParameter("@siteName", siteName)
                            .WithParameter("@machineName", machineName);
                        var iteratorTag = tagContainer.GetItemQueryIterator<DeviceModel>(queryTag);
                        var responseTag = await iteratorTag.ReadNextAsync();
                        tags = responseTag.ToList();

                        // Verifico che i tags esistano e li memorizzo senza posizioni
                        if (tags != null)
                        {
                            foreach (var tag in tags)
                            {
                                tag.positions = new List<PositionModel>();
                            }
                        }

                        // Salvo oggetto history iniziale
                        HistoryModel history = new HistoryModel()
                        {
                            machine = machineExist, 
                            site = siteExist,
                            tags = tags,
                            anchors = anchors
                        };

                        await historyContainer.CreateItemAsync(history);
                        return new OkObjectResult(history);

                    }
                    else
                    {
                        return new NotFoundObjectResult("Machine o site non esistenti!");
                    }
                }
                catch (Exception ex)
                { return new BadRequestObjectResult(ex.ToString()); }
            }
            else
            {
                return new BadRequestObjectResult("I parametri machineName e siteName sono obbligatori");
            }

        }

        [FunctionName("StopRecording")]
        public static async Task<IActionResult> StopRecording([HttpTrigger(AuthorizationLevel.Anonymous, "put", Route = "stoprec/{id}")] HttpRequest req, string id)
        {
            List<DeviceModel> tags = new List<DeviceModel>();
            try
            {
                // Recupero l'oggetto iniziale history dall'id
                var item = await historyContainer.ReadItemAsync<HistoryModel>(id, new PartitionKey(id));

                // Se l'item non esiste do errore
                if (item == null)
                {
                    return new NotFoundObjectResult("Oggetto history non trovato");
                }

                DateTime dateStart = item.Resource.dateStart;
                DateTime dateEnd = DateTime.Now.ToLocalTime();

                foreach (var tagHistory in item.Resource.tags)
                {
                    // Trovo tags dell'oggetto history e aggiungo le posizioni
                    var tag = await tagContainer.ReadItemAsync<DeviceModel>(tagHistory.id, new PartitionKey(tagHistory.id));

                    tag.Resource.positions = tag.Resource.positions
                         .Where(position => position.timestamp >= dateStart && position.timestamp <= dateEnd)
                         .ToList();

                    tags.Add(tag.Resource);
                    tag.Resource.positions = new List<PositionModel>();                 
                    await tagContainer.UpsertItemAsync(tag.Resource);
                }

                item.Resource.tags = tags;
                item.Resource.dateEnd = dateEnd;
                await historyContainer.UpsertItemAsync(item.Resource);

                return new OkObjectResult(item.Resource);
            }
            catch (CosmosException e) when (e.StatusCode == System.Net.HttpStatusCode.NotFound)
            {
                return new NotFoundResult();
            }
        }
    }
}

