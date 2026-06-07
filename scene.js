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

  function railTrack() {
    var g = el('g', { 'stroke-linecap': 'round' });
    var vanishX = W / 2;
    var vanishY = HORIZON - 6;
    var baseY = H + 40;
    var railSpread = 250;   // half-distance between rails at the bottom
    var railNearOffset = 9; // half-distance between rails near the vanishing point

    function railPath(sign) {
      var x1 = vanishX + sign * railNearOffset;
      var x2 = vanishX + sign * railSpread;
      return 'M ' + x1.toFixed(1) + ' ' + vanishY + ' L ' + x2.toFixed(1) + ' ' + baseY;
    }

    // rails (long, faded at the ends)
    [-1, 1].forEach(function (sign) {
      g.appendChild(el('path', {
        d: railPath(sign),
        stroke: colors.railTie,
        'stroke-width': '2.4',
        fill: 'none',
        opacity: '0.55'
      }));
      g.appendChild(el('path', {
        d: railPath(sign),
        stroke: colors.goldBright,
        'stroke-width': '1',
        fill: 'none',
        opacity: '0.35'
      }));
    });

    // rail ties (perspective-spaced)
    var tieCount = 22;
    for (var i = 0; i < tieCount; i++) {
      var t = i / (tieCount - 1);          // 0 = far, 1 = near
      var ease = Math.pow(t, 1.9);
      var y = vanishY + ease * (baseY - vanishY);
      var spread = railNearOffset + ease * (railSpread - railNearOffset);
      var tieW = spread * 2 * 1.18;
      var tieH = 2 + ease * 5;
      var x = vanishX - tieW / 2;
      var tie = el('rect', {
        x: x.toFixed(1), y: (y - tieH / 2).toFixed(1),
        width: tieW.toFixed(1), height: tieH.toFixed(1),
        fill: colors.railTie,
        opacity: (0.16 + ease * 0.4).toFixed(2)
      });
      g.appendChild(tie);
    }

    // a subtle traveling glow along the rails (like a signal or train light)
    var glowDot = el('circle', {
      r: '3.4', fill: colors.goldBright, opacity: '0'
    });
    var animY = el('animate', {
      attributeName: 'cy',
      values: (vanishY + 2) + ';' + (baseY - 30),
      dur: '7s',
      repeatCount: 'indefinite'
    });
    var animX = el('animate', {
      attributeName: 'cx',
      values: vanishX + ';' + vanishX,
      dur: '7s',
      repeatCount: 'indefinite'
    });
    var animOp = el('animate', {
      attributeName: 'opacity',
      values: '0;0.8;0',
      dur: '7s',
      repeatCount: 'indefinite'
    });
    var animR = el('animate', {
      attributeName: 'r',
      values: '1.4;5.5',
      dur: '7s',
      repeatCount: 'indefinite'
    });
    glowDot.appendChild(animX);
    glowDot.appendChild(animY);
    glowDot.appendChild(animOp);
    glowDot.appendChild(animR);
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
    svg.appendChild(railTrack());
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', build);
  } else {
    build();
  }
})();
