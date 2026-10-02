import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";

// ---------- config ----------
const ARENA = 18;
const TIME_LIMIT = 60;
const GOAL = 15;
const MAX_HEARTS = 3;
const WALK = 5, SPRINT = 8, GRAV = 22, JUMP_V = 8, FLAP_V = 7;
const PHOTO_CD = 1.2, PHOTO_RANGE = 7, PHOTO_ANIM = 0.7;
const ENEMY_COUNT = 5, FILM_COUNT = 6;

// ---------- scene ----------
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
renderer.setSize(innerWidth, innerHeight);
renderer.shadowMap.enabled = true;
document.body.appendChild(renderer.domElement);

const scene = new THREE.Scene();
scene.background = new THREE.Color(0xf3d9b1);
scene.fog = new THREE.Fog(0xf3d9b1, 25, 60);
const camera = new THREE.PerspectiveCamera(55, innerWidth / innerHeight, 0.1, 200);

scene.add(new THREE.HemisphereLight(0xfff1dd, 0x6b4a2f, 1.1));
const sun = new THREE.DirectionalLight(0xffffff, 2.2);
sun.position.set(8, 14, 6);
sun.castShadow = true;
sun.shadow.mapSize.set(1024, 1024);
Object.assign(sun.shadow.camera, { left: -20, right: 20, top: 20, bottom: -20, near: 1, far: 50 });
scene.add(sun);

const ground = new THREE.Mesh(
  new THREE.CircleGeometry(ARENA + 4, 64),
  new THREE.MeshStandardMaterial({ color: 0x8fbf6a, roughness: 1 })
);
ground.rotation.x = -Math.PI / 2;
ground.receiveShadow = true;
scene.add(ground);
const grid = new THREE.GridHelper((ARENA + 4) * 2, 36, 0x6a9a4a, 0x7fae5c);
grid.position.y = 0.01;
scene.add(grid);

const trunkMat = new THREE.MeshStandardMaterial({ color: 0x6b4a2f });
const leafMat = new THREE.MeshStandardMaterial({ color: 0x4f8a3a });
for (let i = 0; i < 14; i++) {
  const a = (i / 14) * Math.PI * 2, r = ARENA + 1.5 + (i % 3);
  const t = new THREE.Group();
  const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.25, 0.35, 2), trunkMat);
  trunk.position.y = 1; trunk.castShadow = true;
  const leaf = new THREE.Mesh(new THREE.ConeGeometry(1.4, 3.2, 10), leafMat);
  leaf.position.y = 3.4; leaf.castShadow = true;
  t.add(trunk, leaf);
  t.position.set(Math.cos(a) * r, 0, Math.sin(a) * r);
  scene.add(t);
}

// ---------- HUD ----------
const $ = (id) => document.getElementById(id);
const hud = { score: $("score"), goal: $("goal"), time: $("time"), hearts: $("hearts"), cd: $("cdfill"), flash: $("flash"), end: $("end"), endTitle: $("endTitle"), endInfo: $("endInfo"), toast: $("toast") };
hud.goal.textContent = GOAL;
let toastTimer = 0;
function toast(msg) { hud.toast.textContent = msg; hud.toast.style.opacity = 1; toastTimer = 1.2; }

// ---------- game state ----------
const S = { state: "playing", score: 0, hearts: MAX_HEARTS, time: TIME_LIMIT, invincible: 0, photoCd: 0, photoAnim: 0, canFlap: true, flapping: false };

// ---------- film rolls ----------
const films = [];
const filmGeo = new THREE.CylinderGeometry(0.28, 0.28, 0.4, 20);
const filmMat = new THREE.MeshStandardMaterial({ color: 0xe8892b, metalness: 0.3, roughness: 0.4 });
const goldMat = new THREE.MeshStandardMaterial({ color: 0xffd23f, metalness: 0.6, roughness: 0.25, emissive: 0x7a5a00 });
function randomSpot(minR = 4, maxR = ARENA - 2) {
  const a = Math.random() * Math.PI * 2, r = minR + Math.random() * (maxR - minR);
  return new THREE.Vector3(Math.cos(a) * r, 0, Math.sin(a) * r);
}
function spawnFilm() {
  const gold = Math.random() < 0.15;
  const m = new THREE.Mesh(filmGeo, gold ? goldMat : filmMat);
  m.scale.setScalar(gold ? 1.4 : 1);
  m.position.copy(randomSpot()); m.position.y = 0.9;
  m.castShadow = true;
  m.userData.value = gold ? 3 : 1;
  scene.add(m); films.push(m);
}
for (let i = 0; i < FILM_COUNT; i++) spawnFilm();

