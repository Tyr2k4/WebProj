// Global variables
let scene, camera, renderer, earth, clouds, stars;
let isRotating = true;
let isOrbiting = true;
let showStars = true;
let showClouds = true;
let showSolarSystem = false;
let mouseDown = false;
let mouseButton = 0;
let mouseX = 0, mouseY = 0;
let targetRotationX = 0, targetRotationY = 0;
let rotationX = 0, rotationY = 0;
let planets = {};
let solarSystemGroup;
let raycaster, mouse;
let currentTarget = new THREE.Vector3(0, 0, 0);

// Texture Loader Setup
const textureLoader = new THREE.TextureLoader();
textureLoader.setCrossOrigin('anonymous'); // Ensure CDN access
// Using a reliable CDN for planet textures
const textureBase = 'https://solartextures.b-cdn.net/';

const planetTextures = {
    sun: '8k_sun.jpg', // Upgraded to 8K for realism
    mercury: '2k_mercury.jpg',
    venus: '2k_venus_surface.jpg',
    earth: '2k_earth_daymap.jpg',
    mars: '2k_mars.jpg',
    jupiter: '2k_jupiter.jpg',
    saturn: '2k_saturn.jpg',
    uranus: '2k_uranus.jpg',
    neptune: '2k_neptune.jpg',
    saturn_ring: '2k_saturn_ring_alpha.png'
};

// Zoom constraints
let minZoom = 1.5;
let maxZoom = 10;

// Planet information database
const planetInfo = {
    sun: {
        name: "The Sun",
        type: "G-type Main-Sequence Star",
        diameter: "1,391,000 km",
        mass: "1.989 × 10³⁰ kg",
        temperature: "5,778 K (surface)",
        facts: "The Sun contains 99.86% of the Solar System's mass and provides the energy that sustains life on Earth. It's about 4.6 billion years old.",
        composition: "Hydrogen (73%), Helium (25%), Other elements (2%)",
        rotationPeriod: "25-35 days (varies by latitude)"
    },
    mercury: {
        name: "Mercury",
        type: "Terrestrial Planet",
        diameter: "4,879 km",
        mass: "3.285 × 10²³ kg",
        distanceFromSun: "57.9 million km",
        orbitalPeriod: "88 Earth days",
        rotationPeriod: "59 Earth days",
        temperature: "-173°C to 427°C",
        moons: "0",
        facts: "Mercury is the smallest planet and has the most eccentric orbit. Despite being closest to the Sun, it's not the hottest planet."
    },
    venus: {
        name: "Venus",
        type: "Terrestrial Planet",
        diameter: "12,104 km",
        mass: "4.867 × 10²⁴ kg",
        distanceFromSun: "108.2 million km",
        orbitalPeriod: "225 Earth days",
        rotationPeriod: "243 Earth days (retrograde)",
        temperature: "462°C (average)",
        moons: "0",
        atmosphere: "96.5% CO₂, 3.5% Nitrogen",
        facts: "Venus is the hottest planet due to its thick atmosphere causing a runaway greenhouse effect. It rotates backwards compared to most planets."
    },
    earth: {
        name: "Earth",
        type: "Terrestrial Planet",
        diameter: "12,742 km",
        mass: "5.972 × 10²⁴ kg",
        distanceFromSun: "149.6 million km",
        orbitalPeriod: "365.25 days",
        rotationPeriod: "24 hours",
        temperature: "-88°C to 58°C",
        moons: "1 (The Moon)",
        atmosphere: "78% Nitrogen, 21% Oxygen, 1% Other",
        facts: "Earth is the only known planet to harbor life. About 71% of its surface is covered by water, earning it the nickname 'The Blue Planet'."
    },
    mars: {
        name: "Mars",
        type: "Terrestrial Planet",
        diameter: "6,779 km",
        mass: "6.39 × 10²³ kg",
        distanceFromSun: "227.9 million km",
        orbitalPeriod: "687 Earth days",
        rotationPeriod: "24.6 hours",
        temperature: "-87°C to -5°C",
        moons: "2 (Phobos and Deimos)",
        atmosphere: "95% CO₂, 3% Nitrogen",
        facts: "Mars is known as the Red Planet due to iron oxide on its surface. It has the largest volcano in the solar system, Olympus Mons, which is about 22 km high."
    },
    jupiter: {
        name: "Jupiter",
        type: "Gas Giant",
        diameter: "139,820 km",
        mass: "1.898 × 10²⁷ kg",
        distanceFromSun: "778.5 million km",
        orbitalPeriod: "12 Earth years",
        rotationPeriod: "10 hours",
        temperature: "-108°C (cloud tops)",
        moons: "95 known moons",
        notableMoons: "Io, Europa, Ganymede, Callisto",
        facts: "Jupiter is the largest planet in our solar system. Its Great Red Spot is a storm that has been raging for at least 400 years and is larger than Earth."
    },
    saturn: {
        name: "Saturn",
        type: "Gas Giant",
        diameter: "116,460 km",
        mass: "5.683 × 10²⁶ kg",
        distanceFromSun: "1.4 billion km",
        orbitalPeriod: "29 Earth years",
        rotationPeriod: "10.7 hours",
        temperature: "-138°C (cloud tops)",
        moons: "146 known moons",
        notableMoons: "Titan, Enceladus, Mimas",
        facts: "Saturn's rings are made of billions of pieces of ice and rock. The planet is so light that it would float in water if there were a bathtub big enough!"
    },
    uranus: {
        name: "Uranus",
        type: "Ice Giant",
        diameter: "50,724 km",
        mass: "8.681 × 10²⁵ kg",
        distanceFromSun: "2.9 billion km",
        orbitalPeriod: "84 Earth years",
        rotationPeriod: "17.2 hours (retrograde)",
        temperature: "-197°C",
        moons: "27 known moons",
        notableMoons: "Titania, Oberon, Miranda",
        facts: "Uranus rotates on its side, likely due to a massive collision. It was the first planet discovered using a telescope, in 1781."
    },
    neptune: {
        name: "Neptune",
        type: "Ice Giant",
        diameter: "49,244 km",
        mass: "1.024 × 10²⁶ kg",
        distanceFromSun: "4.5 billion km",
        orbitalPeriod: "165 Earth years",
        rotationPeriod: "16 hours",
        temperature: "-201°C",
        moons: "14 known moons",
        notableMoons: "Triton, Proteus",
        facts: "Neptune has the strongest winds in the solar system, reaching speeds of 2,100 km/h. It was discovered in 1846 through mathematical predictions rather than observation."
    }
};

