export let sliderElements = {};
export let dialElements = {};
  
export let lastClockPositions = {
    ab: null,
    cd: null,
    ef: null,
    gh: null,
  };

export const dialIDMap = {
    "tempo": "tempo",
    "densityAB": "dialab1",
    "hideAB": "dialab2",
    "kickDecay": "dialab3",
    "kickFreq": "dialab4",
    "clapDecay": "dialab5",
    "clapFilter": "dialab6",
    "densityCD": "dialcd1",
    "hideCD": "dialcd2",
    "snareDecay": "dialcd3",
    "snareTune": "dialcd4",
    "midTomDecay": "dialcd5",
    "midTomFreq": "dialcd6",
    "densityEF": "dialef1",
    "hideEF": "dialef2",
    "claveDecay": "dialef3",
    "claveFreq": "dialef4",
    "rimDecay": "dialef5",
    "rimFilter": "dialef6",
    "densityGH": "dialgh1",
    "hideGH": "dialgh2",
    "shakerDecay": "dialgh3",
    "shakerFilter": "dialgh4",
    "cHatDecay": "dialgh5",
    "cHatTone": "dialgh6"
    // ... add other parameter-to-dial mappings
  };

export const switchIDMap = {
    "pause": "switchall1",
    // ... add other parameter-to-switch mappings
  };

export const buttonIDMap = {
    "randomAB": "buttonab1",
    "randomCD": "buttoncd1",
    "randomEF": "buttonef1",
    "randomGH": "buttongh1",
    "random": "random"
};

// Create an array to store the state of each box
export const boxStates = {
    ab: Array.from({ length: 16 }, () => ({ kick: 0, clap: 0 })),
    cd: Array.from({ length: 16 }, () => ({ snare: 0, tom: 0 })),
    ef: Array.from({ length: 16 }, () => ({ rim: 0, clave: 0 })),
    gh: Array.from({ length: 16 }, () => ({ hat: 0, shaker: 0 })),
  };


