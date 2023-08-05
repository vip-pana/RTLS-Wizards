# RTLS-Arduino

RTLS-Arduino is the hardware part of the RTLS project. It is a Real-Time Location System (RTLS) implementation using Arduino boards and compatible hardware. The project aims to provide a cost-effective solution for tracking and locating objects or people in real-time using Arduino-based devices.

## Introduction

The RTLS-Arduino project utilizes specifically ARDUINO DW3000 ESP 32 UWB boards, but is possible to use other Arduino devices along with compatible wireless communication modules, to create a real-time location tracking system. The system consists of multiple nodes/anchors that communicate wirelessly with the tag/device to track to determine the location of objects or people within a defined area.

The project provides a flexible and customizable framework for building an RTLS. It employs popular Arduino development tools and libraries, making it accessible to both beginners and experienced developers interested in location-based applications.

## Features

- Real-time tracking: Track the location of objects or people in real-time within a defined area.
- Scalability: The system supports multiple nodes, allowing for the tracking of multiple targets simultaneously.
- Low-cost solution: Utilize affordable Arduino boards and compatible wireless communication modules for cost-effective implementation.
- Customizability: The project provides a flexible framework that can be adapted to different use cases and requirements.
- Arduino compatibility: Designed to work with various Arduino boards and compatible hardware, providing a wide range of options for hardware selection.

## Getting Started

To get started with the RTLS-Arduino project, follow the steps below.

### Prerequisites

- Arduino IDE: Install the Arduino Integrated Development Environment (IDE) on your computer. The IDE is can be downloaded from the official  website: [https://www.arduino.cc/en/software](https://www.arduino.cc/en/software).

### Installation

1. Clone the RTLS-Arduino repository from GitHub:

    `git clone https://github.com/RTLSWizards/RTLS-Arduino.git`
    
3. Open the cloned repository in the Arduino IDE.
    
4. Connect the Arduino board to your computer via USB.
    
5. Upload the RTLS-Arduino sketch to your Arduino board using the Arduino IDE.

## Usage
To use the devices, you have to connect to them via WiFi to setup the network that will be used by them, using the WiFi Manager. Eventually you can complete the setup in the Setup Page on the Front End. 

After successfully setting up the RTLS-Arduino project on your Arduino board, you can start utilizing the real-time location tracking system. The project provides a foundation for developing custom applications based on your specific tracking requirements.
To customize the system or add new functionality, explore the project codebase and modify it as needed. The RTLS-Arduino project utilizes Arduino programming language, which is based on C/C++, making it accessible for developers familiar with these languages.
Refer to the project's documentation and comments within the code for detailed information on how to extend or modify the system according to your needs.

## License

The RTLS-Arduino project is licensed under the MIT License.
