// setup.js
'use client';

import { attachOutports } from './outportHandlers';
import {
  createButtons,
  createDials,
  createModalButtons,
  createSliders,
  createSwitches,
} from './uiControls';

// Constants
const CONFIG = {
  PATCH_EXPORT_URL: 'export/patch.export.json',
  PARAMETERS_URL: 'export/parameters.json',
  DEPENDENCIES_URL: 'export/dependencies.json',
  RNBO_CDN_BASE: 'https://c74-public.nyc3.digitaloceanspaces.com/rnbo/',
  DEV_VERSION_REGEX: /^\d+\.\d+\.\d+-dev$/,
};

/**
 * Random Seed Generator for RNBO device
 */
class RandomSeedGenerator {
  static generate() {
    return ((Date.now() % 1000000) % 1000) / 1000;
  }

  static setDeviceRandomSeed(device) {
    const param = device.parameters.find(p => p.name === 'randomSeed');
    if (param) {
      const value = this.generate();
      param.value = value;
      console.log(`randomSeed set to: ${value}`);
    } else {
      console.log('randomSeed parameter not found in the device');
    }
  }
}

/**
 * Audio Context Manager
 */
class AudioContextManager {
  static createContext() {
    const WAContext = window.AudioContext || window.webkitAudioContext;
    const context = new WAContext();
    const outputNode = context.createGain();
    outputNode.connect(context.destination);
    return { context, outputNode };
  }
}

/**
 * RNBO Device Manager
 */
class RNBODeviceManager {
  static async loadScript(version) {
    if (CONFIG.DEV_VERSION_REGEX.test(version)) {
      throw new Error(
        'Patcher exported with a Debug Version! Please specify the correct RNBO version.'
      );
    }

    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = `${CONFIG.RNBO_CDN_BASE}${encodeURIComponent(
        version
      )}/rnbo.min.js`;
      script.onload = resolve;
      script.onerror = () =>
        reject(new Error(`Failed to load rnbo.js v${version}`));
      document.body.append(script);
    });
  }

  static async createDevice(context, patcher) {
    return await RNBO.createDevice({ context, patcher });
  }
}

/**
 * UI Manager for handling inports and presets
 */
class UIManager {
  static setupInportForm(device) {
    const inports = device.messages.filter(
      message => message.type === RNBO.MessagePortType.Inport
    );

    const elements = {
      div: document.getElementById('rnbo-inports'),
      select: document.getElementById('inport-select'),
      text: document.getElementById('inport-text'),
      form: document.getElementById('inport-form'),
    };

    if (inports.length === 0) {
      elements.div.removeChild(elements.form);
      return;
    }

    elements.div.removeChild(document.getElementById('no-inports-label'));
    this.populateInportSelect(inports, elements, device);
  }

  static populateInportSelect(inports, elements, device) {
    let currentTag = null;

    inports.forEach(inport => {
      const option = document.createElement('option');
      option.innerText = inport.tag;
      elements.select.appendChild(option);
    });

    elements.select.onchange = () => (currentTag = elements.select.value);
    currentTag = elements.select.value;

    elements.form.onsubmit = ev => {
      ev.preventDefault();
      const values = elements.text.value.split(/\s+/).map(s => parseFloat(s));
      const messageEvent = new RNBO.MessageEvent(
        RNBO.TimeNow,
        currentTag,
        values
      );
      device.scheduleEvent(messageEvent);
    };
  }

  static setupPresets(device, patcher) {
    const presets = patcher.presets || [];
    const presetsContainer = document.getElementById('rnbo-presets');
    const presetSelect = document.getElementById('preset-select');

    if (presets.length < 1) {
      presetsContainer.removeChild(presetSelect);
      return;
    }

    presetsContainer.removeChild(document.getElementById('no-presets-label'));

    presets.forEach((preset, index) => {
      const option = document.createElement('option');
      option.innerText = preset.name;
      option.value = index;
      presetSelect.appendChild(option);
    });

    presetSelect.onchange = () =>
      device.setPreset(presets[presetSelect.value].preset);
  }
}

export async function initializeSetup() {
  document.getElementById('loading-overlay').style.display = 'block';

  try {
    // Wait for Nexus to be available
    await waitForNexus();

    // Initialize audio context
    const { context, outputNode } = AudioContextManager.createContext();

    // Load parameters
    const response = await fetch(CONFIG.PARAMETERS_URL);
    const parametersData = await response.json();
    const parametersMap = new Map(
      parametersData.map(param => [param.id, param])
    );

    // Load patcher
    const patcherResponse = await fetch(CONFIG.PATCH_EXPORT_URL);
    const patcher = await patcherResponse.json();

    // Load RNBO if needed
    if (!window.RNBO) {
      await RNBODeviceManager.loadScript(patcher.desc.meta.rnboversion);
    }

    // Load dependencies
    const dependencies = await loadDependencies();

    // Create and setup device
    const device = await RNBODeviceManager.createDevice(context, patcher);
    RandomSeedGenerator.setDeviceRandomSeed(device);

    if (dependencies.length) {
      await device.loadDataBufferDependencies(dependencies);
    }

    // Connect device
    device.node.connect(outputNode);

    // Setup UI
    setupUI(device, patcher, parametersMap);

    // Setup audio context resume
    document.body.onclick = () => context.resume();

    // Handle guardrails
    if (typeof guardrails === 'function') guardrails();
  } catch (error) {
    handleSetupError(error);
  } finally {
    document.getElementById('loading-overlay').style.display = 'none';
  }
}

async function loadDependencies() {
  try {
    const response = await fetch(CONFIG.DEPENDENCIES_URL);
    const dependencies = await response.json();
    return dependencies.map(d =>
      d.file ? { ...d, file: `export/${d.file}` } : d
    );
  } catch {
    return [];
  }
}

function setupUI(device, patcher, parametersMap) {
  // Update patcher title
  const title = patcher.desc.meta.filename || 'Unnamed Patcher';
  const version = patcher.desc.meta.rnboversion;
  document.getElementById('patcher-title').innerText = `${title} (v${version})`;

  // Create UI controls
  createSliders(parametersMap, device);
  createButtons(parametersMap, device);
  createSwitches(parametersMap, device);
  createDials(parametersMap, device);
  createModalButtons();

  // Setup forms and outports
  UIManager.setupInportForm(device);
  UIManager.setupPresets(device, patcher);
  attachOutports(device);
}

function handleSetupError(error) {
  if (typeof guardrails === 'function') {
    guardrails({ error });
  } else {
    console.error('Setup failed:', error);
    throw error;
  }
}

// Helper function to wait for Nexus to be available
function waitForNexus() {
  return new Promise((resolve, reject) => {
    const checkNexus = () => {
      if (window.Nexus) {
        resolve();
      } else {
        setTimeout(checkNexus, 100);
      }
    };
    checkNexus();
    // Timeout after 10 seconds
    setTimeout(() => reject(new Error('Nexus failed to load')), 10000);
  });
}

// Export your other functions and classes
export { handleSetupError, loadDependencies, setupUI };
