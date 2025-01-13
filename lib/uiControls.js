'use client';

import {
  buttonIDMap,
  dialElements,
  dialIDMap,
  sliderElements,
  switchIDMap,
} from './config.js';
import { getNexus } from './NexusWrapper';

/**
 * Base class for UI control creation
 */
class BaseControl {
  static createElement(type, className) {
    const element = document.createElement(type);
    if (className) element.classList.add(className);
    return element;
  }

  static createContainer(element, containerClass) {
    const container = BaseControl.createElement('div', containerClass);
    element.parentElement.appendChild(container);
    container.appendChild(element);
    return container;
  }
}

/**
 * Manages slider controls
 */
class SliderControl extends BaseControl {
  static create(param, container) {
    const sliderContainer = this.createElement('div');
    const label = this.createLabel(param);
    const slider = this.createSlider(param);
    const text = this.createTextInput(param);

    sliderContainer.append(label, slider, text);
    container.appendChild(sliderContainer);

    return { slider, text };
  }

  static createLabel(param) {
    const label = this.createElement('label', 'param-label');
    label.setAttribute('name', param.name);
    label.setAttribute('for', param.name);
    label.textContent = `${param.name}: `;
    return label;
  }

  static createSlider(param) {
    const slider = this.createElement('input', 'param-slider');
    slider.type = 'range';
    slider.id = param.id;
    slider.name = param.name;
    slider.min = param.min;
    slider.max = param.max;
    slider.step =
      param.steps > 1
        ? (param.max - param.min) / (param.steps - 1)
        : (param.max - param.min) / 1000.0;
    slider.value = param.value;
    return slider;
  }

  static createTextInput(param) {
    const text = this.createElement('input');
    text.type = 'text';
    text.value = param.value.toFixed(1);
    return text;
  }

  static setupEventListeners(slider, text, param) {
    let isDragging = false;

    slider.addEventListener('pointerdown', () => (isDragging = true));
    slider.addEventListener('pointerup', () => {
      isDragging = false;
      slider.value = param.value;
      text.value = param.value.toFixed(1);
    });
    slider.addEventListener('input', () => {
      param.value = Number.parseFloat(slider.value);
    });

    text.addEventListener('keydown', ev => {
      if (ev.key === 'Enter') {
        const newValue = Number.parseFloat(text.value);
        if (!isNaN(newValue)) {
          const clampedValue = Math.min(
            Math.max(newValue, param.min),
            param.max
          );
          text.value = clampedValue;
          param.value = clampedValue;
        } else {
          text.value = param.value;
        }
      }
    });

    return isDragging;
  }
}

/**
 * Manages dial controls
 */
class DialControl extends BaseControl {
  static ALLOWED_PARAMETERS = new Set([
    'densityAB',
    'hideAB',
    'densityCD',
    'hideCD',
    'densityEF',
    'hideEF',
    'densityGH',
    'hideGH',
  ]);

  static create(param, paramData, container) {
    const dialDiv = this.createElement('div');
    container.appendChild(dialDiv);

    const dialContainer = this.createContainer(dialDiv, 'dial-container');
    const dial = this.createNexusDial(dialDiv, param, paramData);
    const valueLabel = this.createValueLabel(paramData, dial, dialContainer);

    return { dial, valueLabel };
  }

  static createNexusDial(element, param, paramData) {
    const Nexus = getNexus();
    const dial = new Nexus.Dial(element, {
      size: [50, 50],
      interaction: 'vertical',
      mode: 'relative',
      min: param.min,
      max: param.max,
      step:
        param.steps > 1
          ? (param.max - param.min) / (param.steps - 1)
          : (param.max - param.min) / 10000.0,
      value: param.value,
    });

    if (paramData.accentColor) dial.colorize('accent', paramData.accentColor);
    if (paramData.fillColor) dial.colorize('fill', paramData.fillColor);

    return dial;
  }

  static createValueLabel(paramData, dial, container) {
    if (!this.ALLOWED_PARAMETERS.has(paramData.name)) return null;

    const valueLabel = this.createElement('div', 'dial-value');
    valueLabel.textContent = Math.round(dial.value);
    container.appendChild(valueLabel);
    return valueLabel;
  }

