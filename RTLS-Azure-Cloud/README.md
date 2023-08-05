# RTLS-Azure Cloud Backend

This repository contains the backend implementation for the Real-Time Location System (RTLS) using Azure Functions and Timer Triggers. The backend facilitates communication between devices and the frontend through exposed APIs.

## Contents

The backend is built on Azure Functions, which are serverless computing units that provide endpoints for various operations. It includes the following key components:

1. **API Endpoints**: Azure Functions serve as APIs that allow devices (DW3000 ESP32 UWB modules) to communicate with the frontend React application. These APIs enable the devices to send distance data calculated by the UWB modules.

2. **Timer Trigger for Trilateration**: The backend implements a Timer Trigger function on Azure, which runs periodically at specified intervals. Utilizing the trilateration formula, this function calculates and stores the positions of tags based on the distances recorded by the anchors. Regular execution of this function ensures that the positions are continuously updated.

3. **Database Integration**: The backend integrates with Azure Cosmos DB, a globally distributed NoSQL database service. The distance data from the devices is stored in Cosmos DB for subsequent processing and position calculations.

## Communication Flow

1. Devices (tags) equipped with DW3000 ESP32 UWB modules transmit distance data to the backend using HTTP POST requests to the exposed API endpoints.

2. The backend receives the distance data and stores it in Azure Cosmos DB for later use.

3. The Timer Trigger function periodically executes the trilateration algorithm using the stored distance data to calculate the precise positions of the tags.

4. The calculated positions are then made available to the frontend React application through API endpoints, which can be accessed using HTTP GET requests.

## Benefits

- **Real-Time Positioning**: The RTLS system offers real-time positioning capabilities, allowing the frontend application to display the location of tags in real-time.

- **Scalability and Reliability**: Leveraging Azure Functions and Cosmos DB ensures high scalability and reliability, handling a large number of devices and data efficiently.

- **Low Latency**: The serverless architecture and efficient algorithms result in low latency, providing real-time updates to the frontend.

- **Cost-Effectiveness**: By utilizing serverless computing and a managed database service, the backend achieves cost-effectiveness and reduces infrastructure maintenance efforts.

## Usage

1. Clone the repository and set up the required Azure services (Azure Functions and Cosmos DB).

2. Deploy the Azure Functions to create the API endpoints and Timer Trigger function.

3. Configure the frontend React application to interact with the exposed API endpoints for real-time tracking and visualization.

## Notes

- Ensure a reliable radio coverage environment for accurate distance measurements between devices and anchors.

- Consider possible signal reflections and optimize anchor and gateway placement to mitigate signal interference.

For any issues or inquiries, please feel free to open an issue in the repository.

