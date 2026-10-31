import {Composition} from 'remotion';
import {Hello} from './Hello';
import {ForestBeetle, FOREST_FRAMES} from './ForestBeetle';
export const Root = () => (
  <>
    <Composition id="Hello" component={Hello} durationInFrames={90} fps={30} width={1280} height={720} />
    <Composition id="ForestBeetle" component={ForestBeetle} durationInFrames={FOREST_FRAMES} fps={30} width={1920} height={1080} />
  </>
);
