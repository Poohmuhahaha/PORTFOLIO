/**
 * High-Performance Eulerian Navier-Stokes Fluid Dynamics Engine on GPU
 *
 * Solves incompressible fluid equations in real-time at 60-120fps:
 * 1. Advection (Velocity & Dye transport)
 * 2. Vorticity Confinement (Preserves turbulent swirls & eddies)
 * 3. Divergence Computation
 * 4. Poisson Pressure Projection (Jacobi relaxation iteration)
 * 5. Gradient Subtraction (Enforces incompressibility / zero divergence)
 * 6. Dye Injection (Mouse & touch interaction)
 */

export interface FluidConfig {
  simResolution: number;
  dyeResolution: number;
  densityDissipation: number;
  velocityDissipation: number;
  pressureIterations: number;
  curlStrength: number;
  splatRadius: number;
  splatForce: number;
}

export class FluidSimulation {
  private canvas: HTMLCanvasElement;
  private gl: WebGLRenderingContext;
  private ext: {
    formatRGBA: { internalFormat: number; format: number };
    formatRG: { internalFormat: number; format: number };
    formatR: { internalFormat: number; format: number };
    halfFloatTexType: number;
    supportLinearFiltering: boolean;
  };

  public config: FluidConfig = {
    simResolution: 128,
    dyeResolution: 512,
    densityDissipation: 0.975,
    velocityDissipation: 0.985,
    pressureIterations: 22,
    curlStrength: 32,
    splatRadius: 0.28,
    splatForce: 6000
  };

  // Active color palette for dye injection
  public activePalette: [number, number, number][] = [
    [0.22, 0.74, 0.97], // Luminous Azure
    [0.99, 0.42, 0.33], // Coral Terracotta
    [0.78, 0.69, 0.56], // Gilded Sand
    [0.39, 0.40, 0.95], // Royal Indigo
    [0.96, 0.25, 0.37]  // Crimson
  ];

  // Ping-Pong Double Buffers
  private density!: DoubleFBO;
  private velocity!: DoubleFBO;
  private divergence!: FBO;
  private curl!: FBO;
  private pressure!: DoubleFBO;

  // Shader Programs
  private splatProgram!: WebGLProgram;
  private advectionProgram!: WebGLProgram;
  private divergenceProgram!: WebGLProgram;
  private curlProgram!: WebGLProgram;
  private vorticityProgram!: WebGLProgram;
  private pressureProgram!: WebGLProgram;
  private gradientSubtractProgram!: WebGLProgram;
  private displayProgram!: WebGLProgram;

  private blitMesh: { bind: () => void };
  private lastTime = performance.now();
  private rafId: number | null = null;
  private pointer = { x: 0, y: 0, prevX: 0, prevY: 0, moved: false, down: false };

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;

    const gl = canvas.getContext('webgl', {
      alpha: true,
      depth: false,
      stencil: false,
      antialias: false,
      preserveDrawingBuffer: false
    }) as WebGLRenderingContext;

    if (!gl) {
      throw new Error('WebGL not supported for Fluid Simulation');
    }
    this.gl = gl;

