import {
  boxStates,
  dialElements,
  lastClockPositions,
  sliderElements,
} from './config.js';

// Centralized configuration
const DRUM_SEQUENCES = {
  kick: { channel: 'ab', prefix: 'a', color: '#80d4ff' },
  clap: { channel: 'ab', prefix: 'b', color: 'red' },
  snare: { channel: 'cd', prefix: 'c', color: '#ff99cc' },
  tom: { channel: 'cd', prefix: 'd', color: 'green' },
  rim: { channel: 'ef', prefix: 'e', color: 'blue' },
  clave: { channel: 'ef', prefix: 'f', color: 'yellow' },
  hat: { channel: 'gh', prefix: 'g', color: '#9933ff' },
  shaker: { channel: 'gh', prefix: 'h', color: '#ff6600' },
};

const CONTROL_MAPPINGS = {
  densAB: 'densityAB',
  densCD: 'densityCD',
  densEF: 'densityEF',
  densGH: 'densityGH',
  hideAB: 'hideAB',
  hideCD: 'hideCD',
  hideEF: 'hideEF',
  hideGH: 'hideGH',
  kickFreqOut: '808Kick/kickFreq',
  kickDecayOut: '808Kick/kickDecay',
  clapFilterOut: '808Clap/clapFilter',
  clapDecayOut: '808Clap/clapDecay',
  snareTuneOut: '808Snare/snareTune',
  snareDecayOut: '808Snare/snareDecay',
  midTomFreqOut: '808MidTom/midTomFreq',
  midTomDecayOut: '808MidTom/midTomDecay',
  claveDecayOut: '808Clave/claveDecay',
  claveFreqOut: '808Clave/claveFreq',
  rimFilterOut: '808Rim/rimFilter',
  rimDecayOut: '808Rim/rimDecay',
  shakerDecayOut: '808Shaker/shakerDecay',
  shakerFilterOut: '808Shaker/shakerFilter',
  cHatToneOut: '808cHat/cHatTone',
  cHatDecayOut: '808cHat/cHatDecay',
};

// Generate sequence tags for each drum type
function generateSequenceTags() {
  const tags = {};
  Object.entries(DRUM_SEQUENCES).forEach(([drum, config]) => {
    tags[drum] = Array.from(
      { length: 16 },
      (_, i) => `${config.prefix}${String.fromCharCode(97 + i)}`
    );
  });
  return tags;
}

const SEQUENCE_TAGS = generateSequenceTags();

/**
 * Updates UI controls (dials and sliders)
 * @param {string} tag - Control tag
 * @param {number} value - New value
 */
function updateControl(tag, value) {
  const elementId = CONTROL_MAPPINGS[tag];
  if (!elementId) return;

  const dial = dialElements[elementId];
  const slider = sliderElements[elementId];

  if (dial) {
    dial.dial.value = value;
    if (dial.valueLabel) {
      dial.valueLabel.textContent = Math.round(value);
    }
  } else if (slider) {
    slider.slider.value = value;
    slider.text.value = value.toFixed(1);
  }
}

/**
 * Updates the visual state of sequence boxes
 */
function updateSequenceBox(index, value, type, channel) {
  const boxId = `box${channel}${index + 1}`;
  const box = document.getElementById(boxId);
  if (!box) {
    console.error(`Box element not found: ${boxId}`);
    return;
  }

  boxStates[channel][index][type] = parseInt(value, 10);

  // Determine box color based on active states
  const channelDrums = Object.entries(DRUM_SEQUENCES).filter(
    ([_, config]) => config.channel === channel
  );

  const activeState = channelDrums.find(
    ([drum, _]) => boxStates[channel][index][drum] === 1
  );

  box.style.backgroundColor = activeState
    ? DRUM_SEQUENCES[activeState[0]].color
    : 'white';
}

/**
 * Updates clock position visualization
 */
function updateClockPosition(clockPosition, channel = 'ab') {
  if (lastClockPositions[channel] === clockPosition) return;
  lastClockPositions[channel] = clockPosition;

  for (let i = 1; i <= 16; i++) {
    const box = document.getElementById(`box${channel}${i}`);
    const hasHit = Object.keys(boxStates[channel][i - 1]).some(
      type => boxStates[channel][i - 1][type] === 1
    );

    box.style.borderColor = i === clockPosition ? 'grey' : '#333333';
    box.classList.toggle('box-highlighted', i === clockPosition && hasHit);
  }
}

/**
 * Updates box visibility based on hide values
 */
function updateHideValue(hideValue, channel) {
  if (hideValue === null) return;

  for (let i = 1; i <= 16; i++) {
    const box = document.getElementById(`box${channel}${i}`);
    const visible = i <= hideValue;
    box.style.opacity = visible ? '1' : '0';
    box.style.pointerEvents = visible ? 'auto' : 'none';
  }
}

/**
 * Attaches outport handlers to the device
 */
export function attachOutports(device) {
  if (!device.outports.length) {
    const console = document.getElementById('rnbo-console');
    console.removeChild(document.getElementById('rnbo-console-div'));
    return;
  }

  document
    .getElementById('rnbo-console')
    .removeChild(document.getElementById('no-outports-label'));

  device.messageEvent.subscribe(({ tag, payload }) => {
    // Ignore messages not associated with outports
    if (!device.outports.some(port => port.tag === tag)) return;

    // Handle clock updates
    if (tag.startsWith('clock')) {
      updateClockPosition(Math.round(payload), tag.slice(5).toLowerCase());
    }
    // Handle hide values
    else if (tag.startsWith('hide')) {
      const channel = tag.slice(4).toLowerCase();
      updateHideValue(payload, channel);
    }
    // Handle control updates
    else if (CONTROL_MAPPINGS[tag]) {
      updateControl(tag, payload);
    }
    // Handle sequence updates
    else {
      Object.entries(SEQUENCE_TAGS).forEach(([drum, tags]) => {
        const index = tags.indexOf(tag);
        if (index >= 0) {
          updateSequenceBox(index, payload, drum, DRUM_SEQUENCES[drum].channel);
        }
      });
    }

    // Update console readout
    document.getElementById(
      'rnbo-console-readout'
    ).innerText = `${tag}: ${payload}`;
  });
}

export { updateClockPosition, updateHideValue, updateSequenceBox };
