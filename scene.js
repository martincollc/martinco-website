/* Martin & Company — animated hero scene
   Renders a stylized night skyline with rail tracks receding toward
   a vanishing point, drawn into the inline <svg id="scene"> element.
   Colors are pulled from the page's CSS custom properties so the scene
   always matches the site's palette. */

(function () {
  var svg = document.getElementById('scene');
  if (!svg) return;

  var NS = 'http://www.w3.org/2000/svg';
  var W = 1280, H = 720;
  var HORIZON = 430; // y-position of the horizon line

  function cssVar(name, fallback) {
    var v = getComputedStyle(document.documentElement).getPropertyValue(name);
    return (v && v.trim()) || fallback;
  }

  var colors = {
    skyTop: cssVar('--sky-top', '#0c1733'),
    skyMid: cssVar('--sky-mid', '#14224a'),
    skyLow: cssVar('--sky-low', '#1d3061'),
    groundNear: cssVar('--ground-near', '#0a1430'),
    groundFar: cssVar('--ground-far', '#16264f'),
    building: cssVar('--building', '#1f3061'),
    buildingEdge: cssVar('--building-edge', '#2c4079'),
    window: cssVar('--window', '#d9b65a'),
    railTie: cssVar('--rail-tie', '#b3c0dd'),
    gold: cssVar('--gold', '#c9a24b'),
    goldBright: cssVar('--gold-bright', '#e7cd83')
  };

  function el(tag, attrs) {
    var node = document.createElementNS(NS, tag);
    for (var k in attrs) {
      if (Object.prototype.hasOwnProperty.call(attrs, k)) {
        node.setAttribute(k, attrs[k]);
      }
    }
    return node;
  }

  function defs() {
    var d = el('defs', {});

    var sky = el('linearGradient', { id: 'scene-sky', x1: '0', y1: '0', x2: '0', y2: '1' });
    sky.appendChild(el('stop', { offset: '0%', 'stop-color': colors.skyTop }));
    sky.appendChild(el('stop', { offset: '55%', 'stop-color': colors.skyMid }));
    sky.appendChild(el('stop', { offset: '100%', 'stop-color': colors.skyLow }));
    d.appendChild(sky);

    var ground = el('linearGradient', { id: 'scene-ground', x1: '0', y1: '0', x2: '0', y2: '1' });
    ground.appendChild(el('stop', { offset: '0%', 'stop-color': colors.groundFar }));
    ground.appendChild(el('stop', { offset: '100%', 'stop-color': colors.groundNear }));
    d.appendChild(ground);

    var glow = el('radialGradient', { id: 'scene-glow', cx: '50%', cy: '38%', r: '55%' });
    glow.appendChild(el('stop', { offset: '0%', 'stop-color': colors.goldBright, 'stop-opacity': '0.16' }));
    glow.appendChild(el('stop', { offset: '100%', 'stop-color': colors.goldBright, 'stop-opacity': '0' }));
    d.appendChild(glow);

    return d;
  }

  function sky() {
    var g = el('g', {});
    g.appendChild(el('rect', { x: 0, y: 0, width: W, height: HORIZON + 40, fill: 'url(#scene-sky)' }));
    g.appendChild(el('rect', { x: 0, y: 0, width: W, height: HORIZON + 40, fill: 'url(#scene-glow)' }));

    // distant stars
    var rng = mulberry32(7);
    for (var i = 0; i < 70; i++) {
      var x = rng() * W;
      var y = rng() * (HORIZON - 60);
      var r = 0.6 + rng() * 1.3;
      var star = el('circle', {
        cx: x.toFixed(1), cy: y.toFixed(1), r: r.toFixed(2),
        fill: '#ffffff', opacity: (0.25 + rng() * 0.5).toFixed(2)
      });
      star.appendChild(el('animate', {
        attributeName: 'opacity',
        values: (0.15) + ';' + (0.7) + ';' + (0.15),
        dur: (3 + rng() * 4).toFixed(1) + 's',
        repeatCount: 'indefinite'
      }));
      g.appendChild(star);
    }
    return g;
  }

  function mulberry32(seed) {
    return function () {
      seed |= 0; seed = (seed + 0x6D2B79F5) | 0;
      var t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  function skyline() {
    var g = el('g', {});
    var rng = mulberry32(42);
    var n = 16;
    var bw = W / n;

    for (var i = 0; i < n; i++) {
      var bh = 60 + rng() * 190;
      var x = i * bw - 10;
      var w = bw * (0.62 + rng() * 0.3);
      var y = HORIZON - bh;

      g.appendChild(el('rect', {
        x: x.toFixed(1), y: y.toFixed(1), width: w.toFixed(1), height: (bh + 6).toFixed(1),
        fill: colors.building, stroke: colors.buildingEdge, 'stroke-width': '1'
      }));

      // lit windows grid
      var cols = Math.max(2, Math.round(w / 16));
      var rows = Math.max(2, Math.round(bh / 18));
      for (var c = 0; c < cols; c++) {
        for (var r = 0; r < rows; r++) {
          if (rng() > 0.62) continue;
          var wx = x + 6 + c * (w - 12) / cols;
          var wy = y + 8 + r * (bh - 16) / rows;
          var win = el('rect', {
            x: wx.toFixed(1), y: wy.toFixed(1), width: '3.4', height: '5',
            fill: colors.window, opacity: (0.35 + rng() * 0.5).toFixed(2)
          });
          win.appendChild(el('animate', {
            attributeName: 'opacity',
            values: (0.25) + ';' + (0.85) + ';' + (0.25),
            dur: (4 + rng() * 6).toFixed(1) + 's',
            begin: (rng() * 6).toFixed(1) + 's',
            repeatCount: 'indefinite'
          }));
          g.appendChild(win);
        }
      }
    }
    return g;
  }

  function ground() {
    var g = el('g', {});
    g.appendChild(el('rect', { x: 0, y: HORIZON, width: W, height: H - HORIZON, fill: 'url(#scene-ground)' }));
    // faint horizon glow line
    g.appendChild(el('rect', { x: 0, y: HORIZON - 1, width: W, height: 2, fill: colors.goldBright, opacity: '0.18' }));
    return g;
  }

  function corridor() {
    // Three corridors recede toward the same horizon line, but only the
    // railroad converges to the shared vanishing point. The transitway and
    // roadway run as their own parallel bands — holding their separation
    // from the rails all the way up — and simply fade into the horizon,
    // so the three never visually merge into one point.
    var g = el('g', { 'stroke-linecap': 'round' });
    var vanishX = W / 2;
    var vanishY = HORIZON; // corridors terminate right at the gold horizon line
    var baseY = H + 40;

    function laneY(t) {
      return vanishY + t * (baseY - vanishY);
    }
    function ease(t) { return Math.pow(t, 1.9); }
    // fades a band in gradually as it leaves the horizon, rather than
    // having it appear/disappear abruptly at the vanishing point
    function fade(t) { return Math.min(1, t / 0.16); }

    // Straight line from a far-field offset to a near-field offset —
    // used for bands that keep their own separation (parallel corridors).
    function bandX(farOffset, nearOffset, t) {
      return vanishX + farOffset + t * (nearOffset - farOffset);
    }
    function bandPath(farOffsetL, nearOffsetL, farOffsetR, nearOffsetR, riseAt) {
      var rise = riseAt || function () { return 0; };
      var farL = [bandX(farOffsetL, nearOffsetL, 0), laneY(0) - rise(0)];
      var farR = [bandX(farOffsetR, nearOffsetR, 0), laneY(0) - rise(0)];
      var nearR = [bandX(farOffsetR, nearOffsetR, 1), laneY(1) - rise(1)];
      var nearL = [bandX(farOffsetL, nearOffsetL, 1), laneY(1) - rise(1)];
      return 'M ' + farL.join(',') + ' L ' + farR.join(',') + ' L ' + nearR.join(',') + ' L ' + nearL.join(',') + ' Z';
    }

    /* ---------------- Railroad (center) — converges to the vanishing point ---------------- */
    var railSpread = 230;
    var railNearOffset = 9;

    function railPath(sign) {
      var x1 = vanishX + sign * railNearOffset;
      var x2 = vanishX + sign * railSpread;
      return 'M ' + x1.toFixed(1) + ' ' + vanishY + ' L ' + x2.toFixed(1) + ' ' + baseY;
    }
    [-1, 1].forEach(function (sign) {
      g.appendChild(el('path', { d: railPath(sign), stroke: colors.railTie, 'stroke-width': '2.4', fill: 'none', opacity: '0.55' }));
      g.appendChild(el('path', { d: railPath(sign), stroke: colors.goldBright, 'stroke-width': '1', fill: 'none', opacity: '0.35' }));
    });
    var tieCount = 22;
    for (var i = 0; i < tieCount; i++) {
      var t = i / (tieCount - 1);
      var e = ease(t);
      var y = vanishY + e * (baseY - vanishY);
      var spread = railNearOffset + e * (railSpread - railNearOffset);
      var tieW = spread * 2 * 1.18;
      var tieH = 2 + e * 5;
      var x = vanishX - tieW / 2;
      g.appendChild(el('rect', {
        x: x.toFixed(1), y: (y - tieH / 2).toFixed(1),
        width: tieW.toFixed(1), height: tieH.toFixed(1),
        fill: colors.railTie, opacity: (0.16 + e * 0.4).toFixed(2)
      }));
    }

    /* ---------------- Elevated transitway (left) — parallel band, own vanishing ---------------- */
    // Far-field (near horizon) edges sit well clear of the rail's far edge (-9),
    // and near-field edges keep the same separation at the bottom — the band
    // never narrows down into the rail's vanishing point.
    var twFarL = -150, twNearL = -480;   // outer edge
    var twFarR = -85, twNearR = -345;    // inner edge (rail-facing)
    var twRiseNear = 92;
    var twGirderDepth = 17; // thickness of the structural girder beneath the deck — sells the "elevated" read
    function twRise(t) { return twRiseNear * ease(t); }
    function twGirderRise(t) { return Math.max(0, twRise(t) - twGirderDepth * Math.max(ease(t), 0.22)); }
    function twCenterX(t) { return (bandX(twFarL, twNearL, t) + bandX(twFarR, twNearR, t)) / 2; }

    // ground shadow the structure casts straight below it — without this cue
    // the deck reads as flat scenery rather than something hovering above grade
    g.appendChild(el('path', {
      d: bandPath(twFarL, twNearL, twFarR, twNearR, function () { return 0; }),
      fill: colors.groundNear, opacity: '0.4'
    }));

    var pierCount = 9;
    for (var p = 1; p < pierCount; p++) {
      var pt = p / (pierCount - 1);
      var pe = ease(pt);
      var cx = twCenterX(pe);
      var deckY = laneY(pe) - twRise(pe);
      var groundYp = laneY(pe);
      var pw = 1.4 + pe * 5;
      g.appendChild(el('line', {
        x1: cx.toFixed(1), y1: (deckY + 2).toFixed(1),
        x2: cx.toFixed(1), y2: groundYp.toFixed(1),
        stroke: colors.buildingEdge, 'stroke-width': pw.toFixed(1), opacity: ((0.22 + pe * 0.4) * fade(pe)).toFixed(2)
      }));
    }
    // structural girder band — sits just beneath the deck slab and peeks out
    // along its lower edge, giving the deck visible depth/thickness in profile
    g.appendChild(el('path', {
      d: bandPath(twFarL, twNearL, twFarR, twNearR, twGirderRise),
      fill: colors.buildingEdge, opacity: '0.7'
    }));
    g.appendChild(el('path', {
      d: bandPath(twFarL, twNearL, twFarR, twNearR, twRise),
      fill: colors.building, stroke: colors.buildingEdge, 'stroke-width': '1', opacity: '0.85'
    }));
    // gold edge-light strip along the inner (rail-facing) edge of the deck
    var twEdgeFarPt = [bandX(twFarR, twNearR, 0), laneY(0) - twRise(0)];
    var twEdgeNearPt = [bandX(twFarR, twNearR, 1), laneY(1) - twRise(1)];
    g.appendChild(el('path', {
      d: 'M ' + twEdgeFarPt[0].toFixed(1) + ',' + twEdgeFarPt[1].toFixed(1) + ' L ' + twEdgeNearPt[0].toFixed(1) + ',' + twEdgeNearPt[1].toFixed(1),
      stroke: colors.goldBright, 'stroke-width': '1.4', fill: 'none', opacity: '0.4'
    }));
    var lightCount = 8;
    for (var l = 1; l < lightCount; l++) {
      var lt = l / (lightCount - 1);
      var le = ease(lt);
      var lx = twCenterX(le);
      var ly = laneY(le) - twRise(le) - (3 + le * 4);
      var lr = 0.9 + le * 1.6;
      var dot = el('circle', { cx: lx.toFixed(1), cy: ly.toFixed(1), r: lr.toFixed(2), fill: colors.window, opacity: ((0.3 + le * 0.45) * fade(le)).toFixed(2) });
      dot.appendChild(el('animate', {
        attributeName: 'opacity',
        values: '0;' + (0.7 * fade(le)).toFixed(2) + ';0',
        dur: (3 + le * 3).toFixed(1) + 's',
        begin: (le * 2).toFixed(1) + 's',
        repeatCount: 'indefinite'
      }));
      g.appendChild(dot);
    }

    // a pair of small guideway rails running lengthwise down the deck —
    // simple receding lines that read as a track bed without fighting the
    // deck's own diagonal angle the way cross-ties did
    var twGaugeFrac = 0.46; // how much of the deck's width the two rails span
    function twDeckHalfWidth(t) { return (bandX(twFarR, twNearR, t) - bandX(twFarL, twNearL, t)) / 2; }
    function twRailX(side, t) { return twCenterX(t) + side * twDeckHalfWidth(t) * twGaugeFrac; }
    function twRailY(t) { return laneY(t) - twRise(t) - 1; }

    [-1, 1].forEach(function (side) {
      g.appendChild(el('path', {
        d: 'M ' + twRailX(side, 0).toFixed(1) + ',' + twRailY(0).toFixed(1) + ' L ' + twRailX(side, 1).toFixed(1) + ',' + twRailY(1).toFixed(1),
        stroke: colors.railTie, 'stroke-width': '1.2', fill: 'none', opacity: '0.4'
      }));
    });
    // cross-ties spanning the gauge between the two guideway rails — spaced
    // by eased t so they compress toward the horizon just like the main line's
    var twTieCount = 16;
    for (var tw = 1; tw < twTieCount; tw++) {
      var twt = tw / twTieCount;
      var twe = ease(twt);
      g.appendChild(el('line', {
        x1: twRailX(-1, twt).toFixed(1), y1: twRailY(twt).toFixed(1),
        x2: twRailX(1, twt).toFixed(1), y2: twRailY(twt).toFixed(1),
        stroke: colors.railTie, 'stroke-width': (0.8 + twe * 2.2).toFixed(1),
        opacity: ((0.14 + twe * 0.34) * fade(twe)).toFixed(2)
      }));
    }

    /* ---------------- Roadway (right) — a mirror image of the transitway's angle ---------------- */
    // Exactly the transitway's far/near offsets, sign-flipped. Same angles,
    // same widening, same clearance from the rail — just reflected onto the
    // other side, so the two corridors read as matching counterparts of the
    // railroad rather than two differently-shaped, unrelated bands.
    var rdFarL = -twFarR, rdNearL = -twNearR;   // inner edge (rail-facing) — mirrors the transitway's inner edge
    var rdFarR = -twFarL, rdNearR = -twNearL;   // outer edge — mirrors the transitway's outer edge
    g.appendChild(el('path', {
      d: bandPath(rdFarL, rdNearL, rdFarR, rdNearR, function () { return 0; }),
      fill: colors.groundFar, opacity: '0.4'
    }));
    [[rdFarL, rdNearL], [rdFarR, rdNearR]].forEach(function (pair) {
      g.appendChild(el('path', {
        d: 'M ' + bandX(pair[0], pair[1], 0).toFixed(1) + ',' + laneY(0).toFixed(1) + ' L ' + bandX(pair[0], pair[1], 1).toFixed(1) + ',' + laneY(1).toFixed(1),
        stroke: colors.railTie, 'stroke-width': '1.2', fill: 'none', opacity: '0.3'
      }));
    });
    var dashCount = 16;
    for (var d2 = 1; d2 < dashCount; d2++) {
      var dt0 = (d2 - 0.32) / dashCount;
      var dt1 = (d2 + 0.32) / dashCount;
      var de0 = ease(dt0), de1 = ease(dt1);
      var x0 = bandX((rdFarL + rdFarR) / 2, (rdNearL + rdNearR) / 2, de0), y0 = laneY(de0);
      var x1 = bandX((rdFarL + rdFarR) / 2, (rdNearL + rdNearR) / 2, de1), y1 = laneY(de1);
      g.appendChild(el('line', {
        x1: x0.toFixed(1), y1: y0.toFixed(1), x2: x1.toFixed(1), y2: y1.toFixed(1),
        stroke: colors.goldBright, 'stroke-width': (0.8 + de1 * 2.2).toFixed(1), opacity: ((0.18 + de1 * 0.35) * fade(de1)).toFixed(2)
      }));
    }
    // a pair of headlight glows traveling down the roadway
    [0, 3.4].forEach(function (delay) {
      var hl = el('circle', { r: '2.6', fill: colors.window, opacity: '0' });
      var cFar = (rdFarL + rdFarR) / 2 + 8;
      var cNear = (rdNearL + rdNearR) / 2 + 8;
      hl.appendChild(el('animate', { attributeName: 'cx', values: bandX(cFar, cNear, 0).toFixed(1) + ';' + bandX(cFar, cNear, 1).toFixed(1), dur: '7s', begin: delay + 's', repeatCount: 'indefinite' }));
      hl.appendChild(el('animate', { attributeName: 'cy', values: laneY(0).toFixed(1) + ';' + laneY(1).toFixed(1), dur: '7s', begin: delay + 's', repeatCount: 'indefinite' }));
      hl.appendChild(el('animate', { attributeName: 'opacity', values: '0;0.75;0', dur: '7s', begin: delay + 's', repeatCount: 'indefinite' }));
      hl.appendChild(el('animate', { attributeName: 'r', values: '1.2;4.6', dur: '7s', begin: delay + 's', repeatCount: 'indefinite' }));
      g.appendChild(hl);
    });

    /* ---------------- Rail signal glow (center) ---------------- */
    var glowDot = el('circle', { r: '3.4', fill: colors.goldBright, opacity: '0' });
    glowDot.appendChild(el('animate', { attributeName: 'cx', values: vanishX + ';' + vanishX, dur: '7s', repeatCount: 'indefinite' }));
    glowDot.appendChild(el('animate', { attributeName: 'cy', values: (vanishY + 2) + ';' + (baseY - 30), dur: '7s', repeatCount: 'indefinite' }));
    glowDot.appendChild(el('animate', { attributeName: 'opacity', values: '0;0.8;0', dur: '7s', repeatCount: 'indefinite' }));
    glowDot.appendChild(el('animate', { attributeName: 'r', values: '1.4;5.5', dur: '7s', repeatCount: 'indefinite' }));
    g.appendChild(glowDot);

    return g;
  }

  function build() {
    while (svg.firstChild) svg.removeChild(svg.firstChild);
    svg.setAttribute('viewBox', '0 0 ' + W + ' ' + H);
    svg.appendChild(defs());
    svg.appendChild(sky());
    svg.appendChild(skyline());
    svg.appendChild(ground());
    svg.appendChild(corridor());
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', build);
  } else {
    build();
  }
})();
