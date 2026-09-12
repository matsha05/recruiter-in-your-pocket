/* Lossless delivery assets. Original approved artwork stays untouched. */
const path = require('node:path');
const fs = require('node:fs/promises');
const root = path.resolve(__dirname, '../..');
const sharp = require(path.join(root, 'web/node_modules/sharp'));

async function main() {
    const instrument = path.join(root, 'web/public/assets/instrument');
    const alpine = path.join(root, 'web/public/assets/alpine');
    const plate = path.join(instrument, 'clean-plate.png');
    const delivered = path.join(instrument, 'clean-plate.v1.webp');
    await sharp(plate).webp({ lossless: true, effort: 6 }).toFile(delivered);
    const before = await sharp(plate).removeAlpha().raw().toBuffer();
    const after = await sharp(delivered).removeAlpha().raw().toBuffer();
    if (!before.equals(after)) throw new Error('Lossless plate changed source pixels');

    // The six visible logos occupy this exact 56px band of the reference.
    // Keep its full width so existing horizontal calibration is unchanged.
    const strip = sharp(path.join(alpine, 'alpine-selected-reference.png'))
        .extract({ left: 0, top: 750, width: 1536, height: 56 });
    const logos = path.join(alpine, 'trust-marks.v1.webp');
    await strip.clone().webp({ lossless: true, effort: 6 }).toFile(logos);
    if (!(await strip.clone().removeAlpha().raw().toBuffer()).equals(await sharp(logos).removeAlpha().raw().toBuffer()))
        throw new Error('Lossless logo crop changed reference pixels');
    for (const file of [delivered, logos]) console.log(path.basename(file), (await fs.stat(file)).size);
}
main().catch(error => { console.error(error); process.exitCode = 1; });
