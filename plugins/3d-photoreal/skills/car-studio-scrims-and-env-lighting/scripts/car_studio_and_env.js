/**
 * car_studio_and_env.js — High-Contrast Automotive Silk-Scrim / Showroom PMREM, Key Rig & Cyclorama Stage
 *
 * Provides turnkey automotive photography lighting & grounding for Three.js:
 *   1. `createAutomotiveStudioPMREM(renderer, opts)` — Generates a `HalfFloatType` PMREM environment
 *      calibrated for `F0 = 0.04` clearcoat physics (`L_scrim = 22–30` linear HDR so `0.04 * 26 ~ 1.04`
 *      produces gleaming liquid-glass reflections without chalky diffuse blowout), plus beltline strip
 *      scrims (`d.y in [0.03, 0.24]`), razor negative-fill horizon flags, and lower-hemisphere lit
 *      floor pool bounce (`d.y < -0.02`). Supports `'dark'`, `'light'`, `'showroom_hall'`, `'outdoor_overcast'`.
 *   2. `buildInfiniteCycloramaStage(opts)` — 360° G2-continuous studio cove or turntable stage with
 *      analytical under-chassis penumbra, 4-tire contact pads, and subtle Fresnel satin floor sheen.
 *   3. `addStudioKeyLightRig(scene, opts)` — Tight-frustum (`[-2.8, +2.8] m`) shadow-casting key + rim rig.
 *   4. `applyRoleSplitCarIBL(scene, carGroup, pmremTex)` — Enforces `scene.environment = null` and routes
 *      reflections strictly to paint, glazing, chrome, lamps, and machined alloys.
 */

import * as THREE from 'three';

