# RTLS - Frontend

This repository contains the frontend application for the Real-Time Location System (RTLS) implemented in React. The application communicates with the backend through APIs, enabling users to visualize the spaghetti chart for tracking and perform device setup.

## Contents

The frontend application is built using React and Chakra UI for the user interface. It includes the following key components:

1. **Spaghetti Chart Visualization**: The application displays the spaghetti chart, which visualizes the real-time tracking of tags on a map. The chart dynamically updates as the Timer Trigger function in the backend calculates and sends the updated tag positions.

2. **Device Setup**: Users can use the frontend application to perform device setup. The setup process involves configuring and associating devices (DW3000 ESP32 UWB modules) with specific sites and machines using API calls to the backend.

3. **Interaction with Backend**: The frontend application interacts with the backend through API requests. It uses HTTP GET requests to retrieve updated tag positions and HTTP POST requests for device setup and configuration.

## Usage

1. Clone the repository and install the required dependencies using npm or yarn.

2. Configure the application to communicate with the backend API endpoints for real-time tracking and device setup.

3. Run the application using the development server provided by React.

4. Access the application through the browser and view the spaghetti chart for real-time tracking.

5. Utilize the user-friendly interface to perform device setup and configuration.

## Benefits

- **Real-Time Tracking**: The application provides a user-friendly spaghetti chart visualization, offering real-time tracking of tags' positions on a map.

- **Easy Device Setup**: Users can easily set up and configure devices using the frontend application, streamlining the initialization process.

- **Responsive UI**: The application's responsive user interface is accessible from various devices, enabling users to track tags from their preferred devices.

- **Intuitive Design**: The React and Chakra UI combination results in an intuitive and visually appealing design, enhancing user experience.

## Notes

- Ensure that the backend (RTLS_Azure Cloud Backend) is properly deployed and functioning to ensure seamless communication between the frontend and backend.

- The frontend application may require configuration adjustments to align with specific backend API endpoints.

For any issues or inquiries, please feel free to open an issue in the repository.