// ---------- enemies (red bugs) ----------
const enemies = [];
const bugGeo = new THREE.IcosahedronGeometry(0.5, 0);
const bugMat = new THREE.MeshStandardMaterial({ color: 0xd8372b, flatShading: true, roughness: 0.6 });
function spawnEnemy() {
  const e = new THREE.Mesh(bugGeo, bugMat);
  e.castShadow = true;
  e.userData = { alive: true, respawn: 0, seed: Math.random() * 10, speed: 1.8 + Math.random() * 0.8 };
  respawnEnemy(e);
  scene.add(e); enemies.push(e);
}
function respawnEnemy(e) {
  const p = randomSpot(10, ARENA - 1);
  e.position.set(p.x, 0.5, p.z);
  e.scale.setScalar(1); e.visible = true; e.userData.alive = true;
}
for (let i = 0; i < ENEMY_COUNT; i++) spawnEnemy();

// ---------- input ----------
const keys = new Set();
let spacePressed = false;
addEventListener("keydown", (e) => {
  if (e.repeat) return;
  keys.add(e.code);
  if (e.code === "Space") { e.preventDefault(); spacePressed = true; }
  if (e.code === "KeyF") input.photo = true;
  if (e.code === "KeyR" && S.state !== "playing") restart();
});
addEventListener("keyup", (e) => keys.delete(e.code));
const input = { x: 0, y: 0, jump: false, photo: false };
const stick = $("stick"), jumpBtn = $("jumpBtn"), photoBtn = $("photoBtn");
stick.addEventListener("pointerdown", (e) => stick.setPointerCapture(e.pointerId));
stick.addEventListener("pointermove", (e) => {
  if (!stick.hasPointerCapture(e.pointerId)) return;
  const r = stick.getBoundingClientRect();
  const dx = (e.clientX - (r.left + r.width / 2)) / (r.width / 2);
  const dy = (e.clientY - (r.top + r.height / 2)) / (r.height / 2);
  const l = Math.hypot(dx, dy) || 1, k = Math.min(1, l) / l;
  input.x = dx * k; input.y = dy * k;
});
const stickEnd = () => { input.x = 0; input.y = 0; };
stick.addEventListener("pointerup", stickEnd);
stick.addEventListener("pointercancel", stickEnd);
jumpBtn.addEventListener("pointerdown", () => { spacePressed = true; });
photoBtn.addEventListener("pointerdown", () => { input.photo = true; });
hud.end.addEventListener("pointerdown", () => { if (S.state !== "playing") restart(); });

// ---------- player ----------
const player = new THREE.Group();
scene.add(player);
let mixer, actions = {}, current = null, currentName = "";
const vel = new THREE.Vector3();
let grounded = true;

function play(name, { fade = 0.15, force = false } = {}) {
  const next = actions[name];
  if (!next) return;
  if (!force && name === currentName) return;
  next.reset().fadeIn(fade).play();
  if (current && current !== next) current.fadeOut(fade);
  current = next; currentName = name;
}

new GLTFLoader().load("mascot.glb", (gltf) => {
  const model = gltf.scene;
  model.traverse((o) => { if (o.isMesh) { o.castShadow = true; o.frustumCulled = false; } });
  model.scale.setScalar(1.4);
  player.add(model);
  mixer = new THREE.AnimationMixer(model);
  for (const clip of gltf.animations) actions[clip.name] = mixer.clipAction(clip);
  for (const n of ["jump", "photo"]) { actions[n].setLoop(THREE.LoopOnce, 1); actions[n].clampWhenFinished = true; }
  actions.jump.timeScale = 2.2;
  actions.walk.timeScale = 1.8;
  actions.flap.timeScale = 1.6;
  actions.photo.timeScale = 1.3;
  play("idle");
  $("loading").remove();
  window.__ready = true;
}, undefined, (err) => { $("loading").textContent = "載入失敗：" + err.message; });

