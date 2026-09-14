/**
 * Projection between GTA world coordinates and pixels of media/map/map.jpg.
 *
 * The image and these numbers come from gk_pausemenu, where they were fitted
 * against real in-game landmarks and verified with live blips. Two things about
 * them look wrong and are not:
 *
 *  - PIXEL_W/PIXEL_H are NOT the file's dimensions (that is 6144x9216). They
 *    are the extent the world bounds project onto, which is slightly smaller
 *    because the drawn map does not quite reach the canvas edges. Re-deriving
 *    them from the file size puts every pin off its mark.
 *  - The world bounds are not symmetric, because Los Santos is not centred in
 *    the render.
 *
 * Accuracy is about 1% of the map's span — right for "route me over there",
 * not for pinpointing a doorway.
 */
export const GTA_MAP = {
  image: 'media/map/map.jpg',
  pixelWidth: 6065,
  pixelHeight: 9176,
  worldMinX: -4083.8,
  worldMaxX: 4674.4,
  worldMinY: -5019.5,
  worldMaxY: 8344.6,
};

export interface Point {
  x: number;
  y: number;
}

/** World position -> pixel in the map image. Y is flipped: north is up. */
export const worldToImage = (worldX: number, worldY: number): Point => ({
  x: ((worldX - GTA_MAP.worldMinX) / (GTA_MAP.worldMaxX - GTA_MAP.worldMinX)) * GTA_MAP.pixelWidth,
  y:
    (1 - (worldY - GTA_MAP.worldMinY) / (GTA_MAP.worldMaxY - GTA_MAP.worldMinY)) *
    GTA_MAP.pixelHeight,
});

/** The inverse, so a tap on empty map resolves to somewhere in the world. */
export const imageToWorld = (pixelX: number, pixelY: number): Point => ({
  x:
    GTA_MAP.worldMinX +
    (pixelX / GTA_MAP.pixelWidth) * (GTA_MAP.worldMaxX - GTA_MAP.worldMinX),
  y:
    GTA_MAP.worldMinY +
    (1 - pixelY / GTA_MAP.pixelHeight) * (GTA_MAP.worldMaxY - GTA_MAP.worldMinY),
});

/** Fraction of the image's width/height, which is what the CSS layer uses. */
export const worldToFraction = (worldX: number, worldY: number): Point => {
  const pixel = worldToImage(worldX, worldY);
  return { x: pixel.x / GTA_MAP.pixelWidth, y: pixel.y / GTA_MAP.pixelHeight };
};
