// Global variables
var scene, camera, renderer;
var earth, clouds, stars, solarSystemGroup;
var planets = [];
var planetMeshes = {};
var raycaster, mouse;

// Settings
var isRotating = true;
var isOrbiting = true;
var showStars = true;
var showClouds = true;
var showSolarSystem = false;

// Mouse variables
var mouseDown = false;
var mouseX = 0, mouseY = 0;
var targetRotationX = 0, targetRotationY = 0;
var rotationX = 0, rotationY = 0;
var currentTarget = new THREE.Vector3(0, 0, 0);

// Texture Loader
var textureLoader = new THREE.TextureLoader();
textureLoader.setCrossOrigin('anonymous');
var textureBase = 'https://solartextures.b-cdn.net/';

// Planet Info
var planetInfo = {
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

init();

function init() {
    scene = new THREE.Scene();

    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 3;

    var canvas = document.getElementById('canvas');
    renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);

    var ambientLight = new THREE.AmbientLight(0x404040, 1.5);
    scene.add(ambientLight);

    var directionalLight = new THREE.DirectionalLight(0xffffff, 1.2);
    directionalLight.position.set(5, 3, 5);
    scene.add(directionalLight);

    createMainEarth();
    createStars();
    createSolarSystem();

    raycaster = new THREE.Raycaster();
    mouse = new THREE.Vector2();
    
    canvas.addEventListener('mousedown', onMouseDown);
    canvas.addEventListener('mousemove', onMouseMove);
    canvas.addEventListener('mouseup', onMouseUp);
    canvas.addEventListener('click', onCanvasClick);
    canvas.addEventListener('wheel', onWheel);
    window.addEventListener('resize', onWindowResize);

    document.getElementById('loading').style.display = 'none';

    animate();
}

function createMainEarth() {
    var geometry = new THREE.SphereGeometry(1, 32, 32);
    var texture = textureLoader.load(textureBase + '2k_earth_daymap.jpg');
    var material = new THREE.MeshPhongMaterial({ map: texture });
    
    earth = new THREE.Mesh(geometry, material);
    scene.add(earth);

    var cloudGeo = new THREE.SphereGeometry(1.01, 32, 32);
    var cloudTex = textureLoader.load(textureBase + '2k_earth_clouds.jpg');
    var cloudMat = new THREE.MeshPhongMaterial({ 
        map: cloudTex,
        transparent: true,
        opacity: 0.8
    });
    
    clouds = new THREE.Mesh(cloudGeo, cloudMat);
    scene.add(clouds);
}

function createStars() {
    var geometry = new THREE.BufferGeometry();
    var vertices = [];

    for (var i = 0; i < 5000; i++) {
        var x = (Math.random() - 0.5) * 2000;
        var y = (Math.random() - 0.5) * 2000;
        var z = (Math.random() - 0.5) * 2000;
        vertices.push(x, y, z);
    }

    geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
    var material = new THREE.PointsMaterial({ color: 0xffffff, size: 0.7 });
    
    stars = new THREE.Points(geometry, material);
    scene.add(stars);
}

function createSolarSystem() {
    solarSystemGroup = new THREE.Group();
    solarSystemGroup.visible = false;
    scene.add(solarSystemGroup);

    var data = [
        [0, 4, 'sun', 0, '2k_sun.jpg'],
        [8, 0.4, 'mercury', 0.04, '2k_mercury.jpg'],
        [11, 0.9, 'venus', 0.015, '2k_venus_surface.jpg'],
        [15, 1, 'earth', 0.01, '2k_earth_daymap.jpg'],
        [19, 0.5, 'mars', 0.008, '2k_mars.jpg'],
        [28, 2.5, 'jupiter', 0.002, '2k_jupiter.jpg'],
        [37, 2.2, 'saturn', 0.0009, '2k_saturn.jpg'],
        [45, 1.5, 'uranus', 0.0004, '2k_uranus.jpg'],
        [52, 1.4, 'neptune', 0.0001, '2k_neptune.jpg']
    ];

    for (var i = 0; i < data.length; i++) {
        var distance = data[i][0];
        var size = data[i][1];
        var name = data[i][2];
        var speed = data[i][3];
        var texFile = data[i][4];

        var geometry = new THREE.SphereGeometry(size, 32, 32);
        var material;

        if (name === 'sun') {
            material = new THREE.MeshBasicMaterial({ color: 0xFFFF00 });
            textureLoader.load(
                textureBase + texFile,
                function(texture) {
                    material.map = texture;
                    material.color.setHex(0xFFFFFF);
                    material.needsUpdate = true;
                },
                undefined,
                function(err) {
                    console.log("Sun texture failed, staying yellow.");
                }
            );
        } else {
            var texture = textureLoader.load(textureBase + texFile);
            material = new THREE.MeshPhongMaterial({ map: texture });
        }

        var planet = new THREE.Mesh(geometry, material);
        planet.position.x = distance;
        
        planet.name = name;
        planet.distance = distance;
        planet.orbitSpeed = speed;
        planet.angle = Math.random() * 6.28;
        planet.mySize = size;

        if (name !== 'sun') {
            var ringGeo = new THREE.RingGeometry(distance - 0.1, distance + 0.1, 64);
            var ringMat = new THREE.MeshBasicMaterial({ color: 0x555555, side: THREE.DoubleSide });
            var ring = new THREE.Mesh(ringGeo, ringMat);
            ring.rotation.x = Math.PI / 2;
            solarSystemGroup.add(ring);
        }

        if (name === 'saturn') {
            var saturnRingGeo = new THREE.RingGeometry(size * 1.2, size * 2, 32);
            var saturnRingTex = textureLoader.load(textureBase + '2k_saturn_ring_alpha.png');
            var saturnRingMat = new THREE.MeshBasicMaterial({ 
                map: saturnRingTex,
                side: THREE.DoubleSide,
                transparent: true 
            });
            var saturnRing = new THREE.Mesh(saturnRingGeo, saturnRingMat);
            saturnRing.rotation.x = Math.PI / 2;
            planet.add(saturnRing);
        }

        solarSystemGroup.add(planet);
        planets.push(planet);
        planetMeshes[name] = planet;
    }
}