  static setupEventListener(dial, valueLabel, param) {
    dial.on('change', value => {
      param.value = Math.round(value);
      if (valueLabel) valueLabel.textContent = Math.round(value);
    });
  }
}

/**
 * Manages button and switch controls
 */
class ButtonControl extends BaseControl {
  static create(param, paramData, idMap, options = {}) {
    const id = idMap[paramData.name];
    if (!id) return null;

    const container = document.getElementById(id);
    const element = this.createElement('div');
    container.appendChild(element);

    const buttonContainer = this.createContainer(
      element,
      `${options.type || 'button'}-container`
    );
    const button = this.createNexusButton(element, param, options);

    return button;
  }

  static createNexusButton(element, param, options) {
    const Nexus = getNexus();
    const button = new Nexus.Button(element, {
      size: [41, 41],
      mode: options.mode || 'button',
      state: options.mode === 'toggle' ? param.value === param.max : false,
    });

    button.text = param.name;
    button.colorize('accent', options.accentColor || '#333333');
    button.colorize('fill', options.fillColor || '#999999');

    return button;
  }
}

/**
 * Creates slider controls for the device parameters
 */
export function createSliders(parametersMap, device) {
  const container = document.getElementById('rnbo-parameter-sliders');
  const noParamLabel = document.getElementById('no-param-label');

  if (noParamLabel && device.numParameters > 0) {
    container.removeChild(noParamLabel);
  }

  let isDraggingSlider = false;

  device.parameters.forEach(param => {
    const paramData = parametersMap.get(param.id);
    if (!paramData || paramData.control !== 'slider') return;

    const { slider, text } = SliderControl.create(param, container);
    isDraggingSlider = SliderControl.setupEventListeners(slider, text, param);
    sliderElements[param.id] = { slider, text };
  });

  device.parameterChangeEvent.subscribe(param => {
    const element = sliderElements[param.id];
    if (!element) return;

    if (!isDraggingSlider) element.slider.value = param.value;
    element.text.value = param.value.toFixed(1);
  });
}

/**
 * Creates dial controls for the device parameters
 */
export function createDials(parametersMap, device) {
  device.parameters.forEach(param => {
    const paramData = parametersMap.get(param.id);
    if (!paramData || paramData.control !== 'dial') return;

    const dialID = dialIDMap[paramData.name];
    if (!dialID) return;

    const container = document.getElementById(dialID);
    if (!container) return;

    const { dial, valueLabel } = DialControl.create(
      param,
      paramData,
      container
    );
    DialControl.setupEventListener(dial, valueLabel, param);
    dialElements[param.id] = { dial, valueLabel };
  });

  device.parameterChangeEvent.subscribe(param => {
    const element = dialElements[param.id];
    if (!element) return;

    element.dial.value = param.value;
    if (element.valueLabel) {
      element.valueLabel.textContent = Math.round(param.value);
    }
  });
}

/**
 * Creates button controls for the device parameters
 */
export function createButtons(parametersMap, device) {
  device.parameters.forEach(param => {
    const paramData = parametersMap.get(param.id);
    if (!paramData || paramData.control !== 'button') return;

    const button = ButtonControl.create(param, paramData, buttonIDMap);
    if (!button) return;

    button.on('change', state => {
      param.value = state ? param.max : param.min;
    });
  });
}

/**
 * Creates modal button control
 */
export function createModalButtons() {
  const button = ButtonControl.create(
    { name: 'modal' },
    { name: 'modal' },
    { modal: 'openModalBtn' }
  );

  if (button) {
    button.on('change', state => {
      if (state) {
        const modal = document.getElementById('myModal');
        if (modal) modal.style.display = 'block';
      }
    });
  }
}

/**
 * Creates switch controls for the device parameters
 */
export function createSwitches(parametersMap, device) {
  device.parameters.forEach(param => {
    const paramData = parametersMap.get(param.id);
    if (!paramData || paramData.control !== 'switch') return;

    const button = ButtonControl.create(param, paramData, switchIDMap, {
      mode: 'toggle',
      type: 'switch',
      accentColor: '#999999',
      fillColor: '#333333',
    });

    if (!button) return;

    button.on('change', state => {
      param.value = state ? param.max : param.min;
    });
  });
}
