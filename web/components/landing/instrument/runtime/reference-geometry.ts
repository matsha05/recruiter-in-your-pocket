import type { InstrumentGeometry } from './types';
// Pixel calibration against the approved 1536 x 1024 design reference.
// This is a rendered photographic plate with live controls, not a 3D mesh.
export const geometry: InstrumentGeometry = {
    source: '/assets/instrument/clean-plate.v1.webp',
    sourceWidth: 1536,
    sourceHeight: 1024,
    crop: { x: 697, y: 105, width: 839, height: 760 },
    cleanPlate: true,
    paper: {
        width: 520, height: 365,
        corners: [[891, 180], [1416, 215], [1341, 584], [791, 521]],
    },
    keys: [
        { id: 'story', width: 104, height: 42, corners: [[764, 589], [877, 606], [869, 654], [756, 637]] },
        { id: 'impact', width: 99, height: 42, corners: [[887, 609], [989, 623], [982, 668], [880, 654]] },
        { id: 'fit', width: 99, height: 42, corners: [[1002, 622], [1110, 638], [1102, 684], [995, 668]] },
    ],
    dial: { x: 1212, y: 656, radiusX: 67, radiusY: 76, rotation: 16, sourceNeedleAngle: 15 },
};
