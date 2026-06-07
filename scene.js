/* ============================================================
   Martin & Company — converging infrastructure scene
   One vanishing point under the wordmark. Three corridors:
     LEFT   = cable-stayed BRIDGE   (structures)
     CENTRE = ROAD                  (roadways / civil)
     RIGHT  = RAILROAD              (transit / rail)
   Outer angles mirror exactly about the centre line.
   Draws into an <svg viewBox="0 0 1280 720"> with id="scene".
   Honours window.__glow (city-light toggle) + CSS custom props.
   ============================================================ */
(function () {
  const W = 1280, H = 720;
  const VP = { x: 640, y: 400 };
  const FLOOR = 720;
  if (window.__glow === undefined) window.__glow = true;

  const cs = (n) => getComputedStyle(document.documentElement).getPropertyValue(n).trim();
  const xAt = (bx, y) => { const t = (y - VP.y) / (FLOOR - VP.y); return VP.x + (bx - VP.x) * t; };
  const pt  = (bx, t) => ({ x: VP.x + (bx - VP.x) * t, y: VP.y + (FLOOR - VP.y) * t });

  const NS = "http://www.w3.org/2000/svg";
  const make = (tag, attrs) => { const el = document.createElementNS(NS, tag); for (const k in attrs) el.setAttribute(k, attrs[k]); return el; };
  const poly = (pts, attrs) => make("polygon", Object.assign({ points: pts.map(p => p.x + "," + p.y).join(" ") }, attrs));
  const line = (x1, y1, x2, y2, attrs) => make("line", Object.assign({ x1, y1, x2, y2 }, attrs));

  function build() {
    const svg = document.getElementById("scene");
    if (!svg) return;
    while (svg.firstChild) svg.removeChild(svg.firstChild);

    const GOLD = cs("--gold"), GOLDB = cs("--gold-bright");

    const defs = make("defs", {});
    defs.innerHTML = `
      <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="${cs('--sky-top')}"/>
        <stop offset="55%" stop-color="${cs('--sky-mid')}"/>
        <stop offset="100%" stop-color="${cs('--sky-low')}"/>
      </linearGradient>
      <linearGradient id="ground" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="${cs('--ground-far')}"/>
        <stop offset="100%" stop-color="${cs('--ground-near')}"/>
      </linearGradient>
      <radialGradient id="haze" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stop-color="${cs('--sky-low')}" stop-opacity="0.9"/>
        <stop offset="100%" stop-color="${cs('--sky-low')}" stop-opacity="0"/>
      </radialGradient>
      <radialGradient id="vpglow" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stop-color="${GOLDB}" stop-opacity="0.55"/>
        <stop offset="100%" stop-color="${GOLDB}" stop-opacity="0"/>
      </radialGradient>
      <linearGradient id="goldray" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="${GOLD}" stop-opacity="0.12"/>
        <stop offset="100%" stop-color="${GOLDB}" stop-opacity="0.95"/>
      </linearGradient>`;
    svg.appendChild(defs);

    // sky
    svg.appendChild(make("rect", { x: 0, y: 0, width: W, height: VP.y, fill: "url(#sky)" }));

    // skyline
    const sky = make("g", {});
    const buildings = [
      [388,70,132],[452,58,178],[520,84,150],[596,66,232],[640,54,286],
      [690,70,210],[760,90,168],[842,60,138],[905,74,116],[330,52,96],[958,56,104]
    ].sort((a,b)=>a[2]-b[2]);
    buildings.forEach(([cx,w,h]) => {
      const x = cx - w/2, top = VP.y - h;
      const g = make("g", {});
      g.appendChild(make("rect", { x, y: top, width: w, height: h, fill: cs('--building'), stroke: cs('--building-edge'), "stroke-width": 1 }));
      if (h > 220) g.appendChild(line(cx, top, cx, top - 22, { stroke: cs('--building-edge'), "stroke-width": 2 }));
      const cols = Math.max(2, Math.floor(w/18)), rows = Math.floor(h/24);
      const density = window.__glow ? 0.16 : 0;
      for (let r=0;r<rows;r++) for (let c=0;c<cols;c++) {
        if (Math.random() > density) continue;
        const wx = x + 7 + c*(w-12)/cols, wy = top + 12 + r*22;
        if (wy > VP.y - 8) continue;
        g.appendChild(make("rect", { x: wx, y: wy, width: 4, height: 6, fill: cs('--window'), opacity: 0.85 }));
      }
      sky.appendChild(g);
    });
    svg.appendChild(sky);

    svg.appendChild(make("ellipse", { cx: VP.x, cy: VP.y, rx: 520, ry: 70, fill: "url(#haze)" }));
    svg.appendChild(line(0, VP.y, W, VP.y, { stroke: cs('--building-edge'), "stroke-width": 1, opacity: 0.5 }));
    svg.appendChild(make("rect", { x: 0, y: VP.y, width: W, height: H - VP.y, fill: "url(#ground)" }));

    /* bottom anchors — symmetric about 640
       BRIDGE  L : outer 100  inner 440
       ROAD    C : 470 .. 810  (centre dash 640)
       RAIL    R : inner 840  outer 1180   (mirror of bridge)  */
    const brOut=140, brIn=440, brMid=(brOut+brIn)/2;   // bridge deck (left)
    const rdL=540, rdR=740;                             // road (centre)
    const railL=865, railR=1115, bedL=840, bedR=1140;   // railroad (right)

    // ===== CENTRE — ROAD =====
    (function () {
      const g = make("g", {});
      g.appendChild(poly([VP, pt(rdL,1), pt(rdR,1)], { fill: cs('--ground-near'), opacity: 0.94 }));
      g.appendChild(line(VP.x, VP.y, xAt(rdL,FLOOR), FLOOR, { stroke: "url(#goldray)", "stroke-width": 5 }));
      g.appendChild(line(VP.x, VP.y, xAt(rdR,FLOOR), FLOOR, { stroke: "url(#goldray)", "stroke-width": 5 }));
      for (let i=1;i<=9;i++){
        const t0=Math.pow(i/10,1.7), t1=Math.pow((i+0.45)/10,1.7);
        const a=pt(640,t0), b=pt(640,t1), wA=1+4.5*t0, wB=1+4.5*t1;
        g.appendChild(poly([{x:a.x-wA,y:a.y},{x:a.x+wA,y:a.y},{x:b.x+wB,y:b.y},{x:b.x-wB,y:b.y}], { fill: GOLDB, opacity: 0.9 }));
      }
      svg.appendChild(g);
    })();

    // ===== RIGHT — RAILROAD =====
    (function () {
      const g = make("g", {});
      g.appendChild(poly([VP, pt(bedL,1), pt(bedR,1)], { fill: cs('--ground-far'), opacity: 0.42 }));
      const N=17;
      for (let i=1;i<=N;i++){
        const t=Math.pow(i/N,1.9), y=VP.y+(FLOOR-VP.y)*t;
        const lx=xAt(railL,y), rx=xAt(railR,y);
        const over=20*t, th=1.4+5*t;     // overhang scales with perspective — ties narrow toward the vanishing point
        g.appendChild(make("rect", { x: lx-over, y: y-th/2, width:(rx-lx)+over*2, height:th, fill: cs('--rail-tie'), opacity:0.55 }));
      }
      g.appendChild(line(VP.x, VP.y, xAt(railL,FLOOR), FLOOR, { stroke:"url(#goldray)", "stroke-width":5 }));
      g.appendChild(line(VP.x, VP.y, xAt(railR,FLOOR), FLOOR, { stroke:"url(#goldray)", "stroke-width":5 }));
      svg.appendChild(g);
    })();

    // ===== LEFT — BRIDGE (straight cables, no towers) =====
    (function () {
      const g = make("g", {});
      // deck surface
      g.appendChild(poly([VP, pt(brIn,1), pt(brOut,1)], { fill: cs('--ground-far'), opacity: 0.5 }));
      // deck edge girders (gold)
      g.appendChild(line(VP.x, VP.y, xAt(brIn,FLOOR), FLOOR, { stroke:"url(#goldray)", "stroke-width":5 }));
      g.appendChild(line(VP.x, VP.y, xAt(brOut,FLOOR), FLOOR, { stroke:"url(#goldray)", "stroke-width":5 }));

      const tT = 0.60, tA = 0.93, Hpeak = 52;          // tower position, anchorage, peak height
      function clearance(t){
        if (t <= tT) return Hpeak * (t / tT);          // rise to the tower
        if (t <= tA) return Hpeak * (1 - (t - tT)/(tA - tT));   // fall back to the deck
        return 0;
      }
      function cableRun(E){
        const p0=pt(E,0), pT=pt(E,tT), pA=pt(E,tA);
        // main cable rises to the tower then returns to the deck at the anchorage (no cut-off)
        g.appendChild(make('polyline',{ points:
          p0.x.toFixed(1)+','+p0.y.toFixed(1)+' '+pT.x.toFixed(1)+','+(pT.y-Hpeak).toFixed(1)+' '+pA.x.toFixed(1)+','+pA.y.toFixed(1),
          fill:'none', stroke:GOLDB, "stroke-width":1.3, opacity:0.5 }));
        // vertical hangers
        for (let t=0.12;t<tA;t+=0.05){ const p=pt(E,t); const cy=p.y-clearance(t); if (p.y-cy<5) continue; g.appendChild(line(p.x,cy,p.x,p.y,{ stroke:GOLDB,"stroke-width":0.7,opacity:0.22 })); }
        // slender tower post at the peak (cable-coloured, not white)
        g.appendChild(line(pT.x, pT.y-Hpeak-3, pT.x, pT.y+9, { stroke:GOLDB,"stroke-width":1.6,"stroke-linecap":"round",opacity:0.5 }));
      }
      cableRun(brIn);
      cableRun(brOut);
      svg.appendChild(g);
    })();

    svg.appendChild(make("ellipse", { cx: VP.x, cy: VP.y, rx: 90, ry: 30, fill: "url(#vpglow)" }));
  }

  build();
  window.__buildScene = build;
})();
