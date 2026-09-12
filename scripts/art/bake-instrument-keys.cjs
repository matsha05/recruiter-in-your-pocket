#!/usr/bin/env node
// Precompute the exact photographed cap materials used by the runtime fallback.
// This is an offline asset build; no website or external service is contacted.
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '../..');
const runtime = path.join(root, 'web/components/landing/instrument/runtime');
const { chromium } = require(path.join(root, 'web/node_modules/@playwright/test'));
const ts = require(path.join(root, 'web/node_modules/typescript'));
const sharp = require(path.join(root, 'web/node_modules/sharp'));

async function main() {
    const browser = await chromium.launch({ headless: true });
    try {
        const page = await browser.newPage({ viewport: { width: 1000, height: 800 } });
        await page.route('http://instrument-bake.test/**', async route => {
            const name = new URL(route.request().url()).pathname;
            if (name === '/') return route.fulfill({ contentType: 'text/html', body:
                '<!doctype html><html><body><div id="mount" style="position:relative;width:839px;height:760px"></div></body></html>' });
            if (name.startsWith('/assets/instrument/')) return route.fulfill({
                contentType: name.endsWith('.webp') ? 'image/webp' : 'image/png',
                body: fs.readFileSync(path.join(root, 'web/public', name)),
            });
            if (name === '/runtime/key-materials.js') return route.fulfill({
                contentType: 'text/javascript',
                body: 'export function loadKeyMaterials() { return Promise.resolve(null); } export function waitForKeyMaterials(materials) { return materials; }',
            });
            if (!name.endsWith('.js')) return route.abort();
            const file = path.basename(name, '.js') + '.ts';
            let source = fs.readFileSync(path.join(runtime, file), 'utf8');
            if (file === 'instrument-keys.ts') {
                const captureMaterial = 'return { texture, path: photographedContour(result, region) };';
                const captureContour = 'path.moveTo(...expanded[0]);';
                if (!source.includes(captureMaterial) || !source.includes(captureContour))
                    throw new Error('Key tracing changed; review the asset-bake capture points.');
                source = source.replace(captureMaterial,
                    'const path = photographedContour(result, region); window.bakedKeys[region.id].texture = texture.toDataURL(); window.bakedKeys[region.id].region = region; return { texture, path };')
                    .replace(captureContour,
                        'window.bakedKeys ??= {}; window.bakedKeys[region.id] = { contour: expanded }; path.moveTo(...expanded[0]);');
            }
            const body = ts.transpileModule(source, { compilerOptions: {
                target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ES2022,
            } }).outputText.replace(/from '(\.\/[^']+)'/g, "from '$1.js'");
            return route.fulfill({ contentType: 'text/javascript', body });
        });
        await page.goto('http://instrument-bake.test/');
        const content = JSON.parse(fs.readFileSync(path.join(root, 'web/components/landing/instrument/content.json'), 'utf8'));
        const baked = await page.evaluate(async content => {
            const { createInstrument } = await import('/runtime/reference-instrument.js');
            const instance = await createInstrument({ container: document.querySelector('#mount'), content, fontFamily: 'Arial, sans-serif' });
            const materials = window.bakedKeys;
            instance.dispose();
            return materials;
        }, content);
        const regions = {}, images = [];
        let top = 0, width = 0;
        for (const [id, material] of Object.entries(baked)) {
            const input = Buffer.from(material.texture.split(',')[1], 'base64');
            const { width: w, height: h } = await sharp(input).metadata();
            regions[id] = { x: 0, y: top, width: w, height: h, region: material.region, contour: material.contour };
            images.push({ input, top, left: 0 });
            top += h;
            width = Math.max(width, w);
        }
        const output = path.join(root, 'web/public/assets/instrument/key-materials.v1.webp');
        const atlas = await sharp({ create: { width, height: top, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } } })
            .composite(images).webp({ lossless: true, effort: 6 }).toBuffer();
        const metadata = JSON.stringify(regions, null, 2) + '\n';
        if (process.argv.includes('--check')) {
            const [generated, existing] = await Promise.all([sharp(atlas).raw().toBuffer(), sharp(output).raw().toBuffer()]);
            if (!generated.equals(existing) || metadata !== fs.readFileSync(path.join(runtime, 'key-materials.json'), 'utf8'))
                throw new Error('Baked key assets differ from the current photographic calibration.');
            console.log('Verified exact cap pixels and contours; no assets changed.');
        } else {
            fs.writeFileSync(output, atlas);
            fs.writeFileSync(path.join(runtime, 'key-materials.json'), metadata);
            console.log(`Baked ${Object.keys(regions).length} exact caps into ${width} × ${top}; ${atlas.length} bytes.`);
        }
    } finally {
        await browser.close();
    }
}
main().catch(error => { console.error(error); process.exitCode = 1; });