function animate() {
    requestAnimationFrame(animate);

    if (showSolarSystem) {
        for (var i = 0; i < planets.length; i++) {
            var p = planets[i];
            if (p.orbitSpeed && isOrbiting) {
                p.angle += p.orbitSpeed;
                p.position.x = Math.cos(p.angle) * p.distance;
                p.position.z = Math.sin(p.angle) * p.distance;
                p.rotation.y += 0.01;
            }
            if (p.name === 'sun') {
                p.rotation.y -= 0.002;
            }
        }
    } else {
        rotationX += (targetRotationX - rotationX) * 0.1;
        rotationY += (targetRotationY - rotationY) * 0.1;

        earth.rotation.x = rotationX;
        earth.rotation.y = rotationY;
        clouds.rotation.x = rotationX;
        clouds.rotation.y = rotationY;

        if (isRotating && !mouseDown) {
            targetRotationY += 0.001;
        }
    }

    renderer.render(scene, camera);
}

function onMouseDown(event) {
    mouseDown = true;
    mouseX = event.clientX;
    mouseY = event.clientY;
}

function onMouseMove(event) {
    if (!mouseDown) return;
    var deltaX = event.clientX - mouseX;
    var deltaY = event.clientY - mouseY;
    targetRotationY += deltaX * 0.005;
    targetRotationX += deltaY * 0.005;
    mouseX = event.clientX;
    mouseY = event.clientY;
}

function onMouseUp() { mouseDown = false; }

function onWheel(event) {
    var delta = event.deltaY * 0.001;
    camera.translateZ(delta);
    updateZoomLevel();
}

function onCanvasClick(event) {
    if (!showSolarSystem) return;
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
    raycaster.setFromCamera(mouse, camera);
    var intersects = raycaster.intersectObjects(planets);
    if (intersects.length > 0) {
        var object = intersects[0].object;
        viewPlanet(object.name);
        showPlanetInfo(object.name);
    }
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

function resetView() {
    targetRotationX = 0;
    targetRotationY = 0;
    camera.position.set(0, 0, 3);
    camera.lookAt(0, 0, 0);
    currentTarget.set(0, 0, 0);
    isOrbiting = true;
    updateZoomLevel();
}

function toggleRotation() {
    if (showSolarSystem) { isOrbiting = !isOrbiting; } else { isRotating = !isRotating; }
}

function toggleStars() {
    showStars = !showStars;
    stars.visible = showStars;
}

function toggleSolarSystem() {
    showSolarSystem = !showSolarSystem;
    solarSystemGroup.visible = showSolarSystem;
    if (showSolarSystem) {
        earth.visible = false;
        clouds.visible = false;
        camera.position.set(0, 30, 60);
        camera.lookAt(0, 0, 0);
    } else {
        earth.visible = true;
        clouds.visible = true;
        resetView();
    }
}

function viewPlanet(name) {
    if (name === 'earth' && !showSolarSystem) { resetView(); return; }
    if (!showSolarSystem) toggleSolarSystem();
    var targetPlanet = planetMeshes[name];
    if (targetPlanet) {
        var dist = targetPlanet.mySize * 3 + 5;
        camera.position.set(targetPlanet.position.x, dist, targetPlanet.position.z + dist);
        camera.lookAt(targetPlanet.position);
        currentTarget.copy(targetPlanet.position);
        isOrbiting = false;
    }
}

function showPlanetInfo(name) {
    var info = planetInfo[name];
    if (info) {
        var panel = document.getElementById('planetInfo');
        document.getElementById('planetName').innerText = info.name;
        
        var detailsHTML = '';
        for (var key in info) {
            if (key !== 'name' && key !== 'facts') {
                // Format keys (e.g., "distanceFromSun" -> "Distance From Sun")
                var label = key.replace(/([A-Z])/g, ' $1').trim();
                label = label.charAt(0).toUpperCase() + label.slice(1);
                
                detailsHTML += '<div class="info-row">' +
                    '<div class="info-label">' + label + '</div>' +
                    '<div class="info-value">' + info[key] + '</div>' +
                    '</div>';
            }
        }
        
        if (info.facts) {
            detailsHTML += '<div class="info-row">' +
                '<div class="info-label">Interesting Facts</div>' +
                '<div class="info-value">' + info.facts + '</div>' +
                '</div>';
        }

        document.getElementById('planetDetails').innerHTML = detailsHTML;
        panel.classList.add('visible');
    }
}

function closePlanetInfo() {
    document.getElementById('planetInfo').classList.remove('visible');
}

function zoomIn() { camera.translateZ(-2); updateZoomLevel(); }
function zoomOut() { camera.translateZ(2); updateZoomLevel(); }

function updateZoomLevel() {
    var dist = camera.position.distanceTo(currentTarget);
    var displayZoom = Math.round(100 - dist);
    if (displayZoom < 0) displayZoom = 0;
    document.getElementById('zoomLevel').innerText = "Zoom: " + displayZoom + "%";
}

function toggleNavBar() {
    var nav = document.getElementById('navBar');
    if (nav.classList.contains('hidden')) { nav.classList.remove('hidden'); } else { nav.classList.add('hidden'); }
}
