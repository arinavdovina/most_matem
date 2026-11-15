/* A local vector illustration. Each mounted scene owns its bridge and vehicle. */
(() => {
  'use strict';

  const SVG_NS = 'http://www.w3.org/2000/svg';
  const leftEdge = 240;
  const rightEdge = 677;
  let instance = 0;

  // The dark and sun-facing halves give even the small trees a woodcut silhouette.
  function pine(x, y, height, shadow, light) {
    return `<g transform="translate(${x} ${y}) scale(${height / 60})">
      <path fill="${shadow}" d="M-1.5 0v-6h-11l5-8h-5l6-9h-4l6-11h-3l6.5-26 7 26h-3l6 11H6l7 9H8l6 8H2v6z"/>
      <path fill="${light}" d="m0-57 .5 48h9l-6-8h4l-6-10H5l-4-10h2z"/>
    </g>`;
  }

  function woods(start, end, ground, trees, base, variation, dark, light) {
    return Array.from({length: trees}, (_, i) => {
      const t = i / (trees - 1);
      const x = start + (end - start) * t + Math.sin(i * 3.03) * 3;
      const y = ground + Math.sin(i * 0.51) * 2;
      const h = base + (1 + Math.sin(i * 2.53 + 1)) * variation;
      return pine(x.toFixed(1), y.toFixed(1), h, dark, light);
    }).join('');
  }

  function sceneArt(id) {
    const ref = name => `url(#${id}-${name})`;
    return `<defs>
      <linearGradient id="${id}-sky" x2="0" y2="1" gradientUnits="objectBoundingBox">
        <stop stop-color="#84c7c8"/><stop offset="1" stop-color="#f4e8b8"/>
      </linearGradient>
      <linearGradient id="${id}-water" x2=".2" y2="1">
        <stop stop-color="#a6d6c2"/><stop offset=".55" stop-color="#67b7ab"/><stop offset="1" stop-color="#35958c"/>
      </linearGradient>
      <pattern id="${id}-paper" width="17" height="19" patternUnits="userSpaceOnUse">
        <circle cx="2" cy="4" r=".7" fill="#153f42" opacity=".15"/>
        <circle cx="12" cy="11" r=".9" fill="#fff6d8" opacity=".47"/>
        <path d="m4 15 1 .65m10-11 1-.5" stroke="#32605a" stroke-width=".6" opacity=".16"/>
      </pattern>
      <pattern id="${id}-rock" width="27" height="36" patternUnits="userSpaceOnUse">
        <path d="m3 29 2-8m12-10 1-5m5 28 2-4" stroke="#edd197" stroke-width="1.3" opacity=".48"/>
      </pattern>
    </defs>
    <rect width="920" height="450" fill="${ref('sky')}"/>
    <circle cx="717" cy="72" r="36" fill="#f9d27e"/>
    <circle cx="717" cy="72" r="30" fill="#ffe5a2"/>
    <g fill="#fff5dc">
      <path d="M68 77c4-8 10-10 20-9 5-14 20-22 33-16 6-13 22-17 33-8 4 3 7 8 7 13 13-2 23 2 27 10 11-1 21 3 27 10z"/>
      <path d="M326 45c4-5 10-6 17-5 4-10 15-14 23-10 6-11 20-10 25 2 10-1 15 3 17 7 7 0 13 1 17 6z"/>
      <path d="M782 110c4-6 11-8 18-7 4-12 16-17 26-11 7-15 26-17 34-3 11-3 20 3 21 11 10-1 19 3 24 10z"/>
    </g>
    <g fill="none" stroke="#ebf2d4" stroke-linecap="round" opacity=".7" stroke-width="2">
      <path d="M93 83h44m9 0h12m201-34h31m414 66h43"/>
    </g>
    <g fill="none" stroke="#416e70" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
      <path d="M533 52q5 0 8 4 2-5 7-6m11 8q4 0 7 3 2-4 6-5m-58 13q3 0 5 3 2-4 5-5"/>
    </g>

    <!-- Five receding ridgelines break up the horizon. -->
    <path fill="#a2c1a9" d="M0 180 65 129 91 146 145 112 178 132 244 88 296 132 330 113 404 169 452 127 506 149 577 94 610 124 668 83 738 146 798 116 853 144 920 99v126H0z"/>
    <path fill="#86ad9b" d="m0 177 78-58 52 45 27-12 68 39 60-57 54 25 74 36 47-50 56 25 43-22 70 45 68-61 32 15 71-70 35 36 17-14 47 46 33-18 38 34v57H0z"/>
    <path fill="#447c7c" d="M-25 192 58 133 77 141 145 78 173 112 190 99 285 187 316 157 334 161 383 107 398 114 458 47 480 78 489 75 545 139 559 126 593 155 625 125 638 130 681 90 698 104 711 100 777 165 796 156 822 133 844 140 877 115 950 177v49H-25z"/>
    <path fill="#72a49b" d="m-25 192 83-59-23 37 41-28 69-64-20 45-36 46 52-31 13-17-4 25-39 51 76-51-18 25 21-8 24 33 27-21 31 15 13-8 31-25 18 4 49-54-13 39 28-21 60-78-13 42-28 41 25-13-13 23-38 39 54-36 14-26 16-20 4-19 10-3 10 12-4 20 29 28-13 9 14 30 35-48-3 20 33 9 33-30 13 5 43-40-20 36 15-3-29 48 47-48 17-22 66 64-44-30 25 33-49-27-15 18 38 42H-25z"/>
    <g fill="#f7edcd">
      <path d="m99 121 46-43 28 34 17-13 26 25-22-10-5 9-12-5 11 15-21-14-10-19-3 14-8-6-18 23 7-16-15 8 13-20z"/>
      <path d="m394 117 64-70 22 31 9-3 32 38-20-11-8-12-3 9-9-3 20 34-26-23-10-22-6 9-3-21-12 17 1-11-26 35 5-15-13 8z"/>
      <path d="m648 121 33-31 17 14 13-4 28 28-21-12-8-7-6 9-8-8 2 11-16-14-4-7-11 16 1-7z"/>
      <path d="m854 134 23-19 20 17-16-7-4 4-3-6z"/>
    </g>
    <g fill="none" stroke="#a8c3aa" stroke-linecap="round" stroke-width="1.6" opacity=".82">
      <path d="m100 156 27-28m46 26 23-20m127 43 34-36m-23 33 12-12m81-23 14-19m30-3 20 25m-16-12 12 14m78 12 14 15m57-22 16-20m100 32 19 16"/>
    </g>
    <path fill="#60998b" d="M0 176q45-7 93-16l62 10 56 17 66-14 50 8 52-12 53 14 44-12 45-3 59 18 48-18 63-10 54 17 53-12 60 13 62-11v59H0z"/>
    ${woods(0, 920, 200, 96, 9, 7, '#608c79', '#709680')}
    <path fill="#568570" d="M0 194q85-7 152 3l68-4 65 5 69-5 67 8 45-3 46 5 34-5q95-9 167-16l163 3 44-9v44H0z"/>
    <path fill="#a1b989" d="M0 202q139-10 230 4l128-6 80 5 39-2 55 3 73-9 99-2 216-12v46H0z"/>
    <path fill="${ref('water')}" d="M0 228q176-22 326-18l102-5 54 1 17 2-42 5 40 1 69-6 128-10 226 11v241H0z"/>
    <g fill="none" stroke-linecap="round">
      <path stroke="#dbdfba" stroke-width="2" d="M347 215h80m46 3 29-1m58-5 53-3m-186 16 56-1m68-4 15-.5m-224 17 60-1 19-1m206-12 30-1"/>
      <path stroke="#dbebc6" stroke-width="2.5" d="m277 260 62-1m7 0h14m117-14 51-1m42 12 54-2m-248 29 52-1m128-8 60-2m-167 34 48-2m-87 13 25-1m144-25 20-1m-232 52 41-2m7 0 14-1m63-19 35-2m75 15 36-1m-225 40 37-2m73-17 50-2m29 21 38-2m-272 37 51-2m68 12 82-5m12 0 15-1"/>
      <path stroke="#439d93" stroke-width="2" d="m319 247 45-1m160-14 25-1m14 39 35-2m-158 20 30-1m41 17 39-2m-150 36 21-1m107-5 36-2m-113 35 62-4m-76 26 17-1m148-9 42-3m-269 43 52-3m67-15 52-3"/>
    </g>

    <!-- Sandstone banks, with shadows under their grassy upper shelves. -->
    <path fill="#97614d" d="M0 255h218l30 18-12 44-22 19-7 30-11 22-17 13 14 14-10 23-17 12H0z"/>
    <path fill="#c18459" d="m0 271 211 1 34 11-10 31-22 19-9 34-10 18-19 15 13 16-9 20-20 14H0z"/>
    <path fill="#d8a86d" d="m2 282 222-1 12 6-82 13-10 22-61 3-19 22-64 6z"/>
    <path fill="#a96f50" d="m224 284-22 23-11 4-16 29-17 11-14 42-22 12-12 36-18 9h47l19-46 20-13 9-25 16-15 6-31z"/>
    <path fill="#835d4a" d="m216 328-4 16-12 16-5 19-19 20-14 30-11 21h-20l16-19 12-35 20-16 6-23 16-14z"/>
    <path fill="#ecc18a" d="m131 297 66-8-22 9-35 4-20 15 8-15-43 5 9-4zm27 40-15 22-9 4 2-8zm-52 45-12 30-15 3 11-11 2-14z"/>
    <path fill="${ref('rock')}" d="M0 280h228l-18 48-28 48-23 36-17 38H0z"/>
    <path fill="#e0ba7c" d="m0 256 196-4 45 17 7 7-9 9-37 1-26 5-41-1-28 4-38-2-36 5-33-3z"/>
    <path fill="#466e59" d="M0 243c39-11 75-4 111 0 23 2 51-1 73 4l38 9 19 13-35 7-77 2-63 4-66-1z"/>
    <path fill="#88a66d" d="m0 251 75-3 47 5 61-3 36 8 22 11-39 4-65 2-44 3-44-2-49 2z"/>
    <path fill="#bec183" d="m0 267 97-4 41 2 43-2 29 2 17 5-63 2-62 1-52 2-50-1z"/>
    <path fill="#dfc99a" d="m0 272 54-3 64 1 90-2 33 2-35 4-71 1-63 3-41-1-31 2z"/>

    <path fill="#855e48" d="m676 270 45-14 199-12v206H768l-16-21-27-6-5-18-20-14-5-32-13-15-5-40-9-16z"/>
    <path fill="#c38b5e" d="m679 276 47-10 194-14v198H784l-17-22-34-10-5-18-21-14-4-31-14-17-4-37-13-13z"/>
    <path fill="#d6a472" d="m693 285 105-10 122-7v40l-68-8-77 8-20 8-34-7-25 6z"/>
    <path fill="#a87553" d="m691 285 16 22 5 32 19 10 10 35 17 15 9 27-19-13-6-16-18-13-6-29-17-15-4-25zm75 13 15 33 26 13 11 26 38 18 17 35 23 27h-25l-16-35-37-24-14-29-25-11-12-28z"/>
    <path fill="#ecc18a" d="m716 294 28-2 31 7 39-4-36 9-34-7-9 3zm33 31 18 22 9 3-10-15zm34 47 16 21 8 2-14-22z"/>
    <path fill="${ref('rock')}" d="m695 281 225-12v181H797l-57-54-21-46z"/>
    <path fill="#debb82" d="m675 268 33-16 212-11v36l-64 3-47-3-77 8-45 1-15-7z"/>
    <path fill="#587d5d" d="m672 270 18-11 36-8 21-7 38-1 42-12 93-4v43l-92-1-76 9-62-2z"/>
    <path fill="#9db47b" d="m673 270 38-13 40-4 27-6 35 2 47-11 60-1v30l-106 2-62 6-63 1z"/>
    <path fill="#e4d0a0" d="m675 270 41-4 44-2 81-6 79 1v5l-66-1-98 7-63 3z"/>

    <!-- Closer pines, wild grasses and a riverbank boulder. -->
    ${woods(4, 98, 248, 12, 30, 20, '#3c7163', '#59836a')}
    ${pine(-3, 260, 116, '#2b625c', '#427561')}
    ${pine(28, 262, 132, '#2e665d', '#55836a')}
    ${pine(68, 255, 82, '#376b5d', '#5b8668')}
    ${pine(95, 250, 48, '#4c765e', '#62896a')}
    ${woods(822, 925, 245, 13, 33, 19, '#42755e', '#5a8769')}
    ${pine(837, 247, 54, '#3e735f', '#5d8867')}
    ${pine(863, 246, 86, '#2f6a5a', '#477960')}
    ${pine(904, 243, 117, '#245e56', '#41755e')}
    ${pine(925, 249, 85, '#306756', '#4a7e63')}
    <g fill="#4b785e">
      <path d="m8 260-8-7 7 3-2-9 6 10 5-7-3 11zm64-3-4-6 5 4 2-8 1 8 6-4-4 7zm113 3-5-4 6 2 2-5v7zm555-2-5-6 6 3 1-7 2 7 3-4-2 6zm62-9-6-6 5 2 1-9 4 10 4-4-2 7zm85 1-5-7 7 4 3-8v9l6-3-4 6z"/>
    </g>
    <g fill="#658675">
      <path d="m240 398 11-8 17 3 8 7-17 3-21-2z"/><path d="m699 410 9-7 9 1 8 8-17 3z"/>
      <path d="m210 425 16-16 21 4 15 11-18 5-22 1z"/>
    </g>
    <g fill="#a4b096"><path d="m241 397 10-7 14 2-6 6zm-31 28 16-16 15 3-10 11zm490-16 8-6 7 1-8 6z"/></g>
    <g stroke="#b7d6b2" stroke-width="2" fill="none" stroke-linecap="round"><path d="m236 404 24 1 17-3m-65 30 32 2 19-5m441-12 17-1 8-2"/></g>

    <!-- Destination flagpole and pennant. -->
    <g transform="translate(804 260)">
      <ellipse cx="1" cy="0" rx="12" ry="2" fill="#78976c"/>
      <path d="M0 0v-53" stroke="#594d3d" stroke-width="3" stroke-linecap="round"/>
      <path d="M1-51c11-6 19 6 34 0l-8 10 7 7c-14 6-22-5-33-1z" fill="#c15e42"/>
      <path d="M1-51c7-3 14 0 14 0l-2 17c-4-2-8-2-12-1z" fill="#df7950"/>
      <circle cx="0" cy="-54" r="2.5" fill="#e9bf72"/>
    </g>
    <g data-bridge=""></g>

    <!-- A field-trip minibus parked on the approach to the bridge. -->
    <g data-bus="">
      <g transform="translate(140 272)">
        <ellipse cx="44" cy="0" rx="48" ry="3.2" fill="#4a6655" opacity=".35"/>
        <path fill="#344c46" d="M1-7v-13l7-13 4-10q2-5 10-5h38q7 0 11 6l9 15 15 5q4 2 4 7v8l-6 2H7z"/>
        <path fill="#e3a446" d="M3-9v-12l7-13 4-9q1-3 8-3h37q7 0 9 5l10 16 15 5q4 1 4 6v5l-4 2H7z"/>
        <path fill="#f4c568" d="m6-24 7-15q3-6 9-6h37q5 0 8 6l2 3H15l-4 13z"/>
        <path fill="#bc8039" d="M5-13h91v6H6z"/>
        <g fill="#3e6664" stroke="#57645a" stroke-width="1">
          <path d="m12-24 7-14h13v14z"/><path d="M36-38h13v14H36z"/>
          <path d="M53-38h8l7 14H53z"/><path d="m65-38 10 14h-4z"/>
        </g>
        <g fill="#a8c8b9"><path d="m16-27 5-10h8l-12 10zm23-9v9l8-9zm17 0v7l5-7z"/></g>
        <path d="M52-23v13m-17-12v13m34-13v12" fill="none" stroke="#bd8840" stroke-width="1.1"/>
        <path d="M6-20h42m26 0h12" stroke="#f9d99a" stroke-width="1.5"/>
        <path d="M4-8h6m79 1h9" stroke="#344c46" stroke-width="3" stroke-linecap="round"/>
        <path d="m91-19 4 1 1 3h-6z" fill="#fff3c8"/>
        <path d="M4-18h3v4H4z" fill="#bc5e43"/>
        <path d="M63-20h3m-18-27H24" stroke="#6d644e" stroke-width="1.8" stroke-linecap="round"/>
        <path d="M22-47v-4m25 4v-4m-30 0h36" stroke="#425751" fill="none" stroke-width="1.6" stroke-linecap="round"/>
        <rect x="22" y="-56" width="13" height="5" rx="1.4" fill="#789784"/>
        <rect x="36" y="-55" width="10" height="4" rx="1.2" fill="#a7774d"/>
        <g fill="#334d48">
          <circle cx="21" cy="-7" r="8.3"/><circle cx="79" cy="-7" r="8.3"/>
        </g>
        <g fill="#e2c28a">
          <circle cx="21" cy="-7" r="4"/><circle cx="79" cy="-7" r="4"/>
        </g>
        <g fill="#697465"><circle cx="21" cy="-7" r="1.6"/><circle cx="79" cy="-7" r="1.6"/></g>
      </g>
    </g>
    <rect width="920" height="450" fill="${ref('paper')}" pointer-events="none"/>`;
  }

  function bridgeSpans(total) {
    const width = (rightEdge - leftEdge) / total;
    return Array.from({length: total}, (_, i) => {
      const x = leftEdge + i * width;
      const end = x + width;
      const panels = Math.max(1, Math.round(width / 26));
      const panelWidth = width / panels;
      let braces = '';
      for (let j = 0; j < panels; j++) {
        const a = Math.round((x + j * panelWidth) * 100) / 100;
        braces += `M${a} 276l${panelWidth / 2} 13 ${panelWidth / 2} -13`;
      }
      return `<g data-span="" visibility="hidden">
        <rect x="${x}" y="272" width="${width + .35}" height="5" fill="#976640"/>
        <path d="${braces}" fill="none" stroke="#966644" stroke-width="3" stroke-linejoin="round"/>
        <path d="M${x} 289H${end}" stroke="#8b603e" stroke-width="3"/>
        <path d="M${x} 272H${end}" stroke="#efc580" stroke-width="3"/>
        <path d="M${x + 1} 271v-12H${end}v12" fill="none" stroke="#8b6946" stroke-width="2" stroke-linejoin="round"/>
      </g>`;
    }).join('');
  }

  function mount(container) {
    const svg = document.createElementNS(SVG_NS, 'svg');
    const id = 'bridge-scene-' + ++instance;
    svg.setAttribute('viewBox', '0 0 920 450');
    svg.setAttribute('preserveAspectRatio', 'xMidYMid meet');
    svg.setAttribute('aria-hidden', 'true');
    svg.setAttribute('focusable', 'false');
    svg.setAttribute('width', '100%');
    svg.setAttribute('height', '100%');
    svg.style.display = 'block';
    svg.innerHTML = sceneArt(id);
    container.replaceChildren(svg);

    const bridge = svg.querySelector('[data-bridge]');
    const bus = svg.querySelector('[data-bus]');
    const media = window.matchMedia?.('(prefers-reduced-motion: reduce)');
    const canAnimate = () => motion && !media?.matches;
    let motion = true;
    let lastTotal = 0;
    let progress = 0;

    function setProgress(done, total, animate = true) {
      total = Number.isFinite(total) ? Math.max(1, Math.floor(total)) : 1;
      done = Number.isFinite(done) ? Math.max(0, Math.min(total, Math.floor(done))) : 0;
      const changedTotal = total !== lastTotal;
      if (changedTotal) {
        bridge.innerHTML = bridgeSpans(total);
        lastTotal = total;
      }
      const animated = animate && canAnimate();
      const spans = bridge.children;
      for (let i = 0; i < spans.length; i++) {
        const visible = i < done;
        spans[i].setAttribute('visibility', visible ? 'visible' : 'hidden');
        if (visible && !changedTotal && i >= progress && animated && spans[i].animate) {
          spans[i].animate(
            [{opacity: 0, transform: 'translateY(-5px)'}, {opacity: 1, transform: 'translateY(0)'}],
            {duration: 280, easing: 'ease-out'}
          );
        }
      }
      bus.style.transition = animated && done === total && progress < done
        ? 'transform 2.1s cubic-bezier(.38,.03,.35,1) .25s' : 'none';
      bus.style.transform = done === total ? 'translateX(551px)' : 'translateX(0)';
      progress = done;
    }

    function setMotion(enabled) {
      motion = Boolean(enabled);
      if (!canAnimate()) {
        bus.style.transition = 'none';
        for (const span of bridge.children) {
          span.getAnimations?.().forEach(animation => animation.cancel());
        }
      }
    }

    setProgress(0, 10, false);
    return {setProgress, setMotion};
  }

  window.BridgeScene = {mount};
})();
