import { boxStates, dialElements, lastClockPositions, sliderElements } from './config.js';


/**
 * Attaches outport handlers to the device for UI updates.
 * @param {Object} device - The device object with outports.
 */
export function attachOutports(device) {
    const outports = device.outports;
    if (outports.length < 1) {
        document.getElementById("rnbo-console").removeChild(document.getElementById("rnbo-console-div"));
        return;
    }


    // Add arrays with tags for the drum sequences
    const kicks   = ['aa', 'ab', 'ac', 'ad', 'ae', 'af', 'ag', 'ah', 'ai', 'aj', 'ak', 'al', 'am', 'an', 'ao', 'ap'];
    const claps   = ['ba', 'bb', 'bc', 'bd', 'be', 'bf', 'bg', 'bh', 'bi', 'bj', 'bk', 'bl', 'bm', 'bn', 'bo', 'bp'];
    const snares  = ['ca', 'cb', 'cc', 'cd', 'ce', 'cf', 'cg', 'ch', 'ci', 'cj', 'ck', 'cl', 'cm', 'cn', 'co', 'cp'];
    const toms    = ['da', 'db', 'dc', 'dd', 'de', 'df', 'dg', 'dh', 'di', 'dj', 'dk', 'dl', 'dm', 'dn', 'do', 'dp'];
    const rims    = ['ea', 'eb', 'ec', 'ed', 'ee', 'ef', 'eg', 'eh', 'ei', 'ej', 'ek', 'el', 'em', 'en', 'eo', 'ep'];
    const claves  = ['fa', 'fb', 'fc', 'fd', 'fe', 'ff', 'fg', 'fh', 'fi', 'fj', 'fk', 'fl', 'fm', 'fn', 'fo', 'fp'];
    const hats    = ['ga', 'gb', 'gc', 'gd', 'ge', 'gf', 'gg', 'gh', 'gi', 'gj', 'gk', 'gl', 'gm', 'gn', 'go', 'gp'];
    const shakers = ['ha', 'hb', 'hc', 'hd', 'he', 'hf', 'hg', 'hh', 'hi', 'hj', 'hk', 'hl', 'hm', 'hn', 'ho', 'hp'];


    document.getElementById("rnbo-console").removeChild(document.getElementById("no-outports-label"));

    // Create a mapping from outport tags to dial and slider element IDs
  // Mapping event tags to UI element IDs
  const tagToElementIdMap = {
    "densAB": "densityAB",
    "densCD": "densityCD",
    "densEF": "densityEF",
    "densGH": "densityGH",
    "hideAB": "hideAB",
    "hideCD": "hideCD",
    "hideEF": "hideEF",
    "hideGH": "hideGH",
    "kickFreqOut": "808Kick/kickFreq",
    "kickDecayOut": "808Kick/kickDecay",
    "clapFilterOut": "808Clap/clapFilter",
    "clapDecayOut": "808Clap/clapDecay",
    "snareTuneOut": "808Snare/snareTune",
    "snareDecayOut": "808Snare/snareDecay",
    "midTomFreqOut": "808MidTom/midTomFreq",
    "midTomDecayOut": "808MidTom/midTomDecay",
    "claveDecayOut": "808Clave/claveDecay",
    "claveFreqOut": "808Clave/claveFreq",
    "rimFilterOut": "808Rim/rimFilter",
    "rimDecayOut": "808Rim/rimDecay",
    "shakerDecayOut": "808Shaker/shakerDecay",
    "shakerFilterOut": "808Shaker/shakerFilter",
    "cHatToneOut": "808cHat/cHatTone",
    "cHatDecayOut": "808cHat/cHatDecay"
  };

  device.messageEvent.subscribe((ev) => {

    // Ignore message events that don't belong to an outport
    if (outports.findIndex(elt => elt.tag === ev.tag) < 0) return;


    // Check if the tag is 'clock'
    if (ev.tag === "clockAB") {
        // Call the updateClockPosition function with the clock position (payload)
        updateClockPosition(Math.round(ev.payload));
    }

    // Check if the tag is 'clockCD'
    if (ev.tag === "clockCD") {
        // Call the updateClockPosition function with the clock position (payload) and channel ID
        updateClockPosition(Math.round(ev.payload), 'cd');
    }

    // Check if the tag is 'clockEF'
    if (ev.tag === "clockEF") {
        // Call the updateClockPosition function with the clock position (payload) and channel ID
        updateClockPosition(Math.round(ev.payload), 'ef');
    }

    // Check if the tag is 'clockGH'
    if (ev.tag === "clockGH") {
        
        // Call the updateClockPosition function with the clock position (payload) and channel ID
        updateClockPosition(Math.round(ev.payload), 'gh');
    }

        // Special handling for 'hide' events
        if (ev.tag.startsWith('hide')) {
            // Extract the channel part from the tag, e.g., "AB" from "hideAB"
            const channel = ev.tag.replace('hide', '').toLowerCase();
            // Call updateHideValue for the appropriate channel with the payload
            if (channel === 'ab') {
                updateHideValue(ev.payload, null, null, null, 'ab');
            } else if (channel === 'cd') {
                updateHideValue(null, ev.payload, null, null, 'cd');
            } else if (channel === 'ef') {
                updateHideValue(null, null, ev.payload, null, 'ef');
            } else if (channel === 'gh') {
                updateHideValue(null, null, null, ev.payload, 'gh');
            }
        }

        // Check if the tag from the event corresponds to a known element
        if (tagToElementIdMap.hasOwnProperty(ev.tag)) {
            const elementId = tagToElementIdMap[ev.tag];
            const dialElement = dialElements[elementId];
            const sliderElement = sliderElements[elementId];

            if (dialElement) {
                // Update the dial element
                dialElement.dial.value = ev.payload;
                if (dialElement.valueLabel) {
                    dialElement.valueLabel.textContent = Math.round(ev.payload);
                }
            } else if (sliderElement) {
                // Update the slider element
                sliderElement.slider.value = ev.payload;
                sliderElement.text.value = ev.payload.toFixed(1);
            }
        }

    // Check if the tag matches any of the drum type tags
    const kickIndex   = kicks.indexOf(ev.tag);
    const clapIndex   = claps.indexOf(ev.tag);
    const snareIndex  = snares.indexOf(ev.tag);
    const tomIndex    = toms.indexOf(ev.tag);
    const rimIndex    = rims.indexOf(ev.tag);
    const claveIndex  = claves.indexOf(ev.tag);
    const hatIndex    = hats.indexOf(ev.tag);
    const shakerIndex = shakers.indexOf(ev.tag);
    
    if (kickIndex >= 0) {
        updateSequenceBox(kickIndex, ev.payload, 'kick', 'ab');
    } else if (clapIndex >= 0) {
        updateSequenceBox(clapIndex, ev.payload, 'clap', 'ab');
    } else if (snareIndex >= 0) {
        updateSequenceBox(snareIndex, ev.payload, 'snare', 'cd');
    } else if (tomIndex >= 0) {
        updateSequenceBox(tomIndex, ev.payload, 'tom', 'cd');
    } else if (rimIndex >= 0) {
        updateSequenceBox(rimIndex, ev.payload, 'rim', 'ef');
    } else if (claveIndex >= 0) {
        updateSequenceBox(claveIndex, ev.payload, 'clave', 'ef');
    } else if (hatIndex >= 0) {
        updateSequenceBox(hatIndex, ev.payload, 'hat', 'gh');
    } else if (shakerIndex >= 0) {
        updateSequenceBox(shakerIndex, ev.payload, 'shaker', 'gh');
    }
    
            document.getElementById("rnbo-console-readout").innerText = `${ev.tag}: ${ev.payload}`;
        });
    }