// ---------- actions ----------
function takePhoto() {
  S.photoCd = PHOTO_CD; S.photoAnim = PHOTO_ANIM;
  play("photo", { force: true, fade: 0.05 });
  hud.flash.style.transition = "none"; hud.flash.style.opacity = 0.9;
  requestAnimationFrame(() => { hud.flash.style.transition = "opacity .45s"; hud.flash.style.opacity = 0; });
  const fx = Math.sin(player.rotation.y), fz = Math.cos(player.rotation.y);
  let hit = 0;
  for (const e of enemies) {
    if (!e.userData.alive) continue;
    const dx = e.position.x - player.position.x, dz = e.position.z - player.position.z;
    const d = Math.hypot(dx, dz);
    if (d < PHOTO_RANGE && (dx * fx + dz * fz) / (d || 1) > 0.35) {
      e.userData.alive = false; e.userData.respawn = 4; hit++;
    }
  }
  if (hit) { S.score += hit; toast(`拍到 ${hit} 隻！+${hit}`); }
}

function hurt() {
  S.hearts--; S.invincible = 1.6;
  vel.y = 6; grounded = false;
  toast("被撞到了！");
  if (S.hearts <= 0) finish(false);
}

function finish(won) {
  S.state = won ? "won" : "lost";
  hud.endTitle.textContent = won ? "任務完成！" : (S.time <= 0 ? "時間到" : "體力用完");
  hud.endInfo.textContent = `底片 ${S.score} / ${GOAL} · 按 R 或點一下重玩`;
  hud.end.style.display = "flex";
}

function restart() {
  Object.assign(S, { state: "playing", score: 0, hearts: MAX_HEARTS, time: TIME_LIMIT, invincible: 0, photoCd: 0, photoAnim: 0, canFlap: true, flapping: false });
  player.position.set(0, 0, 0); player.rotation.y = 0; vel.set(0, 0, 0); grounded = true;
  enemies.forEach(respawnEnemy);
  while (films.length) scene.remove(films.pop());
  for (let i = 0; i < FILM_COUNT; i++) spawnFilm();
  hud.end.style.display = "none";
  currentName = ""; play("idle");
}

// ---------- loop ----------
const clock = new THREE.Clock();
const camOffset = new THREE.Vector3(0, 3.0, 5.2);
const camTarget = new THREE.Vector3();
const tmp = new THREE.Vector3();

