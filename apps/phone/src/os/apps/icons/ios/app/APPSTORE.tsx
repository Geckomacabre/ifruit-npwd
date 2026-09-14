import { LayoutGrid } from 'lucide-react';
import { iosGlyphTile } from '../iosIcon';

// The pack's appstore.png is actually an iTunes-style shopping bag, not the
// real App Store "A" mark, and it collides visually with Marketplace. Use a
// grid-of-apps glyph on the App Store blue until a proper icon is sourced.
export default iosGlyphTile(LayoutGrid, '#0a84ff', '#0060df');
