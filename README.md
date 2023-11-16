# README for Orbits Stochastic Drum Machine

## Overview

Orbits is a web-based stochastic drum machine, designed for both beginners and experienced musicians. It utilizes randomness and probability to create unique drum patterns, providing a new way of discovering rhythms and beats. This project is open-source, and users are encouraged to use any parts of the code to build their own instruments or projects with RNBO.

## Features

- Stochastic drum pattern generation
- Intuitive user interface with dials, sliders, and buttons
- Fully interactive with real-time control over drum sequence parameters
- Web-based, no installation required, and free to use

## Getting Started

To use Orbits, navigate to [Orbits Drum Machine](https://www.iimaginary.com/orbits) in your web browser.

### Controls

- **Density**: Adjusts the number of hits in a drum pattern.
- **Hide**: Alters the length of the pattern, effectively 'hiding' parts of it.
- **Random**: Generates a unique drum pattern at the click of a button.
- **Length**: Modifies the duration of a drum hit.
- **Tune**: Changes the pitch of a drum hit.
- **Tempo**: Controls the speed of the pattern playback.

## Development

### Prerequisites

- A modern web browser with support for Web Audio API.
- Basic knowledge of JavaScript and web development to modify or extend the functionality.

### Setup

1. Clone the repository to your local machine.
2. Open the `index.html` file in your browser to run the application locally.
3. Explore the `js` directory to find the different modules responsible for various aspects of the application, such as UI controls and audio processing.
4. Map controls from your RNBO patch to UI elements by modifying the parameters.JSON file.

### Customization

Feel free to use any part of the code as a starting point for your own creation. The application is modular, making it straightforward to adapt or extend:

- Utilize the `createSliders`, `createDials`, `createButtons`, etc., from `uiControls.js` for custom UI elements.
- Leverage the `attachOutports` method from `outportHandlers.js` to handle output from RNBO devices.

## Contributing

Contributions are welcome. If you have an idea for improvement or have found a bug, please open an issue or submit a pull request.

## License

This project is open-source and available under the [MIT License](LICENSE.md). Feel free to use and modify the code for personal or commercial projects.

## Acknowledgements

- RNBO by Cycling '74 for the audio engine.
- 
