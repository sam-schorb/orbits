'use client';

import HelpModal from '@/components/HelpModal';
import { initializeNexus } from '@/lib/NexusWrapper';
import { initializeSetup } from '@/lib/setup';
import Image from 'next/image';
import { useEffect, useState } from 'react';

export default function Home() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    async function init() {
      try {
        await initializeNexus();
        await initializeSetup();
      } catch (error) {
        console.error('Initialization failed:', error);
      }
    }

    init();
  }, []);

  return (
    <>
      <div
        id="loading-overlay"
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          background: '#e6e6e6',
          zIndex: 1000,
          textAlign: 'center',
          paddingTop: '20%',
          fontSize: '2em',
        }}
      />

      <svg id="background" width="100%" height="100%" />

      <div id="main-container">
        {/* Main RNBO container */}
        <div id="rnbo-root">
          <div>
            <h1 id="patcher-title">Unnamed patcher</h1>
          </div>

          <div id="rnbo-inports">
            <h2>Inports</h2>
            <em id="no-inports-label">No inports available</em>
            <form id="inport-form" className="inport">
              <div className="inport-input">
                <select id="inport-select" />
                <input id="inport-text" type="text" />
                <input
                  id="inport-submit"
                  className="smallButton"
                  type="submit"
                  value="Send"
                />
              </div>
            </form>
          </div>

          <div id="rnbo-console">
            <h2>Outports</h2>
            <em id="no-outports-label">No outports available</em>
            <div id="rnbo-console-div">
              <p id="rnbo-console-readout">Waiting for messages...</p>
              <em id="rnbo-console-description">
                Check the developer console for more messages from the RNBO
                device
              </em>
            </div>
          </div>

          <div id="rnbo-presets">
            <h2>Presets</h2>
            <em id="no-presets-label" />
            <select id="preset-select" />
          </div>

          <div id="rnbo-parameter-sliders">
            <h2>Parameters</h2>
            <em id="no-param-label" />
          </div>

          <div style={{ paddingBottom: '10px' }} />

          <div id="page-title">orbits v1.2</div>

          <a href="https://www.iimaginary.com/">
            <Image
              className="logo"
              src="/iimaginaryCloudLogo2bWhite.webp"
              alt="logo"
              width={100}
              height={100}
              style={{ filter: 'invert(100%)' }}
            />
          </a>

          <div className="left-side">
            <div className="row" id="globalcontrols">
              <div id="switchall1" className="button" />
              <div id="random" className="dial" />
              <div id="tempo" className="dial" />
              <div
                id="openModalBtn"
                className="switch"
                onClick={() => setIsModalOpen(true)}
              />
            </div>
          </div>

          {/* Help Modal */}
          <HelpModal open={isModalOpen} onOpenChange={setIsModalOpen} />

          <div style={{ paddingBottom: '25px' }} />

          {/* Labels Section */}
          <div className="label" style={{ left: '110px', top: '140px' }}>
            random
          </div>
          <div className="label" style={{ left: '173px', top: '140px' }}>
            density
          </div>
          <div className="label" style={{ left: '250px', top: '140px' }}>
            hide
          </div>
          <div className="label" style={{ left: '327px', top: '110px' }}>
            length
          </div>
          <div className="label" style={{ left: '400px', top: '110px' }}>
            tune
          </div>
          <div className="label" style={{ left: '455px', top: '-5px' }}>
            pause/play
          </div>
          <div className="label" style={{ left: '567px', top: '-5px' }}>
            random
          </div>
          <div className="label" style={{ left: '674px', top: '-5px' }}>
            tempo
          </div>
          <div className="label" style={{ left: '782px', top: '-5px' }}>
            help
          </div>
          <div
            className="label"
            id="boldlabel"
            style={{ left: '52px', top: '165px' }}
          >
            kick/
            <br />
            clap
          </div>
          <div
            className="label"
            id="boldlabel"
            style={{ left: '45px', top: '312px' }}
          >
            snare/
            <br />
            tom
          </div>
          <div
            className="label"
            id="boldlabel"
            style={{ left: '52px', top: '459px' }}
          >
            rim/
            <br />
            clave
          </div>
          <div
            className="label"
            id="boldlabel"
            style={{ left: '45px', top: '606px' }}
          >
            hat/
            <br />
            shaker
          </div>

          <div style={{ paddingBottom: '150px' }} />

          {/* Box Container Section - AB */}
          <div className="row" id="boxcontainerab">
            <div id="buttonab1" className="button" />
            <div id="dialab1" className="dial" />
            <div id="dialab2" className="dial" />
            <div id="dialab3" className="dial" />
            <div id="dialab4" className="dial" />
            <div id="dialab5" className="dial" />
            <div id="dialab6" className="dial" />
            {[...Array(16)].map((_, i) => (
              <div key={`boxab${i + 1}`} id={`boxab${i + 1}`} className="box" />
            ))}
          </div>

          <div style={{ paddingBottom: '60px' }} />

          {/* Box Container Section - CD */}
          <div className="row" id="boxcontainercd">
            <div id="buttoncd1" className="button" />
            <div id="dialcd1" className="dial" />
            <div id="dialcd2" className="dial" />
            <div id="dialcd3" className="dial" />
            <div id="dialcd4" className="dial" />
            <div id="dialcd5" className="dial" />
            <div id="dialcd6" className="dial" />
            {[...Array(16)].map((_, i) => (
              <div key={`boxcd${i + 1}`} id={`boxcd${i + 1}`} className="box" />
            ))}
          </div>

          <div style={{ paddingBottom: '60px' }} />

          {/* Box Container Section - EF */}
          <div className="row" id="boxcontaineref">
            <div id="buttonef1" className="button" />
            <div id="dialef1" className="dial" />
            <div id="dialef2" className="dial" />
            <div id="dialef3" className="dial" />
            <div id="dialef4" className="dial" />
            <div id="dialef5" className="dial" />
            <div id="dialef6" className="dial" />
            {[...Array(16)].map((_, i) => (
              <div key={`boxef${i + 1}`} id={`boxef${i + 1}`} className="box" />
            ))}
          </div>

          <div style={{ paddingBottom: '60px' }} />

          {/* Box Container Section - GH */}
          <div className="row" id="boxcontainergh">
            <div id="buttongh1" className="button" />
            <div id="dialgh1" className="dial" />
            <div id="dialgh2" className="dial" />
            <div id="dialgh3" className="dial" />
            <div id="dialgh4" className="dial" />
            <div id="dialgh5" className="dial" />
            <div id="dialgh6" className="dial" />
            {[...Array(16)].map((_, i) => (
              <div key={`boxgh${i + 1}`} id={`boxgh${i + 1}`} className="box" />
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
