import { Settings } from 'lucide-react';
import { iosGlyphTile } from '../iosIcon';

// The pack's settings.png is a purple/pink abstract graphic, not a gear.
// Real Settings on iOS is a dark gray gear tile, so use a glyph here instead.
export default iosGlyphTile(Settings, '#8e8e93', '#3a3a3c');