/**
 * Updates the visual representation of a clock position.
 * @param {number} clockPosition - The position of the clock to update.
 * @param {string} channel - The channel identifier.
 */
export function updateClockPosition(clockPosition, channel = 'ab') {
    // If the clock position and channel haven't changed, return early without updating the UI
    if (lastClockPositions[channel] === clockPosition) {
        return;
    }

    // Update the lastClockPositions object with the current clock position for the given channel
    lastClockPositions[channel] = clockPosition;

    // Loop through all the boxes
    for (let i = 1; i <= 16; i++) {
        // Fetch the correct box element for the given channel
        const box = document.getElementById(`box${channel}${i}`);

        // Access the correct boxStates for the current channel
        const currentState = boxStates[channel][i - 1];

        // Check if the box has a hit for any drum type
        const hasHit = currentState.kick === 1 || currentState.clap === 1 || currentState.tom === 1 || currentState.snare === 1 || currentState.rim === 1 || currentState.clave === 1 || currentState.shaker === 1 || currentState.hat === 1;

        if (i === clockPosition) {
            // Change the outline color of the box at the current clock position
            box.style.borderColor = 'grey';

            // Check if the box has a hit for any drum type
            if (hasHit) {
                // Add the box-highlighted class to the box at the current clock position
                box.classList.add('box-highlighted');
            }
        } else {
            // Reset the outline color of the other boxes
            box.style.borderColor = '#333333';
            // Remove the box-highlighted class from the other boxes
            box.classList.remove('box-highlighted');
        }
    }
}

 /**
 * Updates the state and appearance of a sequence box.
 * @param {number} index - The index of the box to update.
 * @param {number} value - The new value for the box.
 * @param {string} type - The type of drum associated with the box.
 * @param {string} channel - The channel identifier.
 */ 
