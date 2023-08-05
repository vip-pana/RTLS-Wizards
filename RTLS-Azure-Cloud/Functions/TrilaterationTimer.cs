using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using AptarCloud.Models;
using Microsoft.Azure.WebJobs;
using Microsoft.Extensions.Logging;

namespace AptarCloud.Functions
{
    public class TrilaterationTimer
    {

        //[FunctionName("TrilaterationTimer")]
        //public async Task Run([TimerTrigger("*/5 * * * * *")] TimerInfo myTimer, ILogger log)
        //{
        //    log.LogInformation($"C# Timer trigger function executed at: {DateTime.Now.ToLocalTime()}");

        //    List<DistanceModel> distances = new List<DistanceModel>();

        //    dynamic items = await DistanceHttp.GetDistancesMethod();
        //    List<DistanceModel> allDistances = items.Value;

        //    for (int i = allDistances.Count - 2; i >= 0; i--)
        //    {
        //        DistanceModel currentDistance = allDistances[i+1];
        //        DistanceModel previousDistance = allDistances[i];
        //        DateTime currentTimestamp = currentDistance.timestamp;
        //        DateTime previousTimestamp = previousDistance.timestamp;
        //        TimeSpan diff = currentTimestamp.Subtract(previousTimestamp);
        //        DateTime today = DateTime.Now.ToLocalTime();
        //        //TimeSpan diff2 = today.Subtract(currentTimestamp);
        //        //if (diff2.Duration() > TimeSpan.FromSeconds(100)) { return; }

        //        if (diff.Duration() < TimeSpan.FromSeconds(40))
        //        {
        //            distances.Add(currentDistance);
        //        }

        //        for (int j = 0; j < distances.Count; j++)
        //        {
        //            for (int k = 0; k < distances.Count; k++)
        //            {
        //                if (j != k && distances[j].anchor.macAddress.Equals(distances[k].anchor.macAddress))
        //                {
        //                    distances.Remove(distances[k]);
        //                }
        //            }
        //        }

        //        int countdistance = distances.Count;
        //        if (countdistance.Equals(3))
        //        {
        //            break;
        //        }
        //    }

        //    double[] coordinates = Trilaterate(distances[0].anchor.positions[0].x, distances[0].anchor.positions[0].y, distances[0].measure,
        //    distances[1].anchor.positions[0].x, distances[1].anchor.positions[0].y, distances[1].measure,
        //    distances[2].anchor.positions[0].x, distances[2].anchor.positions[0].y, distances[2].measure);

        //    PositionModel position = new PositionModel()
        //    {
        //        x = coordinates[0],
        //        y = coordinates[1],
        //        macAddress = distances[0].tag.macAddress,
        //        type = "tag"
        //    };

        //    await PositionHttp.AddPositionMethod(position);

        //    distances.Clear();

        //    log.LogInformation($"C# Timer trigger function finished at: {DateTime.Now.ToLocalTime()}");

        // }

        //private double[] Trilaterate(double x1, double y1, double distance1, double x2, double y2, double distance2, double x3, double y3, double distance3)
        //{
        //    double A = 2 * (x2 - x1);
        //    double B = 2 * (y2 - y1);
        //    double C = Math.Pow(distance1, 2) - Math.Pow(distance2, 2) - Math.Pow(x1, 2) + Math.Pow(x2, 2) - Math.Pow(y1, 2) + Math.Pow(y2, 2);
        //    double D = 2 * (x3 - x2);
        //    double E = 2 * (y3 - y2);
        //    double F = Math.Pow(distance2, 2) - Math.Pow(distance3, 2) - Math.Pow(x2, 2) + Math.Pow(x3, 2) - Math.Pow(y2, 2) + Math.Pow(y3, 2);

        //    double x = (C * E - F * B) / (E * A - B * D);
        //    double y = (C * D - A * F) / (B * D - A * E);

        //    double[] coordinates = { x, y };
        //    return coordinates;

        //}
    }
}