// Helper to load texture with error handling
function loadTexture(url, fallbackColor) {
    return new Promise((resolve) => {
        textureLoader.load(
            url,
            (texture) => resolve(texture), // Success
            undefined,
            () => { 
                console.warn(`Failed to load texture: ${url}`);
                resolve(null); // Error
            }
        );
    });
}

// Initialize the scene
function init() {
    // Scene
    scene = new THREE.Scene();

    // Camera
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 3;

    // Renderer
    const canvas = document.getElementById('canvas');
    renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);

    // Lights
    const ambientLight = new THREE.AmbientLight(0x404040, 1.5); // Increased intensity for textures
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 1.2);
    directionalLight.position.set(5, 3, 5);
    scene.add(directionalLight);

    // Detailed Earth for Main View
    const earthGeometry = new THREE.SphereGeometry(1, 64, 64);
    
    // Load Earth textures directly
    const earthMap = textureLoader.load(textureBase + '2k_earth_daymap.jpg');
    
    const earthMaterial = new THREE.MeshPhongMaterial({
        map: earthMap,
        shininess: 15,
        color: 0xffffff
    });

    earth = new THREE.Mesh(earthGeometry, earthMaterial);
    scene.add(earth);

    // Clouds
    const cloudsGeometry = new THREE.SphereGeometry(1.01, 64, 64);
    const cloudsMap = textureLoader.load(textureBase + '2k_earth_clouds.jpg');
    
    const cloudsMaterial = new THREE.MeshPhongMaterial({
        map: cloudsMap,
        transparent: true,
        opacity: 0.8,
        blending: THREE.AdditiveBlending,
        side: THREE.DoubleSide,
        depthWrite: false,
    });

    clouds = new THREE.Mesh(cloudsGeometry, cloudsMaterial);
    scene.add(clouds);

    // Stars
    createStars();

    // Solar System
    createSolarSystem();

    // Raycaster for clicking planets
    raycaster = new THREE.Raycaster();
    mouse = new THREE.Vector2();

    // Event listeners
    canvas.addEventListener('mousedown', onMouseDown);
    canvas.addEventListener('mousemove', onMouseMove);
    canvas.addEventListener('mouseup', onMouseUp);
    canvas.addEventListener('click', onCanvasClick);
    canvas.addEventListener('wheel', onWheel);
    canvas.addEventListener('contextmenu', (e) => e.preventDefault());
    window.addEventListener('resize', onWindowResize);

    document.getElementById('loading').style.display = 'none';

    animate();
}