function tick() {
  const dt = Math.min(clock.getDelta(), 0.05);
  const now = performance.now() / 1000;

  if (S.state === "playing") {
    S.time -= dt; S.invincible = Math.max(0, S.invincible - dt);
    S.photoCd = Math.max(0, S.photoCd - dt); S.photoAnim = Math.max(0, S.photoAnim - dt);
    if (S.time <= 0) { S.time = 0; finish(S.score >= GOAL); }

    let ix = (keys.has("KeyD") || keys.has("ArrowRight") ? 1 : 0) - (keys.has("KeyA") || keys.has("ArrowLeft") ? 1 : 0) + input.x;
    let iz = (keys.has("KeyS") || keys.has("ArrowDown") ? 1 : 0) - (keys.has("KeyW") || keys.has("ArrowUp") ? 1 : 0) + input.y;
    const len = Math.hypot(ix, iz);
    const moving = len > 0.1;
    const sprint = keys.has("ShiftLeft") || keys.has("ShiftRight");
    if (moving) {
      ix /= Math.max(len, 1); iz /= Math.max(len, 1);
      const sp = sprint ? SPRINT : WALK;
      player.position.x += ix * sp * dt; player.position.z += iz * sp * dt;
      const target = Math.atan2(ix, iz); // model faces +Z
      let d = target - player.rotation.y;
      d = Math.atan2(Math.sin(d), Math.cos(d));
      player.rotation.y += d * Math.min(1, dt * 12);
    }
    const r = Math.hypot(player.position.x, player.position.z);
    if (r > ARENA) { player.position.x *= ARENA / r; player.position.z *= ARENA / r; }

    // jump / double jump (flap)
    if (spacePressed) {
      if (grounded) { vel.y = JUMP_V; grounded = false; S.canFlap = true; S.flapping = false; play("jump", { force: true, fade: 0.1 }); }
      else if (S.canFlap) { vel.y = FLAP_V; S.canFlap = false; S.flapping = true; play("flap", { force: true, fade: 0.08 }); toast("拍翅膀！"); }
    }
    spacePressed = false;
    vel.y -= GRAV * dt;
    player.position.y += vel.y * dt;
    if (player.position.y <= 0) {
      player.position.y = 0; vel.y = 0;
      if (!grounded) { grounded = true; S.flapping = false; }
    }

    // photo
    if (input.photo && S.photoCd <= 0) takePhoto();
    input.photo = false;

    // animation state
    if (S.photoAnim > 0) { /* playing photo */ }
    else if (!grounded) { if (S.flapping) play("flap"); }
    else play(moving ? "walk" : "idle");

    // films
    for (let i = films.length - 1; i >= 0; i--) {
      const f = films[i];
      f.rotation.y += dt * 2;
      f.position.y = 0.9 + Math.sin(now * 3.3 + i) * 0.1;
      tmp.set(player.position.x, 0.6 + player.position.y, player.position.z);
      if (f.position.distanceTo(tmp) < 1.2) {
        const v = f.userData.value;
        S.score += v; scene.remove(f); films.splice(i, 1);
        toast(v > 1 ? `金底片 +${v}` : "+1");
        setTimeout(spawnFilm, 800);
      }
    }

    // enemies
    for (const e of enemies) {
      const u = e.userData;
      if (!u.alive) {
        e.scale.multiplyScalar(Math.max(0, 1 - dt * 6));
        u.respawn -= dt;
        if (u.respawn <= 0) respawnEnemy(e); else if (u.respawn < 3.6) e.visible = false;
        continue;
      }
      const dx = player.position.x - e.position.x, dz = player.position.z - e.position.z;
      const d = Math.hypot(dx, dz) || 1;
      e.position.x += (dx / d) * u.speed * dt; e.position.z += (dz / d) * u.speed * dt;
      e.position.y = 0.5 + Math.abs(Math.sin(now * 5 + u.seed)) * 0.35;
      e.rotation.y += dt * 3;
      if (S.invincible <= 0 && d < 0.95 && player.position.y < 0.7) hurt();
    }

    // win condition
    if (S.score >= GOAL && S.state === "playing") finish(true);
  }

  mixer?.update(dt);

  // blink while invincible
  player.visible = S.invincible <= 0 || Math.floor(now * 12) % 2 === 0;

  // HUD
  hud.score.textContent = S.score;
  hud.time.textContent = Math.ceil(S.time);
  hud.hearts.textContent = "♥".repeat(Math.max(0, S.hearts)) + "♡".repeat(MAX_HEARTS - Math.max(0, S.hearts));
  hud.cd.style.width = (100 - (S.photoCd / PHOTO_CD) * 100) + "%";
  if (toastTimer > 0) { toastTimer -= dt; if (toastTimer <= 0) hud.toast.style.opacity = 0; }

  camera.position.lerp(tmp.copy(player.position).add(camOffset), 1 - Math.exp(-dt * 5));
  camTarget.lerp(tmp.set(player.position.x, 0.8, player.position.z), 1 - Math.exp(-dt * 8));
  camera.lookAt(camTarget);

  renderer.render(scene, camera);
  requestAnimationFrame(tick);
}
camera.position.copy(camOffset);
tick();

addEventListener("resize", () => {
  camera.aspect = innerWidth / innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(innerWidth, innerHeight);
});

// debug handle for automated playtests
window.__game = {
  player, enemies, films, S,
  get anim() { return currentName; },
  get grounded() { return grounded; },
};
