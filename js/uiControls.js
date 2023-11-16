import { switchIDMap, buttonIDMap, dialIDMap, sliderElements, dialElements } from './config.js';


/**
 * Creates slider controls for the device parameters and sets up event listeners for parameter changes.
 * @param {Map} parametersMap - A map containing parameter configuration.
 * @param {Object} device - The RNBO device instance.
 */
export function createSliders(parametersMap, device) {
    let pdiv = document.getElementById("rnbo-parameter-sliders");
    let noParamLabel = document.getElementById("no-param-label");
    if (noParamLabel && device.numParameters > 0) pdiv.removeChild(noParamLabel);

    // This will allow us to ignore parameter update events while dragging the slider.
    let isDraggingSlider = false;

    // Open for forEach loop, create a variable containing the ID of the current parameter
    device.parameters.forEach(param => {
    const paramData = parametersMap.get(param.id);
    
    // Check the control type of the current parameter in parameters.json
    if (paramData && paramData.control === "slider") {


        // Create a label, an input slider and a value display
        let label = document.createElement("label");
        let slider = document.createElement("input");
        let text = document.createElement("input");
        let sliderContainer = document.createElement("div");
        sliderContainer.appendChild(label);
        sliderContainer.appendChild(slider);
        sliderContainer.appendChild(text);

        // Add a name for the label
        label.setAttribute("name", param.name);
        label.setAttribute("for", param.name);
        label.setAttribute("class", "param-label");
        label.textContent = `${param.name}: `;

        // Make each slider reflect its parameter
        slider.setAttribute("type", "range");
        slider.setAttribute("class", "param-slider");
        slider.setAttribute("id", param.id);
        slider.setAttribute("name", param.name);
        slider.setAttribute("min", param.min);
        slider.setAttribute("max", param.max);
        if (param.steps > 1) {
            slider.setAttribute("step", (param.max - param.min) / (param.steps - 1));
        } else {
            slider.setAttribute("step", (param.max - param.min) / 1000.0);
        }
        slider.setAttribute("value", param.value);

        // Make a settable text input display for the value
        text.setAttribute("value", param.value.toFixed(1));
        text.setAttribute("type", "text");

        // Make each slider control its parameter
        slider.addEventListener("pointerdown", () => {
            isDraggingSlider = true;
        });
        slider.addEventListener("pointerup", () => {
            isDraggingSlider = false;
            slider.value = param.value;
            text.value = param.value.toFixed(1);
        });
        slider.addEventListener("input", () => {
            let value = Number.parseFloat(slider.value);
            param.value = value;
        });

        // Make the text box input control the parameter value as well
        text.addEventListener("keydown", (ev) => {
            if (ev.key === "Enter") {
                let newValue = Number.parseFloat(text.value);
                if (isNaN(newValue)) {
                    text.value = param.value;
                } else {
                    newValue = Math.min(newValue, param.max);
                    newValue = Math.max(newValue, param.min);
                    text.value = newValue;
                    param.value = newValue;
                }
            }
        });

        // Store the slider and text by name so we can access them later
        sliderElements[param.id] = { slider, text };

        // Add the slider element
        pdiv.appendChild(sliderContainer);
    }
    });
    
    // Listen to parameter changes from the device
    device.parameterChangeEvent.subscribe(param => {
        if (sliderElements[param.id]) {
            if (!isDraggingSlider)
            sliderElements[param.id].slider.value = param.value;
            sliderElements[param.id].text.value = param.value.toFixed(1);
        }
    });

}


/**
 * Creates dial controls for the device parameters and sets up event listeners for parameter changes.
 * @param {Map} parametersMap - A map containing parameter configuration.
 * @param {Object} device - The RNBO device instance.
 */
