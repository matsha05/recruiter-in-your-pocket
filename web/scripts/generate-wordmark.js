/**
 * Generate SVG wordmark from Fraunces font
 * 
 * This script uses text-to-svg to extract proper glyph paths
 * from the actual Fraunces font file, preserving kerning.
 */
const TextToSVG = require('text-to-svg');
const fs = require('fs');
const path = require('path');

// Path to the Fraunces 500 weight font (medium weight, matches font-medium)
const fontPath = path.join(
    process.cwd(),
    'node_modules/@fontsource/fraunces/files/fraunces-latin-500-normal.woff'
);

console.log('Loading Fraunces font from:', fontPath);

TextToSVG.load(fontPath, function (err, textToSVG) {
    if (err) {
        console.error('Error loading font:', err);
        // Try with woff2
        const woff2Path = fontPath.replace('.woff', '.woff2');
        console.log('Trying woff2:', woff2Path);
        return;
    }

    const text = 'Recruiter in Your Pocket';

    // Get SVG path
    const pathData = textToSVG.getPath(text, {
        fontSize: 72, // Large for quality
        anchor: 'top'
    });

    // Get metrics for viewBox
    const metrics = textToSVG.getMetrics(text, { fontSize: 72 });
    const width = Math.ceil(metrics.width);
    const height = Math.ceil(metrics.height);

    const svg = `<svg viewBox="0 0 ${width} ${height}" fill="currentColor" xmlns="http://www.w3.org/2000/svg" aria-label="pocket" role="img">
${pathData}
</svg>`;

    console.log('\n--- Generated SVG ---\n');
    console.log(svg);
    console.log('\n--- Metrics ---');
    console.log('Width:', width);
    console.log('Height:', height);

    // Save to file
    fs.writeFileSync(
        path.join(process.cwd(), 'public/assets/wordmark-generated.svg'),
        svg
    );
    console.log('\nSaved to public/assets/wordmark-generated.svg');
});
