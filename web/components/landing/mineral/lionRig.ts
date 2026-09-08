export type LionPoint = [number, number];
export interface LionRig {
    resize(width: number, height: number): void;
    render(head: LionPoint, gaze: LionPoint): void;
    destroy(): void;
}

const W=1536,H=1024;
const contour: readonly LionPoint[]=[
  [1008,130],[1034,128],[1063,140],[1090,145],[1113,161],[1131,182],
  [1151,176],[1177,184],[1193,208],[1195,233],[1215,252],[1231,282],
  [1238,318],[1230,352],[1213,384],[1190,414],[1180,449],[1156,475],
  [1133,493],[1094,497],[1064,479],[1041,457],[1006,437],[977,413],
  [957,382],[942,350],[929,322],[940,298],[927,274],[931,248],
  [946,225],[939,210],[955,181],[978,166],[970,153],[994,149],
];
function signedDistance(x: number,y: number){
  let inside=false,distance=1e9;
  for(let i=0,j=contour.length-1;i<contour.length;j=i++){
    const a=contour[i],b=contour[j],dx=b[0]-a[0],dy=b[1]-a[1];
    const t=Math.max(0,Math.min(1,((x-a[0])*dx+(y-a[1])*dy)/(dx*dx+dy*dy)));
    distance=Math.min(distance,Math.hypot(x-a[0]-t*dx,y-a[1]-t*dy));
    if(((a[1]>y)!==(b[1]>y))&&x<(b[0]-a[0])*(y-a[1])/(b[1]-a[1])+a[0])inside=!inside;
  }
  return inside?distance:-distance;
}
const vertex=`
precision highp float;
attribute vec2 aSource;
attribute float aDistance;
uniform vec2 uHead;
uniform float uPass;
varying vec2 vSource;
varying float vDistance;
void main(){
  vec2 finalPoint=aSource;
  if(uPass>0.5){
    vec2 pivot=vec2(1105.0,474.0);
    vec2 p=aSource-pivot;
    vec2 face=(aSource-vec2(1090.0,322.0))/vec2(128.0,128.0);
    vec2 muzzle=(aSource-vec2(1093.0,374.0))/vec2(66.0,58.0);
    float depth=74.0+32.0*exp(-dot(face,face))+32.0*exp(-dot(muzzle,muzzle)*1.4);
    float yaw=uHead.x*0.082;
    float pitch=-uHead.y*0.052;
    float roll=uHead.x*0.018+uHead.y*0.002;
    float cy=cos(yaw),sy=sin(yaw),cx=cos(pitch),sx=sin(pitch);
    vec3 q=vec3(p.x*cy+depth*sy,p.y,-p.x*sy+depth*cy);
    q.yz=mat2(cx,sx,-sx,cx)*q.yz;
    float cr=cos(roll),sr=sin(roll);
    q.xy=mat2(cr,sr,-sr,cr)*q.xy;
    vec2 projected=q.xy*(1250.0/(1250.0-q.z));
    vec2 neutral=p*(1250.0/(1250.0-depth));
    float neck=1.0-smoothstep(444.0,510.0,aSource.y);
    finalPoint+= (projected-neutral)*neck;
  }
  gl_Position=vec4(finalPoint.x/1536.0*2.0-1.0,1.0-finalPoint.y/1024.0*2.0,0.0,1.0);
  vSource=aSource;vDistance=aDistance;
}`;
const fragment=`
precision highp float;
uniform sampler2D uOriginal;
uniform sampler2D uClean;
uniform vec2 uEyes;
uniform float uPass;
uniform float uMoving;
uniform float uDebug;
varying vec2 vSource;
varying float vDistance;
float iris(vec2 p,vec2 center,vec2 radius){
  vec2 q=(p-center)/radius;return 1.0-smoothstep(0.24,1.0,dot(q,q));
}
vec3 eyes(vec2 p){
  float mask=max(iris(p,vec2(1034.0,310.0),vec2(11.0,10.0)),iris(p,vec2(1123.0,289.0),vec2(11.0,11.0)));
  return texture2D(uOriginal,(p-vec2(uEyes.x*1.9,uEyes.y*1.05)*mask)/vec2(1536.0,1024.0)).rgb;
}
void main(){
  vec2 uv=vSource/vec2(1536.0,1024.0);
  vec3 original=texture2D(uOriginal,uv).rgb;
  vec3 clean=texture2D(uClean,uv).rgb;
  // The generated plate is visible only within the original mane region.
  float clearing=smoothstep(-16.0,-7.0,vDistance);
  vec3 back=mix(original,clean,clearing);
  if(uPass<0.5){
    gl_FragColor=vec4(uMoving>0.5?back:eyes(vSource),1.0);
    return;
  }
  float difference=length(original-clean);
  float fringe=smoothstep(-16.0,3.0,vDistance)*smoothstep(0.025,0.19,difference);
  float matte=max(smoothstep(0.0,13.0,vDistance),fringe);
  // Unpremultiply against the prepared room. This preserves the original composite
  // at rest instead of drawing a soft amber halo over a second copy of the head.
  vec3 lighter=max(vec3(0.0),(original-back)/max(vec3(0.001),vec3(1.0)-back));
  vec3 darker=max(vec3(0.0),(back-original)/max(vec3(0.001),back));
  vec3 bound=max(lighter,darker);
  matte=max(matte,max(bound.x,max(bound.y,bound.z)));
  if(matte<0.001)discard;
  vec3 premult=eyes(vSource)-back*(1.0-matte);
  if(uDebug>0.5)premult=mix(premult,vec3(0.03,0.75,0.56)*matte,0.45);
  gl_FragColor=vec4(premult,matte);
}`;