// Create starfield
function createStars() {
    const starsGeometry = new THREE.BufferGeometry();
    const starsMaterial = new THREE.PointsMaterial({
        color: 0xffffff,
        size: 0.7,
        transparent: true
    });

    const starsVertices = [];
    for (let i = 0; i < 10000; i++) {
        const x = (Math.random() - 0.5) * 2000;
        const y = (Math.random() - 0.5) * 2000;
        const z = (Math.random() - 0.5) * 2000;
        starsVertices.push(x, y, z);
    }

    starsGeometry.setAttribute('position', new THREE.Float32BufferAttribute(starsVertices, 3));
    stars = new THREE.Points(starsGeometry, starsMaterial);
    scene.add(stars);
}

// Create solar system
function createSolarSystem() {
    solarSystemGroup = new THREE.Group();
    solarSystemGroup.visible = false;
    scene.add(solarSystemGroup);

    // Planet data: [distance, size, fallback_color, name, orbitSpeed]
    const planetData = [
        [0, 4, 0xFDB813, 'sun', 0],
        [8, 0.4, 0x8C7853, 'mercury', 0.04],
        [11, 0.9, 0xFFC649, 'venus', 0.015],
        [15, 1, 0x4169E1, 'earth', 0.01],
        [19, 0.5, 0xCD5C5C, 'mars', 0.008],
        [28, 2.5, 0xDAA520, 'jupiter', 0.002],
        [37, 2.2, 0xF4A460, 'saturn', 0.0009],
        [45, 1.5, 0x4FD0E0, 'uranus', 0.0004],
        [52, 1.4, 0x4169E1, 'neptune', 0.0001]
    ];

    planetData.forEach(([distance, size, color, name, orbitSpeed]) => {
        const geometry = new THREE.SphereGeometry(size, 32, 32);
        
        // Define material variable
        let material;

        // Try to get texture URL
        const textureUrl = planetTextures[name] ? (textureBase + planetTextures[name]) : null;

        // Create initial material with fallback color
        // If texture loads, it will update automatically
        if (name === 'sun') {
            material = new THREE.MeshBasicMaterial({ 
                color: color // Start with color
            });
            if (textureUrl) {
                textureLoader.load(textureUrl, (tex) => {
                    material.map = tex;
                    material.color.setHex(0xffffff); // Reset color to white so texture shows
                    material.needsUpdate = true;
                });
            }
        } else {
            material = new THREE.MeshPhongMaterial({ 
                color: color // Start with color
            });
            if (textureUrl) {
                textureLoader.load(textureUrl, (tex) => {
                    material.map = tex;
                    material.color.setHex(0xffffff); // Reset color to white
                    material.needsUpdate = true;
                });
            }
        }

        const planet = new THREE.Mesh(geometry, material);

        // Create orbit line
        if (name !== 'sun') {
            const orbitGeometry = new THREE.RingGeometry(distance - 0.1, distance + 0.1, 128);
            const orbitMaterial = new THREE.MeshBasicMaterial({
                color: 0x444444,
                side: THREE.DoubleSide,
                transparent: true,
                opacity: 0.2
            });
            const orbit = new THREE.Mesh(orbitGeometry, orbitMaterial);
            orbit.rotation.x = Math.PI / 2;
            solarSystemGroup.add(orbit);
        }

        // Add rings to Saturn
        if (name === 'saturn') {
            const ringGeometry = new THREE.RingGeometry(size * 1.2, size * 2, 64);
            // Try to load ring texture
            const ringTexUrl = textureBase + '2k_saturn_ring_alpha.png';
            const ringMaterial = new THREE.MeshBasicMaterial({
                color: 0xC9A86A, // Fallback color
                side: THREE.DoubleSide,
                transparent: true,
                opacity: 0.8
            });

            textureLoader.load(ringTexUrl, (tex) => {
                ringMaterial.map = tex;
                ringMaterial.color.setHex(0xffffff);
                ringMaterial.needsUpdate = true;
            }, undefined, () => {
                 // Keep fallback color if fails
            });

            const ring = new THREE.Mesh(ringGeometry, ringMaterial);
            ring.rotation.x = Math.PI / 2;
            planet.add(ring);
        }

        // Add glow to sun
        if (name === 'sun') {
            const glowGeometry = new THREE.SphereGeometry(size * 1.2, 32, 32);
            const glowMaterial = new THREE.MeshBasicMaterial({
                color: 0xFDB813,
                transparent: true,
                opacity: 0.3
            });
            const glow = new THREE.Mesh(glowGeometry, glowMaterial);
            planet.add(glow);
        }

        planet.position.x = distance;
        planet.userData = { 
            distance, 
            orbitSpeed, 
            angle: Math.random() * Math.PI * 2,
            name,
            size 
        };

        solarSystemGroup.add(planet);
        planets[name] = planet;
    });
}