export function createDials(parametersMap, device) {
    const allowedParameters = new Set(["densityAB", "hideAB", "densityCD", "hideCD", "densityEF", "hideEF", "densityGH", "hideGH"]);
    device.parameters.forEach(param => {
        const paramData = parametersMap.get(param.id);

        if (paramData && paramData.control === "dial") {
            const dialID = dialIDMap[paramData.name];

            if (dialID) {
                const dialContainer = document.getElementById(dialID);

                if (dialContainer) {
                    let dialDiv = document.createElement("div");
                    dialContainer.appendChild(dialDiv);

                    let container = document.createElement('div');
                    container.classList.add('dial-container');
                    dialDiv.parentElement.appendChild(container);
                    container.appendChild(dialDiv);

                    let dial = new Nexus.Dial(dialDiv, {
                        'size': [50, 50],
                        'interaction': 'vertical',
                        'mode': 'relative',
                        'min': param.min,
                        'max': param.max,
                        'step': param.steps > 1 ? (param.max - param.min) / (param.steps - 1) : (param.max - param.min) / 10000.0,
                        'value': param.value
                    });

                    if (paramData.accentColor) {
                        dial.colorize("accent", paramData.accentColor);
                    }
                    if (paramData.fillColor) {
                        dial.colorize("fill", paramData.fillColor);
                    }

                    let valueLabel;
                    if (allowedParameters.has(paramData.name)) {
                        valueLabel = document.createElement('div');
                        valueLabel.textContent = Math.round(dial.value);
                        valueLabel.classList.add('dial-value');
                        container.appendChild(valueLabel);
                    }

                    // Attach the change event listener to all dials
                    dial.on('change', function (value) {
                        param.value = Math.round(value);

                        // Update the value label only if it exists (i.e., for dials in allowedParameters)
                        if (valueLabel) {
                            valueLabel.textContent = Math.round(dial.value);
                        }
                    });

                    dialElements[param.id] = {
                        dial,
                        valueLabel: typeof valueLabel !== 'undefined' ? valueLabel : null
                    };

                }
            }
        }
    });

    device.parameterChangeEvent.subscribe(param => {
        if (dialElements[param.id]) {
            dialElements[param.id].dial.value = param.value;
            if (dialElements[param.id].valueLabel) {
                dialElements[param.id].valueLabel.textContent = Math.round(param.value);
            }
        }
    });
}


/**
 * Creates button controls for the device parameters and sets up event listeners for parameter changes.
 * @param {Map} parametersMap - A map containing parameter configuration.
 * @param {Object} device - The RNBO device instance.
 */
export function createButtons(parametersMap, device) {

    device.parameters.forEach(param => {
        const paramData = parametersMap.get(param.id);

        if (paramData && paramData.control === "button") {
            const buttonID = buttonIDMap[paramData.name];

            if (buttonID) {
                let buttonContainer = document.getElementById(buttonID);

                let buttonElement = document.createElement("div");
                buttonContainer.appendChild(buttonElement);

                let container = document.createElement('div');
                container.classList.add('button-container');
                buttonElement.parentElement.appendChild(container);
                container.appendChild(buttonElement);

                let button = new Nexus.Button(buttonElement, {
                    'size': [41, 41],
                    'mode': 'button',
                    'state': false
                });

                button.text = param.name;

                // Colorize the accent and fill of the button
                button.colorize("accent", "#333333"); // Dark green accent color
                button.colorize("fill", "#999999"); // Green fill color

                button.on('change', function (state) {
                    if (state) {
                        param.value = param.max;
                    } else {
                        param.value = param.min;
                    }
                });
            }
        }
    });
}


/**
 * Creates modal button controls and sets up event listeners for modal interactions.
 */
export function createModalButtons() {
    let modalButtonContainer = document.getElementById("openModalBtn");

    let modalButtonElement = document.createElement("div");
    modalButtonContainer.appendChild(modalButtonElement);

    let container = document.createElement('div');
    container.classList.add('modalButton-container');
    modalButtonElement.parentElement.appendChild(container);
    container.appendChild(modalButtonElement);

    let button = new Nexus.Button(modalButtonElement, {
        'size': [41, 41], // Increase the button width to accommodate the text
        'mode': 'button',
        'state': false
    });

    // Colorize the accent and fill of the button
    button.colorize("accent", "#333333"); // Dark green accent color
    button.colorize("fill", "#999999"); // Green fill color

    // Attach event listener for opening the modal
    button.on('change', function (state) {
        if (state) {
            openModal();
        }
    });
}
  

/**
 * Creates switch controls for the device parameters and sets up event listeners for parameter changes.
 * @param {Map} parametersMap - A map containing parameter configuration.
 * @param {Object} device - The RNBO device instance.
 */
export function createSwitches(parametersMap, device) {
      device.parameters.forEach(param => {
          const paramData = parametersMap.get(param.id);
  
          if (paramData && paramData.control === "switch") {
              // Find the corresponding switch ID using the switchIDMap
              const switchID = switchIDMap[param.name];
  
              if (switchID) {
                  // Get the switch container element from the HTML file
                  let switchContainer = document.getElementById(switchID);
  
                  let switchElement = document.createElement("div");
                  switchContainer.appendChild(switchElement);
  
                  let container = document.createElement('div');
                  container.classList.add('switch-container');
                  switchElement.parentElement.appendChild(container);
                  container.appendChild(switchElement);
  
                  let switchButton = new Nexus.Button(switchElement, {
                      'size': [41, 41],
                      'mode': 'toggle',
                      'state': param.value === param.max
                  });
  
                  switchButton.text = param.name;
  
                  // Colorize the accent and fill of the button
                  switchButton.colorize("accent", "#999999"); // Dark green accent color
                  switchButton.colorize("fill", "#333333"); // Green fill color
  
                  switchButton.on('change', function (state) {
                      param.value = state ? param.max : param.min;
                  });
              }
          }
      });
}