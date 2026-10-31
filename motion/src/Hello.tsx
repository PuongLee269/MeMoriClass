import {AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
export const Hello = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const s = spring({frame, fps, config: {damping: 12}});
  const opacity = interpolate(frame, [0, 20], [0, 1], {extrapolateRight: 'clamp'});
  return (
    <AbsoluteFill style={{background: '#14301f', justifyContent: 'center', alignItems: 'center'}}>
      <h1 style={{color: '#f4e9c8', fontSize: 120, fontFamily: 'sans-serif', opacity, transform: `scale(${s})`}}>Me.Mori</h1>
    </AbsoluteFill>
  );
};