    this.ext = this.initExtensions(gl);
    this.blitMesh = this.initBlitMesh(gl);
    this.initPrograms();
    this.initFramebuffers();
    this.setupEvents();
    this.startLoop();
  }

  private initExtensions(gl: WebGLRenderingContext) {
    const halfFloat = gl.getExtension('OES_texture_half_float');
    const halfFloatLinear = gl.getExtension('OES_texture_half_float_linear');
    const halfFloatTexType = halfFloat ? halfFloat.HALF_FLOAT_OES : gl.UNSIGNED_BYTE;

    return {
      formatRGBA: { internalFormat: gl.RGBA, format: gl.RGBA },
      formatRG: { internalFormat: gl.RGBA, format: gl.RGBA },
      formatR: { internalFormat: gl.RGBA, format: gl.RGBA },
      halfFloatTexType,
      supportLinearFiltering: !!halfFloatLinear
    };
  }

  private initBlitMesh(gl: WebGLRenderingContext) {
    gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, -1, 1, 1, 1, 1, -1]),
      gl.STATIC_DRAW
    );
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, gl.createBuffer());
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array([0, 1, 2, 0, 2, 3]), gl.STATIC_DRAW);
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(0);

    return {
      bind: () => {
        gl.drawElements(gl.TRIANGLES, 6, gl.UNSIGNED_SHORT, 0);
      }
    };
  }

  private createShader(type: number, source: string): WebGLShader {
    const shader = this.gl.createShader(type)!;
    this.gl.shaderSource(shader, source);
    this.gl.compileShader(shader);
    return shader;
  }

  private createProgram(vertexSource: string, fragmentSource: string): WebGLProgram {
    const program = this.gl.createProgram()!;
    this.gl.attachShader(program, this.createShader(this.gl.VERTEX_SHADER, vertexSource));
    this.gl.attachShader(program, this.createShader(this.gl.FRAGMENT_SHADER, fragmentSource));
    this.gl.linkProgram(program);
    return program;
  }

  private initPrograms() {
    const baseVertex = `
      precision highp float;
      attribute vec2 aPosition;
      varying vec2 vUv;
      varying vec2 vL;
      varying vec2 vR;
      varying vec2 vT;
      varying vec2 vB;
      uniform vec2 uTexelSize;
      void main () {
        vUv = aPosition * 0.5 + 0.5;
        vL = vUv - vec2(uTexelSize.x, 0.0);
        vR = vUv + vec2(uTexelSize.x, 0.0);
        vT = vUv + vec2(0.0, uTexelSize.y);
        vB = vUv - vec2(0.0, uTexelSize.y);
        gl_Position = vec4(aPosition, 0.0, 1.0);
      }
    `;

    const splatShader = `
      precision highp float;
      varying vec2 vUv;
      uniform sampler2D uTarget;
      uniform float uAspect;
      uniform vec3 uColor;
      uniform vec2 uPoint;
      uniform float uRadius;
      void main () {
        vec2 p = vUv - uPoint.xy;
        p.x *= uAspect;
        vec3 splat = exp(-dot(p, p) / uRadius) * uColor;
        vec3 base = texture2D(uTarget, vUv).xyz;
        gl_FragColor = vec4(base + splat, 1.0);
      }
    `;

    const advectionShader = `
      precision highp float;
      varying vec2 vUv;
      uniform sampler2D uVelocity;
      uniform sampler2D uSource;
      uniform vec2 uTexelSize;
      uniform float uDt;
      uniform float uDissipation;
      void main () {
        vec2 coord = vUv - uDt * texture2D(uVelocity, vUv).xy * uTexelSize;
        gl_FragColor = uDissipation * texture2D(uSource, coord);
      }
    `;

    const divergenceShader = `
      precision mediump float;
      varying vec2 vL;
      varying vec2 vR;
      varying vec2 vT;
      varying vec2 vB;
      uniform sampler2D uVelocity;
      void main () {
        float L = texture2D(uVelocity, vL).x;
        float R = texture2D(uVelocity, vR).x;
        float T = texture2D(uVelocity, vT).y;
        float B = texture2D(uVelocity, vB).y;
        float div = 0.5 * (R - L + T - B);
        gl_FragColor = vec4(div, 0.0, 0.0, 1.0);
      }
    `;

    const curlShader = `
      precision mediump float;
      varying vec2 vL;
      varying vec2 vR;
      varying vec2 vT;
      varying vec2 vB;
      uniform sampler2D uVelocity;
      void main () {
        float L = texture2D(uVelocity, vL).y;
        float R = texture2D(uVelocity, vR).y;
        float T = texture2D(uVelocity, vT).x;
        float B = texture2D(uVelocity, vB).x;
        float vorticity = R - L - T + B;
        gl_FragColor = vec4(0.5 * vorticity, 0.0, 0.0, 1.0);
      }
    `;

    const vorticityShader = `
      precision highp float;
      varying vec2 vUv;
      varying vec2 vL;
      varying vec2 vR;
      varying vec2 vT;
      varying vec2 vB;
      uniform sampler2D uVelocity;
      uniform sampler2D uCurl;
      uniform float uCurlStrength;
      uniform float uDt;
      void main () {
        float L = texture2D(uCurl, vL).x;
        float R = texture2D(uCurl, vR).x;
        float T = texture2D(uCurl, vT).x;
        float B = texture2D(uCurl, vB).x;
        float C = texture2D(uCurl, vUv).x;

        vec2 force = 0.5 * vec2(abs(T) - abs(B), abs(R) - abs(L));
        force /= length(force) + 0.0001;
        force *= uCurlStrength * C;
        force.y *= -1.0;

        vec2 vel = texture2D(uVelocity, vUv).xy;
        gl_FragColor = vec4(vel + force * uDt, 0.0, 1.0);
      }
    `;

    const pressureShader = `
      precision mediump float;
      varying vec2 vL;
      varying vec2 vR;
      varying vec2 vT;
      varying vec2 vB;
      varying vec2 vUv;
      uniform sampler2D uPressure;
      uniform sampler2D uDivergence;
      void main () {
        float L = texture2D(uPressure, vL).x;
        float R = texture2D(uPressure, vR).x;
        float T = texture2D(uPressure, vT).x;
        float B = texture2D(uPressure, vB).x;
        float C = texture2D(uPressure, vUv).x;
        float divergence = texture2D(uDivergence, vUv).x;
        float pressure = (L + R + B + T - divergence) * 0.25;
        gl_FragColor = vec4(pressure, 0.0, 0.0, 1.0);
      }
    `;

    const gradientSubtractShader = `
      precision mediump float;
      varying vec2 vL;
      varying vec2 vR;
      varying vec2 vT;
      varying vec2 vB;
      varying vec2 vUv;
      uniform sampler2D uPressure;
      uniform sampler2D uVelocity;
      void main () {
        float L = texture2D(uPressure, vL).x;
        float R = texture2D(uPressure, vR).x;
        float T = texture2D(uPressure, vT).x;
        float B = texture2D(uPressure, vB).x;
        vec2 velocity = texture2D(uVelocity, vUv).xy;
        velocity.xy -= vec2(R - L, T - B) * 0.5;
        gl_FragColor = vec4(velocity, 0.0, 1.0);
      }
    `;

    const displayShader = `
      precision mediump float;
      varying vec2 vUv;
      uniform sampler2D uTexture;
      void main () {
        vec3 c = texture2D(uTexture, vUv).rgb;
        float alpha = clamp(max(c.r, max(c.g, c.b)) * 1.5, 0.0, 0.85);
        gl_FragColor = vec4(c, alpha);
      }
    `;

    this.splatProgram = this.createProgram(baseVertex, splatShader);
    this.advectionProgram = this.createProgram(baseVertex, advectionShader);
    this.divergenceProgram = this.createProgram(baseVertex, divergenceShader);
    this.curlProgram = this.createProgram(baseVertex, curlShader);
    this.vorticityProgram = this.createProgram(baseVertex, vorticityShader);
    this.pressureProgram = this.createProgram(baseVertex, pressureShader);
    this.gradientSubtractProgram = this.createProgram(baseVertex, gradientSubtractShader);
    this.displayProgram = this.createProgram(baseVertex, displayShader);
  }

  private initFramebuffers() {
    const simRes = this.config.simResolution;
    const dyeRes = this.config.dyeResolution;

    this.density = this.createDoubleFBO(dyeRes, dyeRes);
    this.velocity = this.createDoubleFBO(simRes, simRes);
    this.divergence = this.createFBO(simRes, simRes);
    this.curl = this.createFBO(simRes, simRes);
    this.pressure = this.createDoubleFBO(simRes, simRes);
  }

  private createFBO(w: number, h: number): FBO {
    const gl = this.gl;
    const texture = gl.createTexture()!;
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texImage2D(
      gl.TEXTURE_2D,
      0,
      gl.RGBA,
      w,
      h,
      0,
      gl.RGBA,
      this.ext.halfFloatTexType,
      null
    );

    const fbo = gl.createFramebuffer()!;
    gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);
    gl.framebufferTexture2D(
      gl.FRAMEBUFFER,
      gl.COLOR_ATTACHMENT0,
      gl.TEXTURE_2D,
      texture,
      0
    );

    return {
      texture,
      fbo,
      width: w,
      height: h,
      attach: (id: number) => {
        gl.activeTexture(gl.TEXTURE0 + id);
        gl.bindTexture(gl.TEXTURE_2D, texture);
        return id;
      }
    };
  }

  private createDoubleFBO(w: number, h: number): DoubleFBO {
    let fbo1 = this.createFBO(w, h);
    let fbo2 = this.createFBO(w, h);
    return {
      width: w,
      height: h,
      get read() {
        return fbo1;
      },
      set read(val) {
        fbo1 = val;
      },
      get write() {
        return fbo2;
      },
      set write(val) {
        fbo2 = val;
      },
      swap() {
        const temp = fbo1;
        fbo1 = fbo2;
        fbo2 = temp;
      }
    };
  }

  private setupEvents() {
    window.addEventListener('resize', this.onResize);
  }

  public onResize = () => {
    const width = this.canvas.clientWidth || window.innerWidth;
    const height = this.canvas.clientHeight || window.innerHeight;
    this.canvas.width = width;
    this.canvas.height = height;
  };

  /**
   * Splats velocity and dye at normalized coordinates [0, 1]
   */
  public splat(x: number, y: number, dx: number, dy: number, color?: [number, number, number]) {
    const gl = this.gl;
    const aspect = this.canvas.width / this.canvas.height;
    const chosenColor = color || this.getRandomPaletteColor();

    gl.viewport(0, 0, this.velocity.width, this.velocity.height);
    gl.useProgram(this.splatProgram);
    gl.uniform1i(gl.getUniformLocation(this.splatProgram, 'uTarget'), this.velocity.read.attach(0));
    gl.uniform1f(gl.getUniformLocation(this.splatProgram, 'uAspect'), aspect);
    gl.uniform2f(gl.getUniformLocation(this.splatProgram, 'uPoint'), x, y);
    gl.uniform3f(gl.getUniformLocation(this.splatProgram, 'uColor'), dx, dy, 0.0);
    gl.uniform1f(gl.getUniformLocation(this.splatProgram, 'uRadius'), this.config.splatRadius / 100);
    this.blit(this.velocity.write.fbo);
    this.velocity.swap();

    gl.viewport(0, 0, this.density.width, this.density.height);
    gl.uniform1i(gl.getUniformLocation(this.splatProgram, 'uTarget'), this.density.read.attach(0));
    gl.uniform3f(
      gl.getUniformLocation(this.splatProgram, 'uColor'),
      chosenColor[0] * 0.45,
      chosenColor[1] * 0.45,
      chosenColor[2] * 0.45
    );
    this.blit(this.density.write.fbo);
    this.density.swap();
  }

  public onPointerMove(clientX: number, clientY: number) {
    const rect = this.canvas.getBoundingClientRect();
    const x = (clientX - rect.left) / rect.width;
    const y = 1.0 - (clientY - rect.top) / rect.height;

    const dx = (x - this.pointer.prevX) * this.config.splatForce;
    const dy = (y - this.pointer.prevY) * this.config.splatForce;

    if (Math.abs(dx) > 0.1 || Math.abs(dy) > 0.1) {
      this.splat(x, y, dx, dy);
    }

    this.pointer.prevX = x;
    this.pointer.prevY = y;
  }

  private getRandomPaletteColor(): [number, number, number] {
    const idx = Math.floor(Math.random() * this.activePalette.length);
    return this.activePalette[idx];
  }

  public setPalette(colors: string[]) {
    this.activePalette = colors.map((hex) => {
      const c = hex.replace('#', '');
      const num = parseInt(c, 16);
      return [(num >> 16) / 255, ((num >> 8) & 255) / 255, (num & 255) / 255];
    });
  }

  private blit(destinationFbo: WebGLFramebuffer | null) {
    this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, destinationFbo);
    this.blitMesh.bind();
  }

  public step(dt: number) {
    const gl = this.gl;

    // 1. Curl / Vorticity Computation
    gl.viewport(0, 0, this.curl.width, this.curl.height);
    gl.useProgram(this.curlProgram);
    gl.uniform2f(gl.getUniformLocation(this.curlProgram, 'uTexelSize'), 1 / this.velocity.width, 1 / this.velocity.height);
    gl.uniform1i(gl.getUniformLocation(this.curlProgram, 'uVelocity'), this.velocity.read.attach(0));
    this.blit(this.curl.fbo);

    // 2. Vorticity Confinement (Anti-dissipation of fluid swirls)
    gl.viewport(0, 0, this.velocity.width, this.velocity.height);
    gl.useProgram(this.vorticityProgram);
    gl.uniform2f(gl.getUniformLocation(this.vorticityProgram, 'uTexelSize'), 1 / this.velocity.width, 1 / this.velocity.height);
    gl.uniform1i(gl.getUniformLocation(this.vorticityProgram, 'uVelocity'), this.velocity.read.attach(0));
    gl.uniform1i(gl.getUniformLocation(this.vorticityProgram, 'uCurl'), this.curl.attach(1));
    gl.uniform1f(gl.getUniformLocation(this.vorticityProgram, 'uCurlStrength'), this.config.curlStrength);
    gl.uniform1f(gl.getUniformLocation(this.vorticityProgram, 'uDt'), dt);
    this.blit(this.velocity.write.fbo);
    this.velocity.swap();

    // 3. Divergence Computation
    gl.viewport(0, 0, this.divergence.width, this.divergence.height);
    gl.useProgram(this.divergenceProgram);
    gl.uniform2f(gl.getUniformLocation(this.divergenceProgram, 'uTexelSize'), 1 / this.velocity.width, 1 / this.velocity.height);
    gl.uniform1i(gl.getUniformLocation(this.divergenceProgram, 'uVelocity'), this.velocity.read.attach(0));
    this.blit(this.divergence.fbo);

    // 4. Pressure Relaxation (Jacobi Poisson Solver)
    gl.viewport(0, 0, this.pressure.width, this.pressure.height);
    gl.useProgram(this.pressureProgram);
    gl.uniform2f(gl.getUniformLocation(this.pressureProgram, 'uTexelSize'), 1 / this.velocity.width, 1 / this.velocity.height);
    gl.uniform1i(gl.getUniformLocation(this.pressureProgram, 'uDivergence'), this.divergence.attach(1));

    for (let i = 0; i < this.config.pressureIterations; i++) {
      gl.uniform1i(gl.getUniformLocation(this.pressureProgram, 'uPressure'), this.pressure.read.attach(0));
      this.blit(this.pressure.write.fbo);
      this.pressure.swap();
    }

    // 5. Gradient Subtraction (Enforce Incompressibility)
    gl.viewport(0, 0, this.velocity.width, this.velocity.height);
    gl.useProgram(this.gradientSubtractProgram);
    gl.uniform2f(gl.getUniformLocation(this.gradientSubtractProgram, 'uTexelSize'), 1 / this.velocity.width, 1 / this.velocity.height);
    gl.uniform1i(gl.getUniformLocation(this.gradientSubtractProgram, 'uPressure'), this.pressure.read.attach(0));
    gl.uniform1i(gl.getUniformLocation(this.gradientSubtractProgram, 'uVelocity'), this.velocity.read.attach(1));
    this.blit(this.velocity.write.fbo);
    this.velocity.swap();

    // 6. Advect Velocity
    gl.viewport(0, 0, this.velocity.width, this.velocity.height);
    gl.useProgram(this.advectionProgram);
    gl.uniform2f(gl.getUniformLocation(this.advectionProgram, 'uTexelSize'), 1 / this.velocity.width, 1 / this.velocity.height);
    gl.uniform1i(gl.getUniformLocation(this.advectionProgram, 'uVelocity'), this.velocity.read.attach(0));
    gl.uniform1i(gl.getUniformLocation(this.advectionProgram, 'uSource'), this.velocity.read.attach(0));
    gl.uniform1f(gl.getUniformLocation(this.advectionProgram, 'uDt'), dt);
    gl.uniform1f(gl.getUniformLocation(this.advectionProgram, 'uDissipation'), this.config.velocityDissipation);
    this.blit(this.velocity.write.fbo);
    this.velocity.swap();

    // 7. Advect Dye (Color Density)
    gl.viewport(0, 0, this.density.width, this.density.height);
    gl.uniform2f(gl.getUniformLocation(this.advectionProgram, 'uTexelSize'), 1 / this.density.width, 1 / this.density.height);
    gl.uniform1i(gl.getUniformLocation(this.advectionProgram, 'uVelocity'), this.velocity.read.attach(0));
    gl.uniform1i(gl.getUniformLocation(this.advectionProgram, 'uSource'), this.density.read.attach(1));
    gl.uniform1f(gl.getUniformLocation(this.advectionProgram, 'uDissipation'), this.config.densityDissipation);
    this.blit(this.density.write.fbo);
    this.density.swap();

    // 8. Display Render to Screen
    gl.viewport(0, 0, this.canvas.width, this.canvas.height);
    gl.useProgram(this.displayProgram);
    gl.uniform1i(gl.getUniformLocation(this.displayProgram, 'uTexture'), this.density.read.attach(0));
    this.blit(null);
  }

  private startLoop() {
    this.onResize();

    // Initial ambient fluid swirls
    setTimeout(() => {
      this.splat(0.48, 0.52, 250, -180);
      this.splat(0.52, 0.48, -200, 240);
    }, 200);

    const tick = () => {
      const now = performance.now();
      const dt = Math.min((now - this.lastTime) * 0.001, 0.024);
      this.lastTime = now;

      this.step(dt);
      this.rafId = requestAnimationFrame(tick);
    };

    this.rafId = requestAnimationFrame(tick);
  }

  public dispose() {
    if (this.rafId) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
    window.removeEventListener('resize', this.onResize);
  }
}

interface FBO {
  texture: WebGLTexture;
  fbo: WebGLFramebuffer;
  width: number;
  height: number;
  attach: (id: number) => number;
}

interface DoubleFBO {
  width: number;
  height: number;
  read: FBO;
  write: FBO;
  swap: () => void;
}
