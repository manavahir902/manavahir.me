/* THREE is loaded globally via the classic <script> tag in index.html */

/* ---------- nav toggle ---------- */
const navToggle = document.getElementById("navToggle");
const navLinks = document.getElementById("navLinks");
navToggle.addEventListener("click", () => {
  const open = navLinks.classList.toggle("open");
  navToggle.setAttribute("aria-expanded", open);
});
navLinks.querySelectorAll("a").forEach((a) =>
  a.addEventListener("click", () => navLinks.classList.remove("open"))
);

/* ---------- footer year ---------- */
document.getElementById("year").textContent = new Date().getFullYear();

/* ---------- typewriter role line ---------- */
const roles = [
  "Cloud & DevOps Engineer",
  "AWS · Terraform · Linux",
  "Building infra that doesn't page you at 2am",
];
const tw = document.getElementById("typewriter");
const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

if (reducedMotion) {
  tw.textContent = roles[0];
} else {
  let roleIdx = 0, charIdx = 0, deleting = false;
  function typeLoop() {
    const full = roles[roleIdx];
    if (!deleting) {
      charIdx++;
      tw.textContent = full.slice(0, charIdx);
      if (charIdx === full.length) {
        deleting = true;
        setTimeout(typeLoop, 1600);
        return;
      }
    } else {
      charIdx--;
      tw.textContent = full.slice(0, charIdx);
      if (charIdx === 0) {
        deleting = false;
        roleIdx = (roleIdx + 1) % roles.length;
      }
    }
    setTimeout(typeLoop, deleting ? 28 : 48);
  }
  typeLoop();
}

/* ---------- fake terminal log ---------- */
const logLines = [
  "Provisioning VPC across 2 AZs... OK",
  "Attaching IAM policies... OK",
  "Deploying ECS Fargate service... OK",
  "Draining old EC2 targets... OK",
  "Zero downtime achieved ✓",
  "CloudWatch alarms armed... OK",
];
const logEl = document.getElementById("terminalLog");
let logIdx = 0;
function pushLog() {
  const div = document.createElement("div");
  div.innerHTML = `<span class="ok">$</span> ${logLines[logIdx % logLines.length]}`;
  logEl.appendChild(div);
  while (logEl.children.length > 6) logEl.removeChild(logEl.firstChild);
  logEl.scrollTop = logEl.scrollHeight;
  logIdx++;
}
pushLog();
if (!reducedMotion) setInterval(pushLog, 2200);

/* ---------- scroll reveal ---------- */
const revealEls = document.querySelectorAll(".reveal");
const io = new IntersectionObserver(
  (entries) => {
    entries.forEach((e) => {
      if (e.isIntersecting) {
        e.target.classList.add("in");
        io.unobserve(e.target);
      }
    });
  },
  { threshold: 0.15 }
);
revealEls.forEach((el) => io.observe(el));

/* ---------- 3D network topology (signature hero visual) ---------- */
const canvas = document.getElementById("netCanvas");
const wrap = canvas.parentElement;

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(42, 1, 0.1, 100);
camera.position.set(0, 0, 7.2);

const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

function resize() {
  const w = wrap.clientWidth, h = wrap.clientHeight;
  renderer.setSize(w, h, false);
  camera.aspect = w / h;
  camera.updateProjectionMatrix();
}
resize();
window.addEventListener("resize", resize);

/* icosahedron vertices (golden ratio) */
const phi = (1 + Math.sqrt(5)) / 2;
const rawVerts = [
  [-1, phi, 0], [1, phi, 0], [-1, -phi, 0], [1, -phi, 0],
  [0, -1, phi], [0, 1, phi], [0, -1, -phi], [0, 1, -phi],
  [phi, 0, -1], [phi, 0, 1], [-phi, 0, -1], [-phi, 0, 1],
];
const RADIUS = 2.5;
const verts = rawVerts.map(([x, y, z]) => {
  const len = Math.sqrt(x * x + y * y + z * z);
  return new THREE.Vector3((x / len) * RADIUS, (y / len) * RADIUS, (z / len) * RADIUS);
});
const edgeList = [
  [0, 1], [0, 5], [0, 7], [0, 10], [0, 11],
  [1, 5], [1, 7], [1, 8], [1, 9],
  [2, 3], [2, 4], [2, 6], [2, 10], [2, 11],
  [3, 4], [3, 6], [3, 8], [3, 9],
  [4, 5], [4, 9], [4, 11],
  [5, 9], [5, 11],
  [6, 7], [6, 8], [6, 10],
  [7, 8], [7, 10],
  [8, 9],
  [10, 11],
];

