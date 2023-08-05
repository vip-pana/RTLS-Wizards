using System;
using AptarCloud.Models;
using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.Azure.WebJobs;
using Microsoft.Azure.WebJobs.Host;
using Microsoft.Extensions.Logging;
using Microsoft.Azure.Cosmos;

namespace AptarCloud.Functions
{
    public class ControlWifiTimer
    {
        private static Container anchorContainer = CosmosDbContext.getContainerDbContext(CosmosDbContext.ContainerAnchor);

        [FunctionName("ControlWifiTimer")]
        public async Task Run([TimerTrigger("*/60 * * * * *")] TimerInfo myTimer, ILogger log)
        {
            log.LogInformation($"C# Timer trigger function executed at: {DateTime.Now.ToLocalTime()}");

            //    dynamic items = await AnchorHttp.GetAnchorsMethod();
            //    List<DeviceModel> anchors = items.Value;

            //    if (anchors != null)
            //    {
            //        for (int j = 0; j < anchors.Count; j++)
            //        {
            //            if (anchors[j].connected == true)
            //            {
            //                await AnchorFound(anchors[j], log);
            //            }
            //        }
            //    }
            //}

            //public async Task AnchorFound(DeviceModel anchor, ILogger log)
            //{
            //    dynamic items = await DistanceHttp.GetDistancesMethod();
            //    List<DistanceModel> distances = items.Value;

            //    int count = distances.Count;
            //    int numElementsToAccess = 20;

            //    if (count >= 20)
            //    {
            //        bool isAnchorFound = false;

            //        for (int i = count - 1; i >= count - numElementsToAccess; i--)
            //        {
            //            string distanceMacAddress = distances[i].anchor.macAddress;

            //            if (distanceMacAddress == anchor.macAddress)
            //            {
            //                isAnchorFound = true;
            //                break; // Trovato un elemento con il macAddress dell'ancora, esco dal ciclo
            //            }
            //        }

            //        if (!isAnchorFound)
            //        {
            //            // L'ancora non è stata trovata tra gli ultimi 20 elementi
            //            anchor.connected = false;
            //            await anchorContainer.UpsertItemAsync(anchor);
            //            log.LogInformation($"The anchor {anchor.macAddress} is disconnected");
            //        }
            //    }
        }
    }
}

