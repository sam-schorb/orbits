'use client';

// lib/nexusWrapper.js
let NexusInstance = null;

export function initializeNexus() {
  return new Promise((resolve, reject) => {
    if (typeof window !== 'undefined' && window.Nexus) {
      NexusInstance = window.Nexus;
      resolve(NexusInstance);
      return;
    }

    // Create script element
    const script = document.createElement('script');
    script.src = '/NexusUI.js';
    script.async = true;

    script.onload = () => {
      if (window.Nexus) {
        NexusInstance = window.Nexus;
        resolve(NexusInstance);
      } else {
        reject(new Error('Nexus failed to load properly'));
      }
    };

    script.onerror = () => {
      reject(new Error('Failed to load Nexus script'));
    };

    document.body.appendChild(script);
  });
}

export function getNexus() {
  if (!NexusInstance) {
    throw new Error('Nexus not initialized. Call initializeNexus first.');
  }
  return NexusInstance;
}