const group = new THREE.Group();
scene.add(group);

/* edges */
const edgePositions = [];
edgeList.forEach(([a, b]) => {
  edgePositions.push(verts[a].x, verts[a].y, verts[a].z, verts[b].x, verts[b].y, verts[b].z);
});
const edgeGeo = new THREE.BufferGeometry();
edgeGeo.setAttribute("position", new THREE.Float32BufferAttribute(edgePositions, 3));
const edgeMat = new THREE.LineBasicMaterial({ color: 0x3e7a75, transparent: true, opacity: 0.55 });
group.add(new THREE.LineSegments(edgeGeo, edgeMat));

/* glow sprite texture */
function makeGlowTexture(color) {
  const size = 128;
  const c = document.createElement("canvas");
  c.width = c.height = size;
  const ctx = c.getContext("2d");
  const g = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  g.addColorStop(0, color);
  g.addColorStop(0.4, color);
  g.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, size, size);
  return new THREE.CanvasTexture(c);
}
const amberTex = makeGlowTexture("rgba(255,180,84,1)");
const cyanTex = makeGlowTexture("rgba(111,231,221,1)");

/* nodes */
verts.forEach((v) => {
  const mat = new THREE.SpriteMaterial({ map: amberTex, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending });
  const sprite = new THREE.Sprite(mat);
  sprite.position.copy(v);
  sprite.scale.setScalar(0.55);
  group.add(sprite);
});

/* traveling packets along random edges */
const packetCount = 7;
const packets = [];
for (let i = 0; i < packetCount; i++) {
  const [a, b] = edgeList[Math.floor(Math.random() * edgeList.length)];
  const mat = new THREE.SpriteMaterial({
    map: cyanTex, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
  });
  const sprite = new THREE.Sprite(mat);
  sprite.scale.setScalar(0.28);
  group.add(sprite);
  packets.push({ a, b, t: Math.random(), speed: 0.25 + Math.random() * 0.35, sprite });
}

/* mouse parallax */
let targetX = 0;
let targetY = 0;

wrap.addEventListener("mousemove", (e) => {
  const rect = wrap.getBoundingClientRect();

  targetX = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
  targetY = ((e.clientY - rect.top) / rect.height - 0.5) * 2;
});

wrap.addEventListener("mouseleave", () => {
  targetX = 0;
  targetY = 0;
});

const clock = new THREE.Clock();
function animate() {
  requestAnimationFrame(animate);
  const dt = clock.getDelta();

  if (!reducedMotion) {
    // Continuous idle rotation
group.rotation.y += dt * 0.12;

// Mouse follow
const desiredX = targetY * 1.5;
const desiredY = targetX * 1.8;

// Smooth interpolation
group.rotation.x = THREE.MathUtils.lerp(
  group.rotation.x,
  desiredX,
  0.10
);

group.rotation.y = THREE.MathUtils.lerp(
  group.rotation.y,
  group.rotation.y + (desiredY * 0.12),
  0.10
);

    packets.forEach((p) => {
      p.t += dt * p.speed;
      if (p.t > 1) {
        p.t = 0;
        const [a, b] = edgeList[Math.floor(Math.random() * edgeList.length)];
        p.a = a; p.b = b;
      }
      p.sprite.position.lerpVectors(verts[p.a], verts[p.b], p.t);
    });
  }

  renderer.render(scene, camera);
}
animate();