export function createLionRig(canvas: HTMLCanvasElement, original: HTMLImageElement, clean: HTMLImageElement): LionRig {
    const context = canvas.getContext("webgl", { alpha: false, antialias: true, depth: false, stencil: false, powerPreference: "low-power" });
    if (!context) throw new Error("WebGL is unavailable");
    const gl: WebGLRenderingContext = context;
    const shaders: WebGLShader[] = [];
    const buffers: WebGLBuffer[] = [];
    const textures: WebGLTexture[] = [];
    let program: WebGLProgram | null = null;
    let destroyed = false;
    const destroy = () => {
        if (destroyed) return;
        destroyed = true;
        buffers.forEach(item => gl.deleteBuffer(item));
        textures.forEach(item => gl.deleteTexture(item));
        shaders.forEach(item => gl.deleteShader(item));
        if (program) gl.deleteProgram(program);
    };
    function compile(type: number, source: string): WebGLShader {
        const shader = gl.createShader(type);
        if (!shader) throw new Error("Could not allocate a lion shader");
        shaders.push(shader);
        gl.shaderSource(shader, source);
        gl.compileShader(shader);
        if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(shader) || "Could not compile the lion shader");
        return shader;
    }
    function makeBuffer(): WebGLBuffer {
        const buffer = gl.createBuffer();
        if (!buffer) throw new Error("Could not allocate lion geometry");
        buffers.push(buffer);
        return buffer;
    }
    try {
        program = gl.createProgram();
        if (!program) throw new Error("Could not allocate the lion program");
        gl.attachShader(program, compile(gl.VERTEX_SHADER, vertex));
        gl.attachShader(program, compile(gl.FRAGMENT_SHADER, fragment));
        gl.linkProgram(program);
        if (!gl.getProgramParameter(program, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(program) || "Could not link the lion program");
        gl.useProgram(program);

        const xs = [0, 700, 850];
        for (let x = 890; x <= 1290; x += 3) xs.push(x);
        xs.push(1360, W);
        const ys = [0, 70];
        for (let y = 95; y <= 527; y += 3) ys.push(y);
        ys.push(650, 800, H);
        const points: number[] = [], indices: number[] = [];
        for (const y of ys) for (const x of xs) points.push(x, y, signedDistance(x, y));
        for (let y = 0; y < ys.length - 1; y++) for (let x = 0; x < xs.length - 1; x++) {
            const a = y * xs.length + x, b = a + 1, c = a + xs.length, d = c + 1;
            indices.push(a, b, c, b, d, c);
        }
        gl.bindBuffer(gl.ARRAY_BUFFER, makeBuffer());
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(points), gl.STATIC_DRAW);
        const position = gl.getAttribLocation(program, "aSource");
        const distance = gl.getAttribLocation(program, "aDistance");
        if (position < 0 || distance < 0) throw new Error("The lion geometry attributes are unavailable");
        gl.enableVertexAttribArray(position);
        gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 12, 0);
        gl.enableVertexAttribArray(distance);
        gl.vertexAttribPointer(distance, 1, gl.FLOAT, false, 12, 8);
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, makeBuffer());
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), gl.STATIC_DRAW);
        [original, clean].forEach((image, index) => {
            const texture = gl.createTexture();
            if (!texture) throw new Error("Could not allocate the lion texture");
            textures.push(texture);
            gl.activeTexture(gl.TEXTURE0 + index);
            gl.bindTexture(gl.TEXTURE_2D, texture);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
            gl.pixelStorei(gl.UNPACK_COLORSPACE_CONVERSION_WEBGL, gl.NONE);
            gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image);
            gl.uniform1i(gl.getUniformLocation(program!, index === 0 ? "uOriginal" : "uClean"), index);
        });
        const uniform = (name: string) => {
            const location = gl.getUniformLocation(program!, "u" + name);
            if (location === null) throw new Error("The lion animation inputs are unavailable");
            return location;
        };
        const inputs = { head: uniform("Head"), eyes: uniform("Eyes"), pass: uniform("Pass"), moving: uniform("Moving"), debug: uniform("Debug") };
        let firstRender = true;
        return {
            resize(width, height) {
                if (destroyed) return;
                if (canvas.width !== width || canvas.height !== height) {
                    canvas.width = width;
                    canvas.height = height;
                }
                gl.viewport(0, 0, width, height);
            },
            render(head, gaze) {
                if (destroyed) return;
                const moving = Math.abs(head[0]) + Math.abs(head[1]) > 0.00001;
                gl.uniform2f(inputs.head, ...head);
                gl.uniform2f(inputs.eyes, ...gaze);
                gl.uniform1f(inputs.debug, 0);
                gl.uniform1f(inputs.moving, moving ? 1 : 0);
                gl.uniform1f(inputs.pass, 0);
                gl.disable(gl.BLEND);
                gl.drawElements(gl.TRIANGLES, indices.length, gl.UNSIGNED_SHORT, 0);
                if (moving) {
                    gl.enable(gl.BLEND);
                    gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
                    gl.uniform1f(inputs.pass, 1);
                    gl.drawElements(gl.TRIANGLES, indices.length, gl.UNSIGNED_SHORT, 0);
                }
                if (firstRender) {
                    firstRender = false;
                    if (gl.isContextLost() || gl.getError() !== gl.NO_ERROR) throw new Error("The lion scene could not render");
                }
            },
            destroy,
        };
    } catch (error) {
        destroy();
        throw error;
    }
}