export function createAutomotiveStudioPMREM(
  renderer,
  {
    mode = 'dark', // 'dark' | 'light' | 'showroom_hall' | 'outdoor_overcast'
    overheadIntensity = mode === 'showroom_hall' ? 6.5 : mode === 'light' ? 16.0 : 19.5,
    shoulderIntensity = mode === 'showroom_hall' ? 4.2 : mode === 'light' ? 6.8 : 8.0,
    beltlineIntensity = mode === 'showroom_hall' ? 0.65 : mode === 'light' ? 3.2 : 4.2,
    ambientCoveLuma = mode === 'showroom_hall'
      ? 0.048
      : mode === 'light'
        ? 0.28
        : mode === 'outdoor_overcast'
          ? 0.42
          : 0.055,
    floorBounceLuma = mode === 'light' ? 0.48 : mode === 'showroom_hall' ? 0.16 : 0.10,
    scrimOffsetX = 0.18,
    scrimHeightY = 3.45,
    scrimHalfLengthZ = 4.4,
    scrimHalfWidthX = mode === 'showroom_hall' ? 0.24 : 0.52,
  } = {},
) {
  const prevTarget = renderer.getRenderTarget();
  const size = new THREE.Vector2();
  renderer.getSize(size);

  const envScene = new THREE.Scene();
  const domeGeo = new THREE.SphereGeometry(18.0, 72, 54);

  const isHall = mode === 'showroom_hall' ? 1.0 : 0.0;
  const isOutdoor = mode === 'outdoor_overcast' ? 1.0 : 0.0;

  const domeMat = new THREE.ShaderMaterial({
    side: THREE.BackSide,
    depthWrite: false,
    toneMapped: false,
    uniforms: {
      uOverheadInt: { value: overheadIntensity },
      uShoulderInt: { value: shoulderIntensity },
      uBeltInt: { value: beltlineIntensity },
      uAmbLuma: { value: ambientCoveLuma },
      uFloorLuma: { value: floorBounceLuma },
      uScrimCenter: { value: new THREE.Vector3(scrimOffsetX, scrimHeightY, 0.0) },
      uScrimHalf: { value: new THREE.Vector2(scrimHalfWidthX, scrimHalfLengthZ) },
      uIsHall: { value: isHall },
      uIsOutdoor: { value: isOutdoor },
    },
    vertexShader: /* glsl */ `
      varying vec3 vDir;
      void main() {
        vDir = normalize(position);
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: /* glsl */ `
      precision highp float;
      uniform float uOverheadInt;
      uniform float uShoulderInt;
      uniform float uBeltInt;
      uniform float uAmbLuma;
      uniform float uFloorLuma;
      uniform vec3 uScrimCenter;
      uniform vec2 uScrimHalf;
      uniform float uIsHall;
      uniform float uIsOutdoor;
      varying vec3 vDir;

      // Crisp-framed overhead studio softbox bank with subtle structural crossbar mullions
      float evalOverheadScrim(vec3 d) {
        if (d.y <= 0.06) return 0.0;
        float t = uScrimCenter.y / d.y;
        vec2 hitXZ = d.xz * t - uScrimCenter.xz;
        float uNorm = hitXZ.x / uScrimHalf.x; // -1 .. +1
        float vNorm = hitXZ.y / uScrimHalf.y; // -1 .. +1
        // Crisp 3% architectural softbox edge on inner side, smooth feathered falloff on outer side
        float maskX = smoothstep(-1.02, -0.95, uNorm) * (1.0 - smoothstep(0.55, 1.12, uNorm));
        float maskZ = 1.0 - smoothstep(0.88, 1.02, abs(vNorm));
        float gradX = mix(1.0, 0.42, clamp((uNorm + 0.95) * 0.50, 0.0, 1.0));
        // Subtle aluminum softbox frame crossbars every ~1.5m so windshield reflections look unmistakably real!
        float mullion = smoothstep(0.012, 0.028, abs(fract(vNorm * 3.0 + 0.5) - 0.5));
        return maskX * maskZ * gradX * mix(0.35, 1.0, mullion);
      }

      // Secondary parallel accent rib for dual-ribbon hood & roof highlights
      float evalSecondaryRib(vec3 d) {
        if (d.y <= 0.08) return 0.0;
        float t = (uScrimCenter.y + 0.15) / d.y;
        vec2 hitXZ = d.xz * t;
        float dx = abs(hitXZ.x + uScrimCenter.x + uScrimHalf.x * 1.45);
        float maskX = 1.0 - smoothstep(0.14, 0.24, dx);
        float maskZ = 1.0 - smoothstep(uScrimHalf.y * 0.80, uScrimHalf.y * 0.98, abs(hitXZ.y));
        return maskX * maskZ;
      }

      // Continuous beltline strip-scrim right above the negative-fill horizon (d.y in [0.035, 0.22])
      float evalBeltlineStrip(vec3 d) {
        float bandY = smoothstep(0.028, 0.052, d.y) * (1.0 - smoothstep(0.17, 0.26, d.y));
        // Wrap around left, right, front-3/4, and rear-3/4 with slight breaks at 45 deg corners for sculpted contrast
        float azimMod = 0.72 + 0.28 * cos(atan(d.z, d.x) * 4.0);
        float vGrad = mix(1.0, 0.45, clamp((d.y - 0.04) / 0.18, 0.0, 1.0));
        return bandY * azimMod * vGrad;
      }

      // Lateral Flank Softbox Banks (d.y in [0.09, 0.42], |d.x| > 0.60):
      // Strictly gated to vertical doors & rear haunches so 30-degree raked wedge hoods & roofs NEVER wash out!
      float evalShoulderSoftbox(vec3 d) {
        if (d.y <= 0.07 || d.y >= 0.46 || abs(d.x) <= 0.54) return 0.0;
        float bandY = smoothstep(0.08, 0.16, d.y) * (1.0 - smoothstep(0.32, 0.44, d.y));
        float latMask = smoothstep(0.58, 0.82, abs(d.x));
        float zSpan = 1.0 - smoothstep(0.80, 0.96, abs(d.z));
        float mullion = smoothstep(0.010, 0.024, abs(fract(d.z * 3.5 + 0.5) - 0.5));
        float gradY = mix(0.65, 1.0, smoothstep(0.12, 0.34, d.y));
        return bandY * latMask * zSpan * gradY * mix(0.45, 1.0, mullion);
      }

      // Geneva / IAA exhibition hall dark-truss ceiling rectangular LED fixtures + segmented aisle light tracks
      vec3 evalShowroomHall(vec3 d) {
        vec3 acc = vec3(0.0);
        if (d.y > 0.14) {
          float t = 4.8 / d.y;
          vec2 ceilingXZ = d.xz * t;
          // Sparse architectural gallery ceiling bays with crisp paired slim LED light fixtures (zero round polka-dot measles!)
          vec2 cell = fract(ceilingXZ * vec2(0.42, 0.48)) - 0.5;
          vec2 qFix = abs(vec2(abs(cell.x) - 0.042, cell.y)) - vec2(0.011, 0.036);
          float dFix = length(max(qFix, 0.0)) + min(max(qFix.x, qFix.y), 0.0);
          float inBounds = 1.0 - smoothstep(5.4, 9.2, length(ceilingXZ));
          float fixture = (1.0 - smoothstep(0.002, 0.009, dFix)) * inBounds;
          // Segmented overhead truss light fixtures flanking the booth (|x| = 1.65 m) — broken along Z so profile cantrails never catch a solid white bar!
          float zSeg = smoothstep(0.18, 0.30, abs(fract(ceilingXZ.y * 1.15) - 0.5));
          float trackRail = (1.0 - smoothstep(0.05, 0.11, abs(abs(ceilingXZ.x) - 1.65))) * (1.0 - smoothstep(3.6, 4.4, abs(ceilingXZ.y))) * zSeg;
          acc += vec3(1.0, 0.98, 0.95) * (fixture * 19.5 + trackRail * 4.2);
        }
        // Discrete exhibition hall mezzanine light bays (<16% duty cycle -> sculpted flank highlights with ZERO 90/270 deg profile roof whiteout!)
        if (d.y > 0.06 && d.y < 0.34) {
          float az = atan(d.z, d.x);
          float bayMask = smoothstep(0.32, 0.42, abs(fract(az * 3.82) - 0.5));
          float yWindow = smoothstep(0.07, 0.12, d.y) * (1.0 - smoothstep(0.24, 0.32, d.y));
          acc += vec3(1.02, 0.95, 0.86) * (bayMask * yWindow * 1.85);
        }
        // Subtle warm exhibition hall pavilion glow + cool booth strip near horizon
        float warmBooth = smoothstep(0.01, 0.08, d.y) * (1.0 - smoothstep(0.16, 0.28, d.y)) * smoothstep(-0.4, 0.8, d.x);
        float coolAccent = smoothstep(0.01, 0.03, d.y) * (1.0 - smoothstep(0.045, 0.075, d.y)) * smoothstep(0.2, 0.9, d.z);
        acc += vec3(1.08, 0.88, 0.72) * (warmBooth * 0.65);
        acc += vec3(0.38, 0.62, 1.18) * (coolAccent * 0.95);
        return acc;
      }

      void main() {
        vec3 d = normalize(vDir);

        if (uIsOutdoor > 0.5) {
          // Calibrated overcast Chappuis sky dome + dark wet/dry asphalt horizon
          float skyT = clamp(d.y, 0.0, 1.0);
          vec3 skyCol = mix(vec3(2.8, 3.0, 3.35), vec3(5.2, 5.6, 6.4), pow(skyT, 0.55));
          vec3 groundCol = mix(vec3(0.18, 0.19, 0.21), vec3(0.05, 0.055, 0.065), clamp(-d.y * 3.0, 0.0, 1.0));
          float horizonCut = smoothstep(-0.015, 0.020, d.y);
          vec3 outCol = mix(groundCol, skyCol, horizonCut);
          gl_FragColor = vec4(outCol, 1.0);
          return;
        }

        // 1. Upper studio dark ceiling vs. Lower lit cyclorama floor pool reflection!
        vec3 upperAmb = vec3(uAmbLuma) * vec3(0.95, 0.98, 1.05);
        // Lit floor pool centered under the car (d.y in [-0.85, -0.02]) gives lower-door concave bounce!
        float floorPool = smoothstep(-0.88, -0.10, d.y) * (1.0 - smoothstep(-0.04, 0.00, d.y));
        vec3 lowerBounce = vec3(uFloorLuma) * mix(0.28, 1.35, floorPool) * vec3(0.97, 0.99, 1.03);

        vec3 col = mix(lowerBounce, upperAmb, smoothstep(-0.02, 0.02, d.y));

        // 2. Razor Black-Velvet Negative-Fill Horizon Flag (d.y in [-0.025, +0.032])
        float negFlag = smoothstep(-0.038, -0.012, d.y) * (1.0 - smoothstep(0.018, 0.040, d.y));
        col *= mix(1.0, 0.08, negFlag);

        // 3. Overhead Silk-Scrim Ribbons (in showroom_hall mode, studio scrims attenuate to 0.16x so discrete hall spot-arrays dominate!)
        float scrimHallScale = mix(1.0, 0.16, uIsHall);
        float shoulderHallScale = mix(1.0, 0.10, uIsHall); // Prevents 90/270-deg profile roof & cantrail grazing-Fresnel whiteout!
        float topScrim = evalOverheadScrim(d);
        float secRib = evalSecondaryRib(d);
        col += vec3(0.99, 1.00, 1.02) * scrimHallScale * (uOverheadInt * topScrim + uOverheadInt * 0.52 * secRib);

        // 4. 45-degree Shoulder Softboxes + Beltline Lateral/Nose/Tail Silk Strip-Scrim
        float shoulderBox = evalShoulderSoftbox(d);
        float beltStrip = evalBeltlineStrip(d);
        col += vec3(0.97, 0.99, 1.04) * (uShoulderInt * shoulderHallScale * shoulderBox + uBeltInt * beltStrip);

        // 5. Optional Showroom Exhibition Hall Spot Matrix
        if (uIsHall > 0.5) {
          col += evalShowroomHall(d);
        }

        gl_FragColor = vec4(min(col, vec3(240.0)), 1.0);
      }
    `,
  });
  domeMat.userData.linearOutput = true;
  envScene.add(new THREE.Mesh(domeGeo, domeMat));

  const pmrem = new THREE.PMREMGenerator(renderer);
  pmrem.compileEquirectangularShader();
  // CRITICAL MIP-0 ZERO-SIGMA LAW: ALWAYS pass `sigma = 0` so Mip-0 preserves razor-sharp clearcoat mirror edges!
  const envRT = pmrem.fromScene(envScene, 0);

  // Reset WebGLRenderer's internal viewport/scissor (mutated to 768px by pre-r187 CubeUV PMREMGenerator; defensive guard on r187+)
  renderer.setRenderTarget(prevTarget);
  if (size.x > 0 && size.y > 0) {
    renderer.setViewport(0, 0, size.x, size.y);
    renderer.setScissor(0, 0, size.x, size.y);
  }
  renderer.setScissorTest(false);

  domeGeo.dispose();
  domeMat.dispose();
  pmrem.dispose();

  envRT.texture.envMap = envRT.texture;
  return envRT.texture;
}

/**
 * Adds a physically balanced automotive shadow-casting Key + Cool Rim + Floor Bounce light rig
 * with a tight `[-2.8, +2.8] m` orthographic shadow frustum so brake calipers, spokes, mirrors,
 * and wings cast razor-clean shadows without washing out the cyclorama.
 */
export function addStudioKeyLightRig(
  scene,
  {
    keyIntensity = 1.25,
    rimIntensity = 0.68,
    fillIntensity = 0.38,
    hemiIntensity = 0.24,
    keyPos = [3.2, 5.4, 3.8],
    rimPos = [-4.2, 3.2, -3.8],
  } = {},
) {
  const rig = new THREE.Group();
  rig.name = 'StudioKeyLightRig';

  const key = new THREE.DirectionalLight(0xfffcf8, keyIntensity);
  key.position.set(...keyPos);
  key.castShadow = true;
  key.shadow.mapSize.set(2048, 2048);
  key.shadow.camera.near = 0.8;
  key.shadow.camera.far = 16.0;
  key.shadow.camera.left = -2.85;
  key.shadow.camera.right = 2.85;
  key.shadow.camera.top = 2.85;
  key.shadow.camera.bottom = -2.85;
  key.shadow.bias = -0.00035;
  key.shadow.normalBias = 0.008;
  rig.add(key);

  const rim = new THREE.DirectionalLight(0xdce8ff, rimIntensity);
  rim.position.set(...rimPos);
  rig.add(rim);

  const frontFill = new THREE.DirectionalLight(0xf6f8ff, fillIntensity);
  frontFill.position.set(-2.4, 2.2, 4.6);
  rig.add(frontFill);

  const hemi = new THREE.HemisphereLight(0xdce4f2, 0x22252c, hemiIntensity);
  rig.add(hemi);

  scene.add(rig);
  return rig;
}

export function buildInfiniteCycloramaStage({
  mode = 'dark', // 'dark' | 'light' | 'showroom_dark'
  radius = 18.0,
  wallHeight = 9.5,
  coveRadius = 4.2,
  wheelbase = 2.45,
  frontTrack,
  trackFront,
  rearTrack,
  trackRear,
  bodyHalfWidth,
  carWidth,
  bodyHalfLength,
  carLength,
  tireWidth = 0.265,
  groundClearance = 0.125,
  turntablePlinthRadius = 0.0, // > 0 adds crisp exhibition turntable ring seam
  floorLinearColor = mode === 'light'
    ? [0.62, 0.63, 0.65]
    : mode === 'showroom_dark'
      ? [0.026, 0.028, 0.033]
      : [0.048, 0.052, 0.062],
  wallLinearColor = mode === 'light'
    ? [0.012, 0.013, 0.016] // Like GIMS white turntable against dark exhibition hall!
    : [0.012, 0.014, 0.018],
  whiteCoveWall = false,
} = {}) {
  const fTrack = frontTrack ?? trackFront ?? 1.58;
  const rTrack = rearTrack ?? trackRear ?? 1.60;
  const bHalfW = bodyHalfWidth ?? (carWidth ? carWidth * 0.5 : 0.93);
  const bHalfL = bodyHalfLength ?? (carLength ? carLength * 0.5 : 2.26);

  const resolvedWall = whiteCoveWall ? [0.68, 0.70, 0.73] : wallLinearColor;

  const pts = [];
  const flatR = Math.max(4.2, radius - coveRadius);
  const flatSteps = 32;
  for (let i = 0; i <= flatSteps; i++) {
    pts.push(new THREE.Vector2((i / flatSteps) * flatR, 0.0));
  }
  const coveSteps = 28;
  for (let i = 1; i <= coveSteps; i++) {
    const t = (i / coveSteps) * (Math.PI * 0.5);
    const ct = Math.pow(Math.cos(t), 0.85);
    const st = Math.pow(Math.sin(t), 1.15);
    const r = flatR + coveRadius * (1.0 - ct);
    const y = coveRadius * st;
    pts.push(new THREE.Vector2(r, y));
  }
  pts.push(new THREE.Vector2(radius, wallHeight));

  const geo = new THREE.LatheGeometry(pts, 96);
  const zF = wheelbase * 0.5;
  const zR = -wheelbase * 0.5;

  const mat = new THREE.ShaderMaterial({
    side: THREE.DoubleSide,
    uniforms: {
      uFloorCol: { value: new THREE.Vector3(...floorLinearColor) },
      uWallCol: { value: new THREE.Vector3(...resolvedWall) },
      uPoolRadius: { value: 6.4 },
      uPoolBoost: { value: mode === 'light' ? 1.12 : 1.85 },
      uCarHalfXZ: { value: new THREE.Vector2(bHalfW, bHalfL) },
      uClearance: { value: groundClearance },
      uWheelFL: { value: new THREE.Vector2(fTrack * 0.5, zF) },
      uWheelFR: { value: new THREE.Vector2(-fTrack * 0.5, zF) },
      uWheelRL: { value: new THREE.Vector2(rTrack * 0.5, zR) },
      uWheelRR: { value: new THREE.Vector2(-rTrack * 0.5, zR) },
      uPatchHalfXZ: { value: new THREE.Vector2(tireWidth * 0.52, 0.125) },
      uPlinthR: { value: turntablePlinthRadius },
    },
    vertexShader: /* glsl */ `
      varying vec3 vWorldPos;
      void main() {
        vec4 wp = modelMatrix * vec4(position, 1.0);
        vWorldPos = wp.xyz;
        gl_Position = projectionMatrix * viewMatrix * wp;
      }
    `,
    fragmentShader: /* glsl */ `
      precision highp float;
      uniform vec3 uFloorCol;
      uniform vec3 uWallCol;
      uniform float uPoolRadius;
      uniform float uPoolBoost;
      uniform vec2 uCarHalfXZ;
      uniform float uClearance;
      uniform vec2 uWheelFL;
      uniform vec2 uWheelFR;
      uniform vec2 uWheelRL;
      uniform vec2 uWheelRR;
      uniform vec2 uPatchHalfXZ;
      uniform float uPlinthR;
      varying vec3 vWorldPos;

      float sdRoundRect(vec2 p, vec2 b, float r) {
        vec2 q = abs(p) - b + vec2(r);
        return length(max(q, 0.0)) + min(max(q.x, q.y), 0.0) - r;
      }

      float tireContactOcc(vec2 xz, vec2 center) {
        float d = sdRoundRect(xz - center, uPatchHalfXZ, 0.038);
        float core = 1.0 - smoothstep(-0.012, 0.055, d);
        float skirt = 1.0 - smoothstep(0.0, 0.28, d);
        return clamp(core * 0.96 + skirt * 0.44, 0.0, 0.985);
      }

      void main() {
        vec2 xz = vWorldPos.xz;
        float distOrigin = length(xz);
        float wallBlend = smoothstep(0.015, 2.8, vWorldPos.y);

        // Studio overhead light pool + subtle grazing floor Fresnel sheen
        float pool = exp(-pow(distOrigin / uPoolRadius, 2.0) * 1.10);
        vec3 viewV = normalize(cameraPosition - vWorldPos);
        float grazing = pow(1.0 - clamp(abs(viewV.y), 0.0, 1.0), 4.0) * (1.0 - wallBlend);
        vec3 floorBase = uFloorCol * mix(0.48, uPoolBoost, pool) + vec3(0.022, 0.025, 0.030) * grazing;

        // Optional showroom tile / turntable seam lines for metric scale grounding!
        if (uPlinthR > 0.5 && vWorldPos.y < 0.02) {
          float dRing = abs(distOrigin - uPlinthR);
          float fwR = max(fwidth(dRing), 0.004);
          float seam = 1.0 - smoothstep(0.005, 0.005 + fwR, dRing);
          floorBase *= (1.0 - 0.55 * seam);
          // Subtle 0.90m architectural showroom floor tile seams outside/inside
          vec2 tile = abs(fract(xz / 0.95) - 0.5);
          float dTile = min(tile.x, tile.y);
          float fwT = max(max(fwidth(xz.x / 0.95), fwidth(xz.y / 0.95)), 0.003);
          float grout = (1.0 - smoothstep(0.003, 0.003 + fwT, dTile)) * 0.22;
          floorBase *= (1.0 - grout);
        }

        vec3 base = mix(floorBase, uWallCol, wallBlend);

        // Subtle matte mineral micro-grain on floor
        vec2 gUv = xz * 64.0;
        vec2 fw = fwidth(gUv);
        float nyq = 1.0 / (1.0 + dot(fw, fw) * 1.4);
        float grain = fract(sin(dot(floor(gUv), vec2(127.1, 311.7))) * 43758.5453) - 0.5;
        base *= 1.0 + grain * 0.030 * nyq * (1.0 - wallBlend);

        // Analytical under-chassis floorpan occlusion + directional cast-shadow offset + 4-tire contact collars
        if (vWorldPos.y < 0.06) {
          float penumbra = 0.13 + uClearance * 1.65;
          // Slight key-light shadow offset (-0.06, -0.05) + core vertical ambient occlusion
          float dBodyCore = sdRoundRect(xz, uCarHalfXZ * vec2(0.95, 0.96), 0.26);
          float dBodyCast = sdRoundRect(xz - vec2(-0.07, -0.06), uCarHalfXZ * vec2(0.97, 0.98), 0.24);
          float occCore = (1.0 - smoothstep(-0.16, penumbra, dBodyCore)) * clamp(0.94 - uClearance * 0.72, 0.62, 0.94);
          float occCast = (1.0 - smoothstep(-0.04, 0.08, dBodyCast)) * 0.55;
          float chassisOcc = clamp(max(occCore, occCast), 0.0, 0.95);

          float wOcc = max(
            max(tireContactOcc(xz, uWheelFL), tireContactOcc(xz, uWheelFR)),
            max(tireContactOcc(xz, uWheelRL), tireContactOcc(xz, uWheelRR))
          );
          float totalOcc = clamp(max(chassisOcc, wOcc), 0.0, 0.98);
          base *= (1.0 - totalOcc);
        }

        gl_FragColor = vec4(max(base, vec3(0.0)), 1.0);
      }
    `,
  });
  mat.userData.linearOutput = true;
  mat.userData.carRole = 'cyclorama_floor';

  const mesh = new THREE.Mesh(geo, mat);
  mesh.name = 'StudioCycloramaCove';
  mesh.receiveShadow = true;
  return mesh;
}

export function applyRoleSplitCarIBL(scene, carGroupOrTex, maybePmremTex) {
  scene.environment = null;

  let carGroup = carGroupOrTex;
  let pmremTex = maybePmremTex;
  if (carGroupOrTex && carGroupOrTex.isTexture && !maybePmremTex) {
    pmremTex = carGroupOrTex;
    carGroup =
      (typeof window !== 'undefined' && window.__CAR_GROUP__) ||
      scene.getObjectByName('CarGroup') ||
      scene;
  }

  if (!carGroup || !pmremTex) return;
  carGroup.traverse((obj) => {
    if (!obj.isMesh || !obj.material) return;
    const mats = Array.isArray(obj.material) ? obj.material : [obj.material];
    for (const m of mats) {
      if (!m) continue;
      const role = m.userData && m.userData.carRole;
      const isReflectiveRole =
        role === 'paint' ||
        role === 'glass' ||
        role === 'alloy' ||
        role === 'chrome' ||
        role === 'lamp_lens';
      const isReflectivePBR =
        !role &&
        ((m.metalness !== undefined && m.metalness >= 0.35) ||
          (m.clearcoat !== undefined && m.clearcoat >= 0.25) ||
          (m.transmission !== undefined && m.transmission >= 0.25));

      if (role === 'liner') {
        m.envMap = null;
        m.envMapIntensity = 0.0;
      } else if (role === 'rubber' || role === 'trim' || role === 'matte_interior') {
        m.envMap = pmremTex;
        if (!m.userData || !m.userData.lockEnvIntensity) {
          m.envMapIntensity = role === 'rubber' ? 0.54 : role === 'trim' ? 0.58 : 0.38;
        }
        m.needsUpdate = true;
      } else if (isReflectiveRole || isReflectivePBR) {
        m.envMap = pmremTex;
        // Enforce F0=0.04 clearcoat vs machined alloy/chrome balance unless explicitly locked (`lockEnvIntensity: true`)
        if (!m.userData || !m.userData.lockEnvIntensity) {
          m.envMapIntensity =
            role === 'glass'
              ? 0.96
              : role === 'lamp_lens'
                ? 1.25
                : role === 'chrome'
                  ? 0.90
                  : role === 'alloy'
                    ? 0.84
                    : 0.90;
        }
        m.needsUpdate = true;
      }
    }
  });
}
