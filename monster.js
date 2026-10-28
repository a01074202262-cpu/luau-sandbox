/**
 * monster.js — D&D 스타일 몬스터 외형 (Three.js 프로시저럴)
 * 사용법:
 *   <script src="/monster.js"></script>  // game.html / index.html 에서 box, THREE 로드 이후
 *   내부에서 window.BLD 에 모델을 등록한다.
 *
 * 서버(server.js)는 스탯만 담당. 3D 모델은 클라이언트 전용.
 */
(function (global) {
  'use strict';
  if (typeof THREE === 'undefined') {
    console.warn('[monster.js] THREE 가 없습니다. game.html 에서 three.js 뒤에 로드하세요.');
    return;
  }

  // game.html 의 box / GC / MC / M 이 있으면 재사용, 없으면 로컬 폴백
  const GC = global.GC || (global.GC = {});
  const MC = global.MC || (global.MC = {});
  function M(c) {
    if (typeof global.M === 'function') return global.M(c);
    return new THREE.MeshLambertMaterial({ color: c });
  }
  function box(w, h, d, c, x, y, z) {
    if (typeof global.box === 'function') return global.box(w, h, d, c, x || 0, y || 0, z || 0);
    const k = w + '_' + h + '_' + d;
    const m = new THREE.Mesh(GC[k] || (GC[k] = new THREE.BoxGeometry(w, h, d)), MC[c] || (MC[c] = M(c)));
    m.position.set(x || 0, y || 0, z || 0);
    return m;
  }
  function cyl(rTop, rBot, h, c, x, y, z, seg) {
    const geo = new THREE.CylinderGeometry(rTop, rBot, h, seg || 8);
    const m = new THREE.Mesh(geo, MC[c] || (MC[c] = M(c)));
    m.position.set(x || 0, y || 0, z || 0);
    return m;
  }
  function sph(r, c, x, y, z, seg) {
    const m = new THREE.Mesh(new THREE.SphereGeometry(r, seg || 10, seg || 8), MC[c] || (MC[c] = M(c)));
    m.position.set(x || 0, y || 0, z || 0);
    return m;
  }
  function cone(r, h, c, x, y, z) {
    const m = new THREE.Mesh(new THREE.ConeGeometry(r, h, 8), MC[c] || (MC[c] = M(c)));
    m.position.set(x || 0, y || 0, z || 0);
    return m;
  }

  /** 엔티티에 그룹 부착 헬퍼 */
  function finish(e, g, hy, sc) {
    if (sc && sc !== 1) g.scale.setScalar(sc);
    e.g = g;
    e.hy = hy || 2.5;
    return e;
  }

  // ============================================================
  // 정확히 매칭되는 D&D 스타일 모델 (dnd_models 참조)
  // ============================================================
  const MODELS = {};

  // --- wolf / frostwolf / wolfalpha / shadowwolf ---
  MODELS.wolf = function (e, d, tint) {
    const c = tint || 0x6b6b6b, c2 = 0x4a4a4a, eye = 0xffcc33;
    const g = new THREE.Group();
    g.add(box(0.9, 0.7, 1.6, c, 0, 0.95, 0));           // torso
    g.add(box(0.7, 0.55, 0.7, c, 0, 1.15, 1.05));        // neck/head base
    g.add(box(0.55, 0.45, 0.7, c2, 0, 1.2, 1.45));       // snout
    g.add(box(0.18, 0.12, 0.25, 0x222222, 0, 1.05, 1.75)); // nose
    g.add(box(0.22, 0.22, 0.08, eye, -0.22, 1.35, 1.35));
    g.add(box(0.22, 0.22, 0.08, eye, 0.22, 1.35, 1.35));
    g.add(box(0.15, 0.25, 0.1, c, -0.28, 1.55, 1.15));   // ears
    g.add(box(0.15, 0.25, 0.1, c, 0.28, 1.55, 1.15));
    g.add(box(0.35, 0.35, 0.9, c, 0, 1.0, -1.1));        // tail base
    g.add(box(0.25, 0.25, 0.5, c2, 0, 1.15, -1.6));
    const legs = [[-0.35, 0.55], [0.35, 0.55], [-0.35, -0.55], [0.35, -0.55]];
    e.lg = legs.map(([x, z]) => {
      const p = new THREE.Group();
      p.position.set(x, 0.55, z);
      p.add(box(0.28, 0.55, 0.28, c, 0, -0.28, 0));
      p.add(box(0.3, 0.12, 0.35, c2, 0, -0.58, 0.05));
      g.add(p);
      return p;
    });
    return finish(e, g, 2.0, d && d.sc);
  };
  MODELS.frostwolf = (e, d) => MODELS.wolf(e, d, 0xb0c4de);
  MODELS.wolfalpha = (e, d) => MODELS.wolf(e, d, 0x3a3a3a);
  MODELS.shadowwolf = (e, d) => MODELS.wolf(e, d, 0x1a1a22);

  // --- boar ---
  MODELS.boar = function (e, d) {
    const c = 0x5c4033, c2 = 0x3d2b1f;
    const g = new THREE.Group();
    g.add(box(1.1, 0.9, 1.5, c, 0, 0.85, 0));
    g.add(box(0.7, 0.6, 0.7, c, 0, 1.0, 0.95));
    g.add(box(0.5, 0.35, 0.45, c2, 0, 0.85, 1.35));
    g.add(box(0.08, 0.08, 0.35, 0xeeeeee, -0.22, 0.95, 1.55)); // tusks
    g.add(box(0.08, 0.08, 0.35, 0xeeeeee, 0.22, 0.95, 1.55));
    g.add(box(0.15, 0.2, 0.1, c, -0.3, 1.35, 0.9));
    g.add(box(0.15, 0.2, 0.1, c, 0.3, 1.35, 0.9));
    g.add(box(0.12, 0.12, 0.06, 0x111111, -0.18, 1.1, 1.25));
    g.add(box(0.12, 0.12, 0.06, 0x111111, 0.18, 1.1, 1.25));
    e.lg = [[-0.4, 0.45], [0.4, 0.45], [-0.4, -0.5], [0.4, -0.5]].map(([x, z]) => {
      const p = new THREE.Group();
      p.position.set(x, 0.45, z);
      p.add(box(0.28, 0.5, 0.28, c2, 0, -0.25, 0));
      g.add(p);
      return p;
    });
    return finish(e, g, 1.9, d && d.sc);
  };

  // --- spider ---
  MODELS.spider = function (e, d) {
    const c = 0x2a1a12, c2 = 0x4a3020, eye = 0xff2222;
    const g = new THREE.Group();
    g.add(sph(0.55, c, 0, 0.7, 0, 10));
    g.add(sph(0.4, c2, 0, 0.75, 0.55, 8));
    for (let i = 0; i < 4; i++) {
      const a = (i - 1.5) * 0.25;
      g.add(box(0.1, 0.1, 0.08, eye, a, 0.95, 0.85));
    }
    e.lg = [];
    for (let side = -1; side <= 1; side += 2) {
      for (let i = 0; i < 4; i++) {
        const p = new THREE.Group();
        const z = -0.45 + i * 0.3;
        p.position.set(side * 0.4, 0.55, z);
        const leg = box(0.1, 0.15, 0.9, c, side * 0.35, 0, 0);
        leg.rotation.z = side * 0.5;
        p.add(leg);
        p.add(box(0.08, 0.08, 0.5, c2, side * 0.7, -0.25, 0.1));
        g.add(p);
        e.lg.push(p);
      }
    }
    return finish(e, g, 1.6, d && d.sc);
  };

  // --- orc ---
  MODELS.orc = function (e, d) {
    const skin = 0x4a7a3a, shirt = 0x3a2a1a, pants = 0x2a2a2a;
    const g = new THREE.Group();
    g.add(box(1.15, 1.35, 0.6, shirt, 0, 1.7, 0));
    g.add(box(0.95, 0.95, 0.95, skin, 0, 2.85, 0));
    g.add(box(0.14, 0.14, 0.06, 0x111111, -0.22, 2.95, 0.48));
    g.add(box(0.14, 0.14, 0.06, 0x111111, 0.22, 2.95, 0.48));
    g.add(box(0.12, 0.35, 0.1, 0xeeeeee, -0.35, 2.55, 0.35)); // tusk
    g.add(box(0.12, 0.35, 0.1, 0xeeeeee, 0.35, 2.55, 0.35));
    g.add(box(0.5, 0.15, 0.15, 0x222222, 0, 2.55, 0.45)); // mouth
    // arms
    const armL = new THREE.Group(); armL.position.set(-0.75, 2.2, 0);
    armL.add(box(0.35, 1.15, 0.4, skin, 0, -0.5, 0));
    g.add(armL);
    const armR = new THREE.Group(); armR.position.set(0.75, 2.2, 0);
    armR.add(box(0.35, 1.15, 0.4, skin, 0, -0.5, 0));
    // axe
    armR.add(box(0.12, 1.3, 0.12, 0x6b4423, 0, -1.4, 0));
    armR.add(box(0.55, 0.4, 0.08, 0x888888, 0.15, -2.0, 0));
    g.add(armR);
    const legL = new THREE.Group(); legL.position.set(-0.3, 1.05, 0);
    legL.add(box(0.42, 1.05, 0.45, pants, 0, -0.5, 0));
    g.add(legL);
    const legR = new THREE.Group(); legR.position.set(0.3, 1.05, 0);
    legR.add(box(0.42, 1.05, 0.45, pants, 0, -0.5, 0));
    g.add(legR);
    e.c = { g, armL, armR, legL, legR };
    return finish(e, g, 3.6, d && d.sc);
  };

  // --- skeleton ---
  MODELS.skeleton = function (e, d) {
    const b = 0xe8e0d0, dark = 0xccccbb;
    const g = new THREE.Group();
    g.add(box(0.85, 1.1, 0.4, b, 0, 1.7, 0)); // ribs
    g.add(box(0.15, 1.0, 0.15, b, 0, 1.7, -0.05)); // spine
    g.add(box(0.7, 0.7, 0.7, b, 0, 2.7, 0)); // skull
    g.add(box(0.18, 0.2, 0.08, 0x111111, -0.18, 2.8, 0.36));
    g.add(box(0.18, 0.2, 0.08, 0x111111, 0.18, 2.8, 0.36));
    g.add(box(0.25, 0.12, 0.1, 0x222222, 0, 2.5, 0.35));
    const armL = new THREE.Group(); armL.position.set(-0.6, 2.15, 0);
    armL.add(box(0.2, 1.0, 0.2, b, 0, -0.45, 0));
    g.add(armL);
    const armR = new THREE.Group(); armR.position.set(0.6, 2.15, 0);
    armR.add(box(0.2, 1.0, 0.2, b, 0, -0.45, 0));
    armR.add(box(0.1, 1.2, 0.1, 0x888888, 0, -1.3, 0)); // sword
    armR.add(box(0.35, 0.12, 0.08, 0x666666, 0, -0.65, 0));
    g.add(armR);
    const legL = new THREE.Group(); legL.position.set(-0.22, 1.1, 0);
    legL.add(box(0.22, 1.05, 0.22, b, 0, -0.5, 0));
    g.add(legL);
    const legR = new THREE.Group(); legR.position.set(0.22, 1.1, 0);
    legR.add(box(0.22, 1.05, 0.22, b, 0, -0.5, 0));
    g.add(legR);
    e.c = { g, armL, armR, legL, legR };
    return finish(e, g, 3.4, d && d.sc);
  };

  // --- ghost ---
  MODELS.ghost = function (e, d) {
    const g = new THREE.Group();
    const body = box(1.15, 1.8, 0.9, 0xdfe9ff, 0, 1.5, 0);
    body.material = body.material.clone();
    body.material.transparent = true;
    body.material.opacity = 0.55;
    g.add(body);
    const armL = box(0.28, 1.2, 0.28, 0xdfe9ff, -0.85, 1.5, 0);
    armL.material = body.material;
    const armR = box(0.28, 1.2, 0.28, 0xdfe9ff, 0.85, 1.5, 0);
    armR.material = body.material;
    g.add(armL, armR);
    g.add(box(0.22, 0.32, 0.1, 0x222244, -0.25, 2.0, 0.48));
    g.add(box(0.22, 0.32, 0.1, 0x222244, 0.25, 2.0, 0.48));
    g.add(box(0.4, 0.15, 0.1, 0x222244, 0, 1.55, 0.48));
    // trailing wisps
    for (let i = 0; i < 3; i++) {
      const w = box(0.3 - i * 0.05, 0.5, 0.3, 0xc8d8f0, (i - 1) * 0.35, 0.3, -0.4 - i * 0.15);
      w.material = body.material;
      g.add(w);
    }
    return finish(e, g, 3.2, d && d.sc);
  };

  // --- zombie ---
  MODELS.zombie = function (e, d) {
    const skin = 0x7a9a6a, shirt = 0x4a3a2a, pants = 0x3a3a2a;
    const g = new THREE.Group();
    g.add(box(1.05, 1.25, 0.55, shirt, 0, 1.65, 0));
    g.add(box(0.9, 0.9, 0.9, skin, 0, 2.75, 0));
    g.add(box(0.14, 0.1, 0.06, 0x88aa44, -0.2, 2.85, 0.46)); // dead eyes
    g.add(box(0.14, 0.1, 0.06, 0x88aa44, 0.2, 2.85, 0.46));
    g.add(box(0.35, 0.2, 0.12, 0x553333, 0, 2.5, 0.45)); // mouth
    g.add(box(0.2, 0.15, 0.1, skin, 0.4, 2.55, 0.3)); // torn cheek
    const armL = new THREE.Group(); armL.position.set(-0.7, 2.15, 0);
    armL.add(box(0.32, 1.1, 0.35, skin, 0, -0.5, 0));
    armL.rotation.x = -0.6; // forward reach
    g.add(armL);
    const armR = new THREE.Group(); armR.position.set(0.7, 2.15, 0);
    armR.add(box(0.32, 1.1, 0.35, skin, 0, -0.5, 0));
    armR.rotation.x = -0.5;
    g.add(armR);
    const legL = new THREE.Group(); legL.position.set(-0.28, 1.05, 0);
    legL.add(box(0.4, 1.0, 0.42, pants, 0, -0.5, 0));
    g.add(legL);
    const legR = new THREE.Group(); legR.position.set(0.28, 1.05, 0);
    legR.add(box(0.4, 1.0, 0.42, pants, 0, -0.5, 0));
    g.add(legR);
    e.c = { g, armL, armR, legL, legR };
    return finish(e, g, 3.5, d && d.sc);
  };

  // --- imp / fireimp ---
  MODELS.imp = function (e, d, tint) {
    const skin = tint || 0xb03030, wing = 0x4a1010;
    const g = new THREE.Group();
    g.add(box(0.7, 0.8, 0.45, skin, 0, 1.1, 0));
    g.add(box(0.6, 0.6, 0.6, skin, 0, 1.85, 0));
    g.add(box(0.12, 0.12, 0.06, 0xffee00, -0.15, 1.95, 0.32));
    g.add(box(0.12, 0.12, 0.06, 0xffee00, 0.15, 1.95, 0.32));
    g.add(cone(0.12, 0.35, skin, -0.22, 2.3, 0));
    g.add(cone(0.12, 0.35, skin, 0.22, 2.3, 0));
    // wings
    const wl = box(0.08, 0.7, 0.9, wing, -0.55, 1.4, -0.15);
    wl.rotation.z = 0.4;
    const wr = box(0.08, 0.7, 0.9, wing, 0.55, 1.4, -0.15);
    wr.rotation.z = -0.4;
    g.add(wl, wr);
    e.wl = wl; e.wr = wr;
    // legs + tail
    g.add(box(0.2, 0.5, 0.2, skin, -0.2, 0.4, 0));
    g.add(box(0.2, 0.5, 0.2, skin, 0.2, 0.4, 0));
    g.add(box(0.12, 0.12, 0.7, skin, 0, 0.9, -0.55));
    g.add(cone(0.1, 0.25, 0xff4400, 0, 0.9, -0.95));
    return finish(e, g, 2.5, d && d.sc);
  };
  MODELS.fireimp = (e, d) => MODELS.imp(e, d, 0xff5522);

  // --- hellhound ---
  MODELS.hellhound = function (e, d) {
    const c = 0x2a1510, c2 = 0x4a2010, fire = 0xff4400;
    const g = new THREE.Group();
    g.add(box(1.0, 0.8, 1.7, c, 0, 1.0, 0));
    g.add(box(0.75, 0.6, 0.75, c, 0, 1.2, 1.1));
    g.add(box(0.55, 0.4, 0.6, c2, 0, 1.15, 1.5));
    g.add(box(0.2, 0.2, 0.08, fire, -0.22, 1.4, 1.4));
    g.add(box(0.2, 0.2, 0.08, fire, 0.22, 1.4, 1.4));
    g.add(box(0.18, 0.3, 0.12, c, -0.3, 1.6, 1.15));
    g.add(box(0.18, 0.3, 0.12, c, 0.3, 1.6, 1.15));
    // fire mane
    for (let i = 0; i < 5; i++) {
      g.add(cone(0.12, 0.4 + Math.random() * 0.2, fire, -0.3 + i * 0.15, 1.55, -0.2 + i * 0.1));
    }
    g.add(box(0.3, 0.3, 0.8, c, 0, 1.05, -1.15));
    e.lg = [[-0.38, 0.55], [0.38, 0.55], [-0.38, -0.55], [0.38, -0.55]].map(([x, z]) => {
      const p = new THREE.Group();
      p.position.set(x, 0.55, z);
      p.add(box(0.3, 0.55, 0.3, c, 0, -0.28, 0));
      p.add(box(0.12, 0.15, 0.12, fire, 0, -0.6, 0.1));
      g.add(p);
      return p;
    });
    return finish(e, g, 2.2, d && d.sc);
  };

  // --- hobgoblin ---
  MODELS.hobgoblin = function (e, d) {
    const skin = 0xb85a3a, armor = 0x5a5a6a, pants = 0x3a2a1a;
    const g = new THREE.Group();
    g.add(box(1.2, 1.4, 0.65, armor, 0, 1.75, 0));
    g.add(box(0.95, 0.95, 0.95, skin, 0, 2.9, 0));
    g.add(box(0.14, 0.14, 0.06, 0x111111, -0.22, 3.0, 0.48));
    g.add(box(0.14, 0.14, 0.06, 0x111111, 0.22, 3.0, 0.48));
    g.add(box(1.05, 0.25, 1.05, 0x4a4a55, 0, 3.4, 0)); // helmet
    g.add(box(0.9, 0.15, 0.2, 0x333340, 0, 3.05, 0.5)); // visor
    const armL = new THREE.Group(); armL.position.set(-0.8, 2.3, 0);
    armL.add(box(0.38, 1.15, 0.4, skin, 0, -0.5, 0));
    g.add(armL);
    const armR = new THREE.Group(); armR.position.set(0.8, 2.3, 0);
    armR.add(box(0.38, 1.15, 0.4, skin, 0, -0.5, 0));
    armR.add(box(0.14, 1.4, 0.14, 0x888899, 0, -1.5, 0)); // spear
    armR.add(cone(0.12, 0.35, 0xaaaaaa, 0, -2.3, 0));
    g.add(armR);
    const legL = new THREE.Group(); legL.position.set(-0.32, 1.05, 0);
    legL.add(box(0.42, 1.05, 0.45, pants, 0, -0.5, 0));
    g.add(legL);
    const legR = new THREE.Group(); legR.position.set(0.32, 1.05, 0);
    legR.add(box(0.42, 1.05, 0.45, pants, 0, -0.5, 0));
    g.add(legR);
    e.c = { g, armL, armR, legL, legR };
    return finish(e, g, 3.7, d && d.sc);
  };

  // --- mummy ---
  MODELS.mummy = function (e, d) {
    const wrap = 0xd4c4a0, dark = 0xb0a080;
    const g = new THREE.Group();
    g.add(box(1.0, 1.5, 0.55, wrap, 0, 1.7, 0));
    g.add(box(0.85, 0.85, 0.85, wrap, 0, 2.85, 0));
    g.add(box(0.16, 0.12, 0.06, 0x331111, -0.2, 2.95, 0.44));
    g.add(box(0.16, 0.12, 0.06, 0x331111, 0.2, 2.95, 0.44));
    // bandage strips
    for (let i = 0; i < 4; i++) {
      g.add(box(1.08, 0.08, 0.58, dark, 0, 1.2 + i * 0.35, 0.02));
    }
    const armL = new THREE.Group(); armL.position.set(-0.7, 2.2, 0);
    armL.add(box(0.3, 1.15, 0.3, wrap, 0, -0.5, 0));
    armL.rotation.x = -0.8;
    g.add(armL);
    const armR = new THREE.Group(); armR.position.set(0.7, 2.2, 0);
    armR.add(box(0.3, 1.15, 0.3, wrap, 0, -0.5, 0));
    armR.rotation.x = -0.7;
    g.add(armR);
    const legL = new THREE.Group(); legL.position.set(-0.25, 0.95, 0);
    legL.add(box(0.35, 0.95, 0.35, wrap, 0, -0.45, 0));
    g.add(legL);
    const legR = new THREE.Group(); legR.position.set(0.25, 0.95, 0);
    legR.add(box(0.35, 0.95, 0.35, wrap, 0, -0.45, 0));
    g.add(legR);
    e.c = { g, armL, armR, legL, legR };
    return finish(e, g, 3.5, d && d.sc);
  };

  // --- minotaur ---
  MODELS.minotaur = function (e, d) {
    const skin = 0x6b4423, fur = 0x4a3018, horn = 0xe8dcc8;
    const g = new THREE.Group();
    g.add(box(1.5, 1.8, 0.8, skin, 0, 2.0, 0));
    g.add(box(1.2, 1.1, 1.1, fur, 0, 3.5, 0)); // bull head
    g.add(box(0.7, 0.5, 0.8, fur, 0, 3.3, 0.7)); // snout
    g.add(box(0.15, 0.12, 0.08, 0x111111, -0.3, 3.7, 0.55));
    g.add(box(0.15, 0.12, 0.08, 0x111111, 0.3, 3.7, 0.55));
    g.add(box(0.4, 0.15, 0.2, 0x222222, 0, 3.15, 1.05));
    // horns
    const hl = cone(0.18, 0.9, horn, -0.55, 4.2, -0.1);
    hl.rotation.z = 0.5;
    const hr = cone(0.18, 0.9, horn, 0.55, 4.2, -0.1);
    hr.rotation.z = -0.5;
    g.add(hl, hr);
    const armL = new THREE.Group(); armL.position.set(-1.0, 2.6, 0);
    armL.add(box(0.45, 1.4, 0.45, skin, 0, -0.6, 0));
    g.add(armL);
    const armR = new THREE.Group(); armR.position.set(1.0, 2.6, 0);
    armR.add(box(0.45, 1.4, 0.45, skin, 0, -0.6, 0));
    armR.add(box(0.2, 1.6, 0.2, 0x555555, 0, -1.7, 0)); // axe handle
    armR.add(box(0.7, 0.5, 0.12, 0x888888, 0.2, -2.4, 0));
    g.add(armR);
    const legL = new THREE.Group(); legL.position.set(-0.4, 1.1, 0);
    legL.add(box(0.5, 1.1, 0.5, fur, 0, -0.55, 0));
    g.add(legL);
    const legR = new THREE.Group(); legR.position.set(0.4, 1.1, 0);
    legR.add(box(0.5, 1.1, 0.5, fur, 0, -0.55, 0));
    g.add(legR);
    e.c = { g, armL, armR, legL, legR };
    return finish(e, g, 4.5, d && d.sc);
  };

  // --- lich ---
  MODELS.lich = function (e, d) {
    const bone = 0xd8d0c0, robe = 0x2a1050, glow = 0x66ffaa;
    const g = new THREE.Group();
    g.add(box(1.1, 1.6, 0.7, robe, 0, 1.6, 0));
    g.add(box(1.3, 0.3, 0.9, robe, 0, 2.45, 0)); // shoulders
    g.add(box(0.75, 0.75, 0.75, bone, 0, 3.0, 0));
    g.add(box(0.18, 0.18, 0.08, glow, -0.18, 3.1, 0.4));
    g.add(box(0.18, 0.18, 0.08, glow, 0.18, 3.1, 0.4));
    g.add(box(0.3, 0.12, 0.1, 0x222222, 0, 2.8, 0.38));
    // crown
    g.add(box(0.9, 0.15, 0.9, 0x8866aa, 0, 3.4, 0));
    g.add(cone(0.1, 0.35, glow, -0.3, 3.65, 0));
    g.add(cone(0.1, 0.35, glow, 0.3, 3.65, 0));
    g.add(cone(0.12, 0.45, glow, 0, 3.7, 0));
    const armL = new THREE.Group(); armL.position.set(-0.75, 2.2, 0);
    armL.add(box(0.28, 1.2, 0.28, bone, 0, -0.5, 0));
    g.add(armL);
    const armR = new THREE.Group(); armR.position.set(0.75, 2.2, 0);
    armR.add(box(0.28, 1.2, 0.28, bone, 0, -0.5, 0));
    armR.add(box(0.12, 1.5, 0.12, 0x6644aa, 0, -1.5, 0)); // staff
    armR.add(sph(0.25, glow, 0, -2.35, 0));
    g.add(armR);
    // floating lower robe
    g.add(box(1.2, 0.8, 0.8, robe, 0, 0.5, 0));
    e.c = { g, armL, armR };
    return finish(e, g, 3.8, d && d.sc);
  };

  // --- hydra ---
  MODELS.hydra = function (e, d) {
    const c = 0x2d6a4f, c2 = 0x1b4332, eye = 0xffee00;
    const g = new THREE.Group();
    g.add(box(2.2, 1.4, 2.5, c, 0, 1.2, 0)); // body
    g.add(box(1.8, 0.8, 1.5, c2, 0, 0.5, -1.2)); // hind
    // 5 heads
    const headPos = [[-1.2, 2.8, 0.8], [-0.6, 3.2, 1.2], [0, 3.5, 1.4], [0.6, 3.2, 1.2], [1.2, 2.8, 0.8]];
    headPos.forEach(([x, y, z], i) => {
      const neck = box(0.4, y - 1.5, 0.4, c, x, 1.5 + (y - 1.5) / 2, z * 0.5);
      g.add(neck);
      g.add(box(0.55, 0.5, 0.7, c, x, y, z));
      g.add(box(0.35, 0.3, 0.4, c2, x, y - 0.05, z + 0.4));
      g.add(box(0.1, 0.1, 0.06, eye, x - 0.12, y + 0.1, z + 0.35));
      g.add(box(0.1, 0.1, 0.06, eye, x + 0.12, y + 0.1, z + 0.35));
    });
    // legs
    [[-0.9, 0.7], [0.9, 0.7], [-0.9, -0.8], [0.9, -0.8]].forEach(([x, z]) => {
      g.add(box(0.5, 0.9, 0.5, c2, x, 0.45, z));
    });
    return finish(e, g, 4.5, d && d.sc);
  };

  // --- yeti ---
  MODELS.yeti = function (e, d) {
    const fur = 0xe8eef5, skin = 0xc0c8d0;
    const g = new THREE.Group();
    g.add(box(1.6, 1.8, 0.9, fur, 0, 1.9, 0));
    g.add(box(1.2, 1.1, 1.1, fur, 0, 3.4, 0));
    g.add(box(0.7, 0.5, 0.5, skin, 0, 3.2, 0.55)); // face
    g.add(box(0.14, 0.1, 0.06, 0x222222, -0.2, 3.4, 0.75));
    g.add(box(0.14, 0.1, 0.06, 0x222222, 0.2, 3.4, 0.75));
    g.add(box(0.35, 0.15, 0.15, 0x333333, 0, 3.05, 0.75));
    const armL = new THREE.Group(); armL.position.set(-1.1, 2.5, 0);
    armL.add(box(0.5, 1.5, 0.5, fur, 0, -0.7, 0));
    armL.add(box(0.45, 0.4, 0.45, skin, 0, -1.5, 0));
    g.add(armL);
    const armR = new THREE.Group(); armR.position.set(1.1, 2.5, 0);
    armR.add(box(0.5, 1.5, 0.5, fur, 0, -0.7, 0));
    armR.add(box(0.45, 0.4, 0.45, skin, 0, -1.5, 0));
    g.add(armR);
    const legL = new THREE.Group(); legL.position.set(-0.4, 1.0, 0);
    legL.add(box(0.5, 1.0, 0.5, fur, 0, -0.5, 0));
    g.add(legL);
    const legR = new THREE.Group(); legR.position.set(0.4, 1.0, 0);
    legR.add(box(0.5, 1.0, 0.5, fur, 0, -0.5, 0));
    g.add(legR);
    e.c = { g, armL, armR, legL, legR };
    return finish(e, g, 4.2, d && d.sc);
  };

  // --- wraith / icewraith ---
  MODELS.wraith = function (e, d, tint) {
    const c = tint || 0x1a2030;
    const g = new THREE.Group();
    const body = box(1.0, 2.0, 0.6, c, 0, 1.6, 0);
    body.material = body.material.clone();
    body.material.transparent = true;
    body.material.opacity = 0.7;
    g.add(body);
    g.add(box(0.7, 0.7, 0.7, c, 0, 2.9, 0));
    g.add(box(0.2, 0.15, 0.08, 0x88ffee, -0.18, 3.0, 0.38));
    g.add(box(0.2, 0.15, 0.08, 0x88ffee, 0.18, 3.0, 0.38));
    // hood
    g.add(box(0.9, 0.4, 0.9, 0x0a1018, 0, 3.25, -0.05));
    g.add(box(0.9, 0.9, 0.15, 0x0a1018, 0, 2.9, -0.4));
    const armL = box(0.25, 1.3, 0.25, c, -0.75, 1.8, 0);
    armL.material = body.material;
    const armR = box(0.25, 1.3, 0.25, c, 0.75, 1.8, 0);
    armR.material = body.material;
    g.add(armL, armR);
    // wispy bottom
    for (let i = 0; i < 4; i++) {
      const w = box(0.25, 0.6, 0.25, c, -0.4 + i * 0.25, 0.3, -0.1);
      w.material = body.material;
      g.add(w);
    }
    return finish(e, g, 3.5, d && d.sc);
  };
  MODELS.icewraith = (e, d) => MODELS.wraith(e, d, 0x88bbee);

  // --- treant ---
  MODELS.treant = function (e, d) {
    const bark = 0x5c4033, leaf = 0x2d6a3a, eye = 0xffee88;
    const g = new THREE.Group();
    g.add(cyl(0.7, 0.9, 2.4, bark, 0, 1.4, 0, 8)); // trunk
    g.add(sph(1.4, leaf, 0, 3.3, 0, 8));
    g.add(sph(1.0, leaf, -0.8, 3.0, 0.3, 8));
    g.add(sph(1.0, leaf, 0.8, 3.0, -0.2, 8));
    g.add(box(0.2, 0.15, 0.1, eye, -0.25, 2.0, 0.75));
    g.add(box(0.2, 0.15, 0.1, eye, 0.25, 2.0, 0.75));
    g.add(box(0.4, 0.1, 0.1, 0x3a2a1a, 0, 1.6, 0.8));
    // branch arms
    const armL = new THREE.Group(); armL.position.set(-0.9, 2.2, 0);
    armL.add(cyl(0.15, 0.2, 1.4, bark, 0, -0.3, 0, 6));
    armL.rotation.z = 0.6;
    g.add(armL);
    const armR = new THREE.Group(); armR.position.set(0.9, 2.2, 0);
    armR.add(cyl(0.15, 0.2, 1.4, bark, 0, -0.3, 0, 6));
    armR.rotation.z = -0.6;
    g.add(armR);
    // root legs
    g.add(box(0.4, 0.6, 0.8, bark, -0.5, 0.3, 0.2));
    g.add(box(0.4, 0.6, 0.8, bark, 0.5, 0.3, -0.2));
    e.c = { g, armL, armR };
    return finish(e, g, 4.5, d && d.sc);
  };

  // --- gargoyle ---
  MODELS.gargoyle = function (e, d) {
    const stone = 0x6a6a6a, dark = 0x4a4a4a;
    const g = new THREE.Group();
    g.add(box(1.1, 1.3, 0.7, stone, 0, 1.6, 0));
    g.add(box(0.85, 0.75, 0.85, stone, 0, 2.7, 0));
    g.add(box(0.5, 0.35, 0.5, dark, 0, 2.55, 0.5));
    g.add(box(0.12, 0.1, 0.06, 0xff2200, -0.2, 2.85, 0.42));
    g.add(box(0.12, 0.1, 0.06, 0xff2200, 0.2, 2.85, 0.42));
    g.add(cone(0.12, 0.35, stone, -0.3, 3.2, -0.1));
    g.add(cone(0.12, 0.35, stone, 0.3, 3.2, -0.1));
    // wings
    const wl = box(0.12, 1.2, 1.4, dark, -0.9, 2.2, -0.3);
    wl.rotation.z = 0.35;
    const wr = box(0.12, 1.2, 1.4, dark, 0.9, 2.2, -0.3);
    wr.rotation.z = -0.35;
    g.add(wl, wr);
    e.wl = wl; e.wr = wr;
    const armL = new THREE.Group(); armL.position.set(-0.75, 2.0, 0);
    armL.add(box(0.35, 1.0, 0.35, stone, 0, -0.45, 0));
    g.add(armL);
    const armR = new THREE.Group(); armR.position.set(0.75, 2.0, 0);
    armR.add(box(0.35, 1.0, 0.35, stone, 0, -0.45, 0));
    g.add(armR);
    g.add(box(0.4, 0.7, 0.4, stone, -0.3, 0.5, 0));
    g.add(box(0.4, 0.7, 0.4, stone, 0.3, 0.5, 0));
    e.c = { g, armL, armR };
    return finish(e, g, 3.5, d && d.sc);
  };

  // --- scorpion ---
  MODELS.scorpion = function (e, d) {
    const c = 0x8a4a1a, c2 = 0x6a3010, claw = 0x5a2a08;
    const g = new THREE.Group();
    g.add(box(1.0, 0.5, 1.6, c, 0, 0.55, 0));
    g.add(box(0.7, 0.4, 0.6, c2, 0, 0.6, 1.0));
    // claws
    g.add(box(0.35, 0.3, 0.7, claw, -0.7, 0.5, 1.2));
    g.add(box(0.25, 0.2, 0.4, claw, -0.9, 0.55, 1.6));
    g.add(box(0.35, 0.3, 0.7, claw, 0.7, 0.5, 1.2));
    g.add(box(0.25, 0.2, 0.4, claw, 0.9, 0.55, 1.6));
    // tail curve
    const tailSegs = [[0, 0.9, -0.9], [0, 1.3, -1.2], [0, 1.7, -1.3], [0, 2.0, -1.1], [0, 2.1, -0.8]];
    tailSegs.forEach(([x, y, z], i) => {
      g.add(box(0.25 - i * 0.02, 0.25, 0.35, c, x, y, z));
    });
    g.add(cone(0.12, 0.4, 0xaa2200, 0, 2.15, -0.5)); // stinger
    // legs
    e.lg = [];
    for (let side = -1; side <= 1; side += 2) {
      for (let i = 0; i < 4; i++) {
        const p = new THREE.Group();
        p.position.set(side * 0.55, 0.35, -0.5 + i * 0.35);
        p.add(box(0.12, 0.15, 0.6, c2, side * 0.25, 0, 0));
        g.add(p);
        e.lg.push(p);
      }
    }
    return finish(e, g, 2.4, d && d.sc);
  };

  // --- crab / giant style ---
  MODELS.crab = function (e, d) {
    const c = 0xc04030, c2 = 0xa03020;
    const g = new THREE.Group();
    g.add(box(1.4, 0.5, 1.1, c, 0, 0.55, 0));
    g.add(box(0.3, 0.25, 0.2, 0x111111, -0.35, 0.75, 0.5));
    g.add(box(0.3, 0.25, 0.2, 0x111111, 0.35, 0.75, 0.5));
    // big claws
    g.add(box(0.5, 0.35, 0.8, c2, -1.0, 0.55, 0.6));
    g.add(box(0.35, 0.25, 0.5, c2, -1.2, 0.6, 1.1));
    g.add(box(0.5, 0.35, 0.8, c2, 1.0, 0.55, 0.6));
    g.add(box(0.35, 0.25, 0.5, c2, 1.2, 0.6, 1.1));
    e.lg = [];
    for (let side = -1; side <= 1; side += 2) {
      for (let i = 0; i < 3; i++) {
        const p = new THREE.Group();
        p.position.set(side * 0.7, 0.3, -0.3 + i * 0.3);
        p.add(box(0.12, 0.12, 0.55, c2, side * 0.2, 0, 0));
        g.add(p);
        e.lg.push(p);
      }
    }
    return finish(e, g, 1.5, d && d.sc);
  };

  // --- bandit ---
  MODELS.bandit = function (e, d) {
    const skin = 0xd4a574, shirt = 0x4a3020, pants = 0x2a2a2a, hood = 0x3a2a1a;
    const g = new THREE.Group();
    g.add(box(1.0, 1.2, 0.5, shirt, 0, 1.6, 0));
    g.add(box(0.85, 0.85, 0.85, skin, 0, 2.65, 0));
    g.add(box(0.12, 0.12, 0.05, 0x111111, -0.2, 2.75, 0.44));
    g.add(box(0.12, 0.12, 0.05, 0x111111, 0.2, 2.75, 0.44));
    g.add(box(1.0, 0.5, 1.0, hood, 0, 3.0, 0)); // hood
    g.add(box(1.0, 0.9, 0.15, hood, 0, 2.6, -0.45));
    g.add(box(0.5, 0.15, 0.1, 0x222222, 0, 2.85, 0.45)); // mask
    const armL = new THREE.Group(); armL.position.set(-0.65, 2.1, 0);
    armL.add(box(0.3, 1.05, 0.35, skin, 0, -0.45, 0));
    g.add(armL);
    const armR = new THREE.Group(); armR.position.set(0.65, 2.1, 0);
    armR.add(box(0.3, 1.05, 0.35, skin, 0, -0.45, 0));
    armR.add(box(0.1, 1.0, 0.1, 0x888888, 0, -1.2, 0)); // dagger
    g.add(armR);
    const legL = new THREE.Group(); legL.position.set(-0.25, 1.0, 0);
    legL.add(box(0.4, 1.0, 0.4, pants, 0, -0.5, 0));
    g.add(legL);
    const legR = new THREE.Group(); legR.position.set(0.25, 1.0, 0);
    legR.add(box(0.4, 1.0, 0.4, pants, 0, -0.5, 0));
    g.add(legR);
    e.c = { g, armL, armR, legL, legR };
    return finish(e, g, 3.4, d && d.sc);
  };

  // --- fireelemental ---
  MODELS.fireelemental = function (e, d) {
    const g = new THREE.Group();
    const core = 0xff6622, outer = 0xff2200, tip = 0xffee44;
    g.add(sph(0.7, core, 0, 1.5, 0, 10));
    g.add(sph(0.5, tip, 0, 2.3, 0, 8));
    g.add(sph(0.4, outer, 0, 0.8, 0, 8));
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * Math.PI * 2;
      const h = 0.8 + (i % 3) * 0.3;
      g.add(cone(0.2, h, i % 2 ? tip : outer, Math.cos(a) * 0.5, 1.5 + h / 2, Math.sin(a) * 0.5));
    }
    // arm flames
    g.add(cone(0.25, 1.2, outer, -0.9, 1.5, 0));
    g.add(cone(0.25, 1.2, outer, 0.9, 1.5, 0));
    return finish(e, g, 3.5, d && d.sc);
  };

  // --- stonegolem ---
  MODELS.stonegolem = function (e, d) {
    const s = 0x7a7a70, s2 = 0x5a5a52;
    const g = new THREE.Group();
    g.add(box(1.8, 2.0, 1.0, s, 0, 2.0, 0));
    g.add(box(1.3, 1.1, 1.1, s2, 0, 3.6, 0));
    g.add(box(0.2, 0.15, 0.1, 0xffaa00, -0.3, 3.8, 0.55));
    g.add(box(0.2, 0.15, 0.1, 0xffaa00, 0.3, 3.8, 0.55));
    // moss cracks
    g.add(box(1.85, 0.08, 0.15, 0x3a5a2a, 0, 2.3, 0.5));
    g.add(box(0.15, 0.8, 0.15, 0x3a5a2a, 0.5, 1.8, 0.5));
    const armL = new THREE.Group(); armL.position.set(-1.2, 2.6, 0);
    armL.add(box(0.6, 1.6, 0.6, s, 0, -0.7, 0));
    g.add(armL);
    const armR = new THREE.Group(); armR.position.set(1.2, 2.6, 0);
    armR.add(box(0.6, 1.6, 0.6, s, 0, -0.7, 0));
    g.add(armR);
    g.add(box(0.6, 1.2, 0.6, s2, -0.45, 0.6, 0));
    g.add(box(0.6, 1.2, 0.6, s2, 0.45, 0.6, 0));
    e.c = { g, armL, armR };
    return finish(e, g, 4.5, d && d.sc);
  };

  // --- frostgiant ---
  MODELS.frostgiant = function (e, d) {
    const skin = 0xa0c4d8, armor = 0x4a6080, fur = 0xd0e0f0;
    const g = new THREE.Group();
    g.add(box(2.0, 2.4, 1.0, armor, 0, 2.4, 0));
    g.add(box(1.5, 1.4, 1.4, skin, 0, 4.3, 0));
    g.add(box(0.2, 0.15, 0.1, 0x2244aa, -0.35, 4.5, 0.7));
    g.add(box(0.2, 0.15, 0.1, 0x2244aa, 0.35, 4.5, 0.7));
    g.add(box(1.6, 0.4, 1.5, fur, 0, 5.1, 0)); // hair
    g.add(box(0.5, 0.3, 0.3, fur, 0, 4.0, 0.7)); // beard
    const armL = new THREE.Group(); armL.position.set(-1.4, 3.2, 0);
    armL.add(box(0.6, 1.8, 0.6, skin, 0, -0.8, 0));
    g.add(armL);
    const armR = new THREE.Group(); armR.position.set(1.4, 3.2, 0);
    armR.add(box(0.6, 1.8, 0.6, skin, 0, -0.8, 0));
    armR.add(box(0.25, 2.2, 0.25, 0x88aacc, 0, -2.2, 0)); // ice club
    armR.add(box(0.6, 0.6, 0.6, 0xaaddff, 0, -3.3, 0));
    g.add(armR);
    g.add(box(0.7, 1.4, 0.7, armor, -0.5, 0.7, 0));
    g.add(box(0.7, 1.4, 0.7, armor, 0.5, 0.7, 0));
    e.c = { g, armL, armR };
    return finish(e, g, 5.5, d && d.sc);
  };

  // --- vampire ---
  MODELS.vampire = function (e, d) {
    const skin = 0xe8d0d0, cape = 0x4a0020, shirt = 0x1a1a2a;
    const g = new THREE.Group();
    g.add(box(1.0, 1.3, 0.5, shirt, 0, 1.65, 0));
    g.add(box(0.85, 0.85, 0.85, skin, 0, 2.75, 0));
    g.add(box(0.14, 0.14, 0.06, 0xaa0000, -0.2, 2.85, 0.44));
    g.add(box(0.14, 0.14, 0.06, 0xaa0000, 0.2, 2.85, 0.44));
    g.add(box(0.1, 0.2, 0.06, 0xeeeeee, -0.12, 2.55, 0.44)); // fang
    g.add(box(0.1, 0.2, 0.06, 0xeeeeee, 0.12, 2.55, 0.44));
    g.add(box(0.95, 0.3, 0.95, 0x1a1a1a, 0, 3.2, 0)); // hair
    // cape
    g.add(box(1.4, 2.0, 0.15, cape, 0, 1.8, -0.4));
    g.add(box(1.5, 0.3, 0.6, cape, 0, 2.9, -0.15));
    const armL = new THREE.Group(); armL.position.set(-0.7, 2.15, 0);
    armL.add(box(0.3, 1.1, 0.3, skin, 0, -0.5, 0));
    g.add(armL);
    const armR = new THREE.Group(); armR.position.set(0.7, 2.15, 0);
    armR.add(box(0.3, 1.1, 0.3, skin, 0, -0.5, 0));
    g.add(armR);
    const legL = new THREE.Group(); legL.position.set(-0.25, 1.0, 0);
    legL.add(box(0.38, 1.0, 0.38, 0x1a1a1a, 0, -0.5, 0));
    g.add(legL);
    const legR = new THREE.Group(); legR.position.set(0.25, 1.0, 0);
    legR.add(box(0.38, 1.0, 0.38, 0x1a1a1a, 0, -0.5, 0));
    g.add(legR);
    e.c = { g, armL, armR, legL, legR };
    return finish(e, g, 3.5, d && d.sc);
  };

  // --- lizardman ---
  MODELS.lizardman = function (e, d) {
    const scale = 0x3a8a5a, belly = 0x8aba6a, crest = 0x2a6a3a;
    const g = new THREE.Group();
    g.add(box(1.1, 1.3, 0.6, scale, 0, 1.7, 0));
    g.add(box(0.9, 0.85, 1.0, scale, 0, 2.8, 0.1));
    g.add(box(0.5, 0.4, 0.6, belly, 0, 2.65, 0.55));
    g.add(box(0.12, 0.12, 0.06, 0xffee00, -0.22, 2.95, 0.55));
    g.add(box(0.12, 0.12, 0.06, 0xffee00, 0.22, 2.95, 0.55));
    // crest
    for (let i = 0; i < 4; i++) {
      g.add(box(0.08, 0.3 + i * 0.05, 0.15, crest, 0, 3.2 + i * 0.08, -0.2 + i * 0.05));
    }
    // tail
    g.add(box(0.35, 0.3, 1.2, scale, 0, 1.2, -1.0));
    g.add(box(0.25, 0.2, 0.7, scale, 0, 1.1, -1.8));
    const armL = new THREE.Group(); armL.position.set(-0.75, 2.2, 0);
    armL.add(box(0.32, 1.1, 0.32, scale, 0, -0.5, 0));
    g.add(armL);
    const armR = new THREE.Group(); armR.position.set(0.75, 2.2, 0);
    armR.add(box(0.32, 1.1, 0.32, scale, 0, -0.5, 0));
    armR.add(box(0.12, 1.2, 0.12, 0x888888, 0, -1.3, 0));
    g.add(armR);
    const legL = new THREE.Group(); legL.position.set(-0.3, 1.05, 0);
    legL.add(box(0.4, 1.05, 0.4, scale, 0, -0.5, 0));
    g.add(legL);
    const legR = new THREE.Group(); legR.position.set(0.3, 1.05, 0);
    legR.add(box(0.4, 1.05, 0.4, scale, 0, -0.5, 0));
    g.add(legR);
    e.c = { g, armL, armR, legL, legR };
    return finish(e, g, 3.5, d && d.sc);
  };

  // --- golem (clay style fallback) ---
  MODELS.golem = function (e, d) {
    return MODELS.stonegolem(e, d);
  };

  // --- bear ---
  MODELS.bear = function (e, d) {
    const c = 0x6b4a2a, c2 = 0x5a3a1a;
    const g = new THREE.Group();
    g.add(box(1.2, 1.0, 1.8, c, 0, 1.15, 0));
    g.add(box(0.9, 0.8, 0.85, c, 0, 1.45, 1.2));
    g.add(box(0.5, 0.4, 0.5, c2, 0, 1.25, 1.7));
    g.add(box(0.25, 0.25, 0.12, c, -0.35, 1.95, 1.15));
    g.add(box(0.25, 0.25, 0.12, c, 0.35, 1.95, 1.15));
    g.add(box(0.14, 0.14, 0.06, 0x111111, -0.2, 1.55, 1.55));
    g.add(box(0.14, 0.14, 0.06, 0x111111, 0.2, 1.55, 1.55));
    e.lg = [[-0.4, 0.55], [0.4, 0.55], [-0.4, -0.6], [0.4, -0.6]].map(([x, z]) => {
      const p = new THREE.Group();
      p.position.set(x, 0.6, z);
      p.add(box(0.35, 0.65, 0.35, c, 0, -0.3, 0));
      g.add(p);
      return p;
    });
    return finish(e, g, 2.4, d && d.sc);
  };

  // ============================================================
  // BLD 등록
  // ============================================================
  function applyModels() {
    const BLD = global.BLD || (global.BLD = {});
    let count = 0;
    for (const [k, fn] of Object.entries(MODELS)) {
      BLD[k] = fn;
      count++;
    }
    return count;
  }

  global.MonsterModels = MODELS;
  global.applyMonsterModels = applyModels;

  // 즉시 1회 + 기존 게임 스크립트가 BLD 를 채운 뒤에도 다시 덮어쓰기
  const n = applyModels();
  console.log('[monster.js] D&D 스타일 모델 ' + n + '종 등록 완료');

  if (typeof document !== 'undefined') {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', function () {
        applyModels();
        console.log('[monster.js] DOMContentLoaded — BLD 재적용');
      });
    }
    // 게임 인라인 스크립트가 늦게 BLD 를 정의하는 경우 대비
    setTimeout(function () { applyModels(); }, 0);
    setTimeout(function () { applyModels(); }, 500);
  }
})(typeof window !== 'undefined' ? window : global);
