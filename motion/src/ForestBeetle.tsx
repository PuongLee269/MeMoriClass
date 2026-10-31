import React from 'react';
import {AbsoluteFill, Img, random, staticFile, useCurrentFrame} from 'remotion';

export const FOREST_FRAMES = 180; // 6s @30fps, loops seamlessly
const TAU = Math.PI * 2;

// sin that completes `cycles` full waves over the loop
const wave = (frame: number, cycles: number, phase = 0) =>
  Math.sin((frame / FOREST_FRAMES) * TAU * cycles + phase);

const ell = (cx: number, cy: number, rx: number, ry: number) =>
  `radial-gradient(ellipse ${rx}% ${ry}% at ${cx}% ${cy}%, #000 45%, transparent 100%)`;

type LayerProps = {
  mask?: string;
  origin?: string;
  transform?: string;
  filter?: string;
  children?: React.ReactNode;
};

const Layer: React.FC<LayerProps> = ({mask, origin = '50% 50%', transform, filter, children}) => (
  <AbsoluteFill
    style={{
      WebkitMaskImage: mask,
      maskImage: mask,
      transformOrigin: origin,
      transform,
      filter,
    }}
  >
    <Img src={staticFile('forest.webp')} style={{width: '100%', height: '100%', objectFit: 'cover'}} />
    {children}
  </AbsoluteFill>
);

// Existing fireflies in the picture (x%, y%), made to pulse
const GLOWS: [number, number][] = [
  [18.9, 31.6], [20.2, 57.5], [20.5, 65.6], [55.4, 64], [49.7, 70.3],
  [75, 41.8], [84.7, 62.6], [91.3, 29.5], [94.1, 80.4], [88.1, 86.6],
];

const Glow: React.FC<{x: number; y: number; r: number; o: number}> = ({x, y, r, o}) => (
  <div
    style={{
      position: 'absolute', left: `${x}%`, top: `${y}%`, width: r * 2, height: r * 2,
      marginLeft: -r, marginTop: -r, borderRadius: '50%', opacity: o,
      background: 'radial-gradient(circle, rgba(255,235,140,0.95) 0%, rgba(255,220,90,0.35) 35%, rgba(255,200,60,0) 70%)',
      mixBlendMode: 'screen',
    }}
  />
);

export const ForestBeetle: React.FC = () => {
  const frame = useCurrentFrame();
  const f = frame;

  // animated turbulence for leaf flutter / water ripple
  const flutterFreq = 0.012 + 0.002 * wave(f, 2);
  const flutterScale = 7 + 3 * wave(f, 3, 1);
  const waterFreqX = 0.008, waterFreqY = 0.05 + 0.006 * wave(f, 2);
  const waterScale = 10 + 4 * wave(f, 4);

  // beetle motion
  const breathe = 1 + 0.018 * (0.5 + 0.5 * wave(f, 4, -Math.PI / 2));
  const nod = 1.2 * wave(f, 2);
  const antL = 4 * wave(f, 3);

  return (
    <AbsoluteFill style={{background: '#000', overflow: 'hidden'}}>
      <svg width="0" height="0" style={{position: 'absolute'}}>
        <filter id="flutter" x="-10%" y="-10%" width="120%" height="120%">
          <feTurbulence type="fractalNoise" baseFrequency={`${flutterFreq} ${flutterFreq * 1.6}`} numOctaves={2} seed={3} />
          <feDisplacementMap in="SourceGraphic" scale={flutterScale} xChannelSelector="R" yChannelSelector="G" />
        </filter>
        <filter id="water" x="-5%" y="-5%" width="110%" height="110%">
          <feTurbulence type="fractalNoise" baseFrequency={`${waterFreqX} ${waterFreqY}`} numOctaves={2} seed={8} />
          <feDisplacementMap in="SourceGraphic" scale={waterScale} xChannelSelector="R" yChannelSelector="G" />
        </filter>
      </svg>

      {/* whole scene: very slow breathing camera */}
      <AbsoluteFill style={{transform: `scale(${1.035 + 0.015 * wave(f, 1, -Math.PI / 2)})`}}>
        <Layer />

        {/* water shimmer */}
        <Layer mask={ell(38, 82, 24, 9)} filter="url(#water)" transform={`translateX(${3 * wave(f, 2)}px)`} />

        {/* canopy (top) */}
        <Layer mask={ell(50, 6, 32, 20)} origin="50% 0%" transform={`rotate(${0.8 * wave(f, 2, 0.6)}deg)`} filter="url(#flutter)" />
        {/* left big leaves */}
        <Layer mask={ell(12, 80, 24, 34)} origin="3% 100%" transform={`rotate(${1.5 * wave(f, 2)}deg)`} filter="url(#flutter)" />
        <Layer mask={ell(11, 48, 14, 14)} origin="8% 62%" transform={`rotate(${1.8 * wave(f, 3, 1.2)}deg)`} />
        {/* right foliage */}
        <Layer mask={ell(92, 52, 9, 21)} origin="100% 100%" transform={`rotate(${1.3 * wave(f, 2, 2)}deg)`} filter="url(#flutter)" />
        {/* bottom foreground */}
        <Layer mask={ell(88, 93, 18, 14)} origin="100% 100%" transform={`rotate(${1.1 * wave(f, 2, 0.3)}deg)`} />
        <Layer mask={ell(52, 99, 22, 10)} origin="50% 100%" transform={`rotate(${0.9 * wave(f, 3, 2)}deg)`} />

        {/* beetle: body breathes + nods, antennae wiggle */}
        <Layer
          mask={ell(74.5, 60.5, 8, 13.5)}
          origin="74% 73%"
          transform={`scaleY(${breathe}) rotate(${nod}deg)`}
        >
          <Layer mask={ell(73, 52.5, 5, 5)} origin="71.5% 57.5%" transform={`rotate(${antL}deg)`} />
        </Layer>

        {/* fireflies */}
        <AbsoluteFill>
          {GLOWS.map(([x, y], i) => (
            <Glow
              key={i}
              x={x + 0.6 * wave(f, 1 + (i % 2), i)}
              y={y + 0.9 * wave(f, 2, i * 1.7)}
              r={26}
              o={0.25 + 0.55 * (0.5 + 0.5 * wave(f, 2 + (i % 3), i * 2.1))}
            />
          ))}
          {Array.from({length: 14}).map((_, i) => {
            const bx = 8 + random(`x${i}`) * 84;
            const by = 15 + random(`y${i}`) * 75;
            return (
              <Glow
                key={`d${i}`}
                x={bx + 3 * wave(f, 1, i * 1.3)}
                y={by + 4 * wave(f, 2, i * 2.2)}
                r={14 + random(`r${i}`) * 10}
                o={0.15 + 0.6 * Math.max(0, wave(f, 2 + (i % 3), i * 1.9))}
              />
            );
          })}
          {/* moon glow */}
          <Glow x={66.1} y={13.4} r={150} o={0.12 + 0.06 * wave(f, 1)} />
        </AbsoluteFill>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
