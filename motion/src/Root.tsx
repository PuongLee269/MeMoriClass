import {Composition} from 'remotion';
import {Hello} from './Hello';
import {ForestBeetle, FOREST_FRAMES} from './ForestBeetle';
import {ForestLoop, LOOP_FRAMES} from './ForestLoop';
export const Root = () => (
  <>
    <Composition id="Hello" component={Hello} durationInFrames={90} fps={30} width={1280} height={720} />
    <Composition id="ForestBeetle" component={ForestBeetle} durationInFrames={FOREST_FRAMES} fps={30} width={1920} height={1080} />
    <Composition id="ForestLoop" component={ForestLoop} durationInFrames={LOOP_FRAMES} fps={30} width={1920} height={1080} />
  </>
);