// Mouse event handlers
function onMouseDown(e) {
    mouseDown = true;
    mouseButton = e.button;
    mouseX = e.clientX;
    mouseY = e.clientY;
}

function onMouseMove(e) {
    if (!mouseDown) return;

    const deltaX = e.clientX - mouseX;
    const deltaY = e.clientY - mouseY;

    if (mouseButton === 0) {
        // Left click - rotate
        targetRotationY += deltaX * 0.005;
        targetRotationX += deltaY * 0.005;
        targetRotationX = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, targetRotationX));
    } else if (mouseButton === 2) {
        // Right click - pan
        camera.position.x -= deltaX * 0.001 * camera.position.z;
        camera.position.y += deltaY * 0.001 * camera.position.z;
    }

    mouseX = e.clientX;
    mouseY = e.clientY;
}

function onMouseUp() {
    mouseDown = false;
}

function onCanvasClick(e) {
    if (!showSolarSystem) return;

    // Calculate mouse position in normalized device coordinates
    const rect = renderer.domElement.getBoundingClientRect();
    mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

    // Update raycaster
    raycaster.setFromCamera(mouse, camera);

    // Check for intersections with planets
    const clickablePlanets = Object.values(planets).filter(p => p.visible);
    const intersects = raycaster.intersectObjects(clickablePlanets, true);

    if (intersects.length > 0) {
        const clickedObject = intersects[0].object;
        // Find the planet (in case we clicked on a child like Saturn's rings)
        let planetMesh = clickedObject;
        while (planetMesh.parent && !planetMesh.userData.name) {
            planetMesh = planetMesh.parent;
        }
        
        if (planetMesh.userData.name) {
            viewPlanet(planetMesh.userData.name); // Move camera to planet
            showPlanetInfo(planetMesh.userData.name);
        }
    }
}