export  function updateSequenceBox(index, value, type, channel = 'ab') {
    const box = document.getElementById(`box${channel}${index + 1}`);

    // Check if the box element exists before accessing its properties
    if (box) {
        const intValue = parseInt(value, 10); // Parse the value as an integer

        // Update the state of the box for the given type and channel
        boxStates[channel][index][type] = intValue;

        // Create a color mapping object to store the colors for each drum type in each channel
        const colorMapping = {
            ab: { kick: '#80d4ff', clap: 'red' },
            cd: { snare: 'green', tom: '#ff99cc' },
            ef: { rim: 'yellow', clave: 'blue' },
            gh: { hat: '#ff6600', shaker: '#9933ff' },
        };

        // Determine the new color of the box based on its state
        let newColor;
        const firstType = Object.keys(boxStates[channel][index])[0];
        const secondType = Object.keys(boxStates[channel][index])[1];

        if (boxStates[channel][index][firstType] === 1) {
            // Use the color mapping object to get the color for the current type and channel
            newColor = colorMapping[channel][firstType];
        } else if (boxStates[channel][index][secondType] === 1) {
            // Use the color mapping object to get the color for the current type and channel
            newColor = colorMapping[channel][secondType];
        } else {
            newColor = 'white';
        }

        // Set the new color of the box
        box.style.backgroundColor = newColor;
    } else {
        console.error(`Element with ID 'box${channel}${index + 1}' not found`);
    }
}


/**
 * Updates the visibility of boxes based on the 'hide' value.
 * @param {number} hideValueAB - The hide value for channel AB.
 * @param {number} hideValueCD - The hide value for channel CD.
 * @param {number} hideValueEF - The hide value for channel EF.
 * @param {number} hideValueGH - The hide value for channel GH.
 * @param {string} channelId - The channel identifier.
 */
export function updateHideValue(hideValueAB, hideValueCD, hideValueEF, hideValueGH, channelId) {
    // Loop through all the boxes
    for (let i = 1; i <= 16; i++) {
        // Use channelId to determine which set of boxes to update
        const box = document.getElementById(`box${channelId}${i}`);
        
        // Get the corresponding hideValue based on channelId
        const hideValue = channelId === 'ab' ? hideValueAB :
                          channelId === 'cd' ? hideValueCD :
                          channelId === 'ef' ? hideValueEF :
                                               hideValueGH;

        if (hideValue < i) {
            // Show the box if its index is less than the 'hide' value
            box.style.opacity = '0';
            box.style.pointerEvents = 'none';
        } else {
            // Hide the box if its index is equal to or greater than the 'hide' value
            box.style.opacity = '1';
            box.style.pointerEvents = 'auto';
        }
    }
}