function onWheel(e) {
    e.preventDefault();
    const delta = e.deltaY * 0.001 * (showSolarSystem ? 5 : 1);
    // Use translateZ to move forward/backward along the viewing axis
    camera.translateZ(delta);
    
    // Simple clamp for Earth view only to prevent going inside
    if (!showSolarSystem && camera.position.length() < 1.2) {
         camera.position.setLength(1.2);
    }
    
    updateZoomLevel();
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

// Animation loop
function animate() {
    requestAnimationFrame(animate);

    if (showSolarSystem) {
        // Animate planets in orbits
        solarSystemGroup.children.forEach(child => {
            // Check isOrbiting flag
            if (child.userData.orbitSpeed && isOrbiting) {
                child.userData.angle += child.userData.orbitSpeed;
                child.position.x = Math.cos(child.userData.angle) * child.userData.distance;
                child.position.z = Math.sin(child.userData.angle) * child.userData.distance;
                child.rotation.y += 0.01;
            }
        });

        // Make sun glow/pulse (rotate texture)
        if (planets.sun) {
            planets.sun.rotation.y -= 0.0005;
        }
    } else {
        // Smooth rotation for Earth view
        rotationX += (targetRotationX - rotationX) * 0.1;
        rotationY += (targetRotationY - rotationY) * 0.1;

        earth.rotation.x = rotationX;
        earth.rotation.y = rotationY;

        if (showClouds) {
            clouds.rotation.x = rotationX;
            clouds.rotation.y = rotationY + 0.0005; // Clouds move slightly faster
        }

        // Auto rotation
        if (isRotating && !mouseDown) {
            targetRotationY += 0.001;
        }
    }

    renderer.render(scene, camera);
}

// Control functions
function resetView() {
    targetRotationX = 0;
    targetRotationY = 0;
    camera.position.set(0, 0, 3);
    camera.lookAt(0, 0, 0);
    currentTarget.set(0, 0, 0);
    updateZoomLevel();
    isOrbiting = true; // Resume orbits when resetting view
}

function toggleRotation() {
    // Acts as a Play/Pause button for both modes
    if (showSolarSystem) {
        isOrbiting = !isOrbiting;
    } else {
        isRotating = !isRotating;
    }
}

function toggleStars() {
    showStars = !showStars;
    stars.visible = showStars;
}

function toggleSolarSystem() {
    showSolarSystem = !showSolarSystem;
    solarSystemGroup.visible = showSolarSystem;
    
    if (showSolarSystem) {
        // Hide Earth and clouds when showing solar system
        earth.visible = false;
        clouds.visible = false;
        camera.position.set(0, 30, 60);
        camera.lookAt(0, 0, 0);
        currentTarget.set(0, 0, 0);
        isOrbiting = true; // Ensure orbits are active when entering Solar System view
    } else {
        // Show Earth when hiding solar system
        earth.visible = true;
        clouds.visible = showClouds;
        resetView();
    }
    updateZoomLevel();
}

function viewPlanet(planetName) {
    if (!showSolarSystem && planetName !== 'earth') {
        toggleSolarSystem();
    } else if (showSolarSystem && planetName === 'earth') {
        toggleSolarSystem();
        return;
    }

    if (planetName === 'earth' && !showSolarSystem) {
        resetView();
        return;
    }

    const planet = planets[planetName];
    if (planet) {
        const distance = planet.userData.size * 3 + 5;
        camera.position.set(
            planet.position.x,
            distance * 0.5,
            planet.position.z + distance
        );
        camera.lookAt(planet.position);
        currentTarget.copy(planet.position); // Update current target
        isOrbiting = false; // Stop orbits to view the planet
        updateZoomLevel();
    }
}

function zoomIn() {
    const step = showSolarSystem ? 2 : 0.5;
    camera.translateZ(-step); // Move forward along view axis
    updateZoomLevel();
}

function zoomOut() {
    const step = showSolarSystem ? 2 : 0.5;
    camera.translateZ(step); // Move backward along view axis
    updateZoomLevel();
}

function updateZoomLevel() {
    // Calculate approximate zoom percentage based on distance to target
    const distance = camera.position.distanceTo(currentTarget);
    const maxDist = showSolarSystem ? 100 : 10;
    const minDist = showSolarSystem ? 5 : 1.5;
    
    // Clamp visualization
    const pct = Math.max(0, Math.min(100, (1 - (distance - minDist) / (maxDist - minDist)) * 100));
    
    document.getElementById('zoomLevel').textContent = `• Zoom: ${Math.round(pct)}%`;
}

// Navigation bar toggle
function toggleNavBar() {
    const navBar = document.getElementById('navBar');
    navBar.classList.toggle('hidden');
}

// Planet info panel functions
function showPlanetInfo(planetName) {
    const info = planetInfo[planetName];
    if (!info) return;

    const panel = document.getElementById('planetInfo');
    const nameEl = document.getElementById('planetName');
    const detailsEl = document.getElementById('planetDetails');

    nameEl.textContent = info.name;
    
    let detailsHTML = '';
    for (const [key, value] of Object.entries(info)) {
        if (key !== 'name' && key !== 'facts') {
            const label = key.replace(/([A-Z])/g, ' $1').trim();
            const formattedLabel = label.charAt(0).toUpperCase() + label.slice(1);
            detailsHTML += `
                <div class="info-row">
                    <div class="info-label">${formattedLabel}</div>
                    <div class="info-value">${value}</div>
                </div>
            `;
        }
    }
    
    if (info.facts) {
        detailsHTML += `
            <div class="info-row">
                <div class="info-label">Interesting Facts</div>
                <div class="info-value">${info.facts}</div>
            </div>
        `;
    }

    detailsEl.innerHTML = detailsHTML;
    panel.classList.add('visible');
}

function closePlanetInfo() {
    const panel = document.getElementById('planetInfo');
    panel.classList.remove('visible');
}

// Start the application
init();
