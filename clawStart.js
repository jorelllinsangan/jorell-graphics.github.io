////////////////////////////////////////////////////////////////////////////////

/* COMP 3490 A1 Skeleton for Claw Machine (Barebones Edition)
 * Note that you may make use of the skeleton provided, or start from scratch.
 * The choice is up to you.
 * Read the assignment directions carefully
 * Your claw mechanism should be created such that it is represented hierarchically
 * You might consider looking at THREE.Group and THREE.Object3D for reference
 * If you want to play around with the canvas position, or other HTML/JS level constructs
 * you are welcome to do so.


 /*global variables, coordinates, clock etc.  */

var camera, scene, renderer;
var cameraControls;
var egocentric = false;

var clock = new THREE.Clock();


function fillScene() {
    'use strict';
    Physijs.scripts.worker = 'physijs_worker.js';
    Physijs.scripts.ammo = 'ammo.js';
    scene = new Physijs.Scene();
    scene.setGravity(new THREE.Vector3(0,-30,0));
    scene.fog = new THREE.Fog( 0x808080, 2000, 4000 );

    // Some basic default lighting - in A2 complexity will be added

    scene.add( new THREE.AmbientLight( 0x222222 ) );

    function getDirectionalLight () {
        var light = new THREE.DirectionalLight(0xffffff,1);
        light.position.set(0, 1000, 1000);
        light.target.position.set(0, 0, 0);

        light.shadow.camera.near = 0.5;
        light.shadow.camera.far = 10000;
        light.shadow.camera.left = -500;
        light.shadow.camera.bottom = -500;
        light.shadow.camera.right = 500;
        light.shadow.camera.top = 500;

        light.castShadow = true;
        return light;
    }

    function getSpotLight(color) {
        var spotLight = new THREE.SpotLight(color, 2);
        spotLight.position.set( 0, 800, 0);
        spotLight.angle = Math.PI / 8;
        spotLight.penumbra = .05;
        // spotLight.power = 600;
        spotLight.distance = 400;
        spotLight.castShadow = true;
        spotLight.shadow.mapSize.width = 512;
        spotLight.shadow.mapSize.height = 512;
        spotLight.shadow.camera.near = 10;
        spotLight.shadow.camera.far = 100;
        return spotLight;
    }

    // 2 lights make the spotlight color green
    var spotLight2 = getSpotLight(0x00ff00);
    var spotLight = getSpotLight(0xf0f00f);
    var dirLight = getDirectionalLight();
    scene.add(spotLight2);
    scene.add(dirLight);
    scene.add(spotLight);
    var lightHelper = new THREE.SpotLightHelper( spotLight );
    scene.add( lightHelper );

    // var pointLight = new THREE.PointLight(0xff0000, 1, 50, 2);
    // pointLight.position.set(0, 500, 0);
    // pointLight.castShadow = true;
    // scene.add(pointLight);


    var planeGeometry = new THREE.PlaneGeometry( 300, 300 );
    var planeMaterial = new THREE.MeshStandardMaterial( { color: 0x00ff00 } )
    var plane = new THREE.Mesh( planeGeometry, planeMaterial );
    plane.rotation.x = -Math.PI/2;
    plane.scale.set(1000, 1000);
    plane.receiveShadow = true;
    scene.add( plane );

    // var helper = new THREE.CameraHelper( light.shadow.camera );
    // helper.position.set(300);
    // scene.add( helper );

    var floor = initFloor();
    scene.add(floor);

    //Visualize the Axes - Useful for debugging, can turn this off if desired
    var axes = new THREE.AxisHelper(150);
    axes.position.y = 1;
    scene.add(axes);


    var button = new Physijs.CylinderMesh(new THREE.CylinderGeometry(5, 5, 5), new THREE.MeshLambertMaterial({color: 0x000088}), 0 );
    button.position.set(110, 425, 170);
    button.rotation.x = Math.PI/4;
    scene.add(button);


    var spriteMaterial = new THREE.SpriteMaterial({
        map: new THREE.ImageUtils.loadTexture('assets/glow.png'),
        useScreenCoordinates: false,
        color: 0x0000ff, transparent: false, blending: THREE.AdditiveBlending
    });
    var sprite = new THREE.Sprite(spriteMaterial);
    sprite.scale.set(50, 50, 1.0);
    button.add(sprite);

    generateMarquee(scene);
    // createCoinSlot(scene);
    drawClawMachine();
    var coinSlotBase = new THREE.Object3D();
    var left = new Physijs.BoxMesh(new THREE.BoxGeometry(10, 20, 2.5), new THREE.MeshLambertMaterial({color: 0x000088}), 0);
    var right = new Physijs.BoxMesh(new THREE.BoxGeometry(5,20,2.5), new THREE.MeshLambertMaterial({color: 0x000088}), 0);
    coinSlotBase.add(left);
    coinSlotBase.add(right);
    coinSlotBase.position.set(110, 300, 150);

    var sprite2 = new THREE.Sprite(spriteMaterial);
    sprite2.scale.set(50, 50, 1.0);
    coinSlotBase.add(sprite2);
    right.position.set(10, 0, 0);
    scene.add(coinSlotBase);
}

function drawClawMachine(prizes) {

	//////////////////////////////
	// Some simple material definitions - This may become more complex in A2
    var bodyMaterial = new THREE.MeshLambertMaterial();
    bodyMaterial.color.setRGB( 0.5, 0.5, 0.5 );

    var refPointMaterial = new THREE.MeshLambertMaterial();
    refPointMaterial.color.setRGB(1,0,0);
    generateBase(scene, bodyMaterial);
    generateStands(scene, bodyMaterial);
    generateWalls(scene, bodyMaterial);
    generateClawMechanism(scene);
    generateControlPanel(scene, bodyMaterial);
    generateChute(scene);

    if (prizes) {
        createPrizes(scene, 50);
    }
}

function generateMarquee (scene) {
    var loader = new THREE.FontLoader();
    loader.load( 'assets/dogefont2.json', function ( font ) {
        var xMid, text;
        var textShape = new THREE.BufferGeometry();
        var matLite = new THREE.MeshPhongMaterial( {
            color: 0xffd700, specular:0x996633, shininess:100,
            side: THREE.DoubleSide
        } );
        var message = "DOGE MINER";
        var shapes = font.generateShapes( message, 30, 2 );
        var geometry = new THREE.ShapeGeometry( shapes );
        geometry.computeBoundingBox();
        xMid = - 0.5 * ( geometry.boundingBox.max.x - geometry.boundingBox.min.x );
        geometry.translate( xMid, 0, 0 );
        textShape.fromGeometry( geometry );
        text = new THREE.Mesh( textShape, matLite );
        text.position.set(0,810,154);
        // text.rotateY(Math.PI);
        scene.add( text );
        var marquee1 = new THREE.PointLight(0x00ff00,5,100);
        marquee1.position.set(0,5,20);
        text.add(marquee1);
        var marquee2 = new THREE.PointLight(0x00ff00,5,100);
        marquee2.position.set(-50,5,20);
        text.add(marquee2);
        var marquee3 = new THREE.PointLight(0x00ff00,5,100);
        marquee3.position.set(60,5,20);
        text.add(marquee3);
    } );

}

function createPrizes(scene, numPrizes) {
    var refPointMaterial = new THREE.MeshLambertMaterial();
    refPointMaterial.color.setRGB(1,0,0);
    var zPrice;
    var xPrice;
    var yPrice;

    var loader = new THREE.TextureLoader();
    var texture = loader.load("assets/doge.jpg");
    var material = new THREE.MeshPhongMaterial({map: THREE.ImageUtils.loadTexture("assets/doge.png")});
    texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(512, 512);
    // The base
    var pMat = Physijs.createMaterial(material, .8, .4)

    boxGeom = new THREE.BoxGeometry(30,30,30);
    sphereGeom = new THREE.SphereGeometry(20,32,32);
    var scaler = 10;
    cone_geometry = new THREE.CylinderGeometry( 0 * scaler, 2  * scaler, 4  * scaler, 32  * scaler )
    coinGeom = new THREE.CylinderGeometry(20,20,3, 32);

    for (var i = 0; i < numPrizes; i ++) {
        zPrice = getRandomInt(-100, 100);
        yPrice = getRandomInt(500, 550);
        xPrice = zPrice >= 20 ? getRandomInt(25, 100) : getRandomInt(-100, 100);
        switch (getRandomInt(0,3)) {
            case 0:
                prize = new Physijs.BoxMesh(boxGeom, pMat);
                break;
            case 1:
                prize = new Physijs.SphereMesh(sphereGeom, pMat);
                break;
            case 2:
                prize = new Physijs.ConeMesh(cone_geometry, pMat);
                break;
            case 3:
                // pMat.repeat.scale(1, 1);
                prize = new Physijs.CylinderMesh(coinGeom, pMat);
                break;
        }

        prize.position.set(xPrice,yPrice ,zPrice);
        prize.castShadow = true;
        prize.receiveShadow = true;
        scene.add(prize);
    }
}

var mesh = null;
function initMesh() {
    var loader = new THREE.JSONLoader();
    var bodyMaterial = new THREE.MeshLambertMaterial();
    bodyMaterial.color.setRGB( 0.5, 0.5, 0.5 );
    group = new THREE.Object3D();
    loader.load('./Blender Mesh/base.json', function(geometry, materials) {
        mesh = new THREE.Mesh(geometry, bodyMaterial);
        mesh.scale.x = mesh.scale.y = mesh.scale.z = 100;
        mesh.translation = geometry.center();
        group.add(mesh);
        group.position.set(200, 200, 0);
        scene.add(group);
    });
}


function generateReflection () {

    var textureLoader2 = new THREE.TextureLoader();

    var texture2 = textureLoader2.load( "assets/reflectionblurred.png" );
    var material2 = Physijs.createMaterial(new THREE.MeshPhongMaterial( {map: texture2, reflectivity: 0.8} ), .8, .4);

    var reflectionGeometry = new THREE.PlaneGeometry( 300, 500 );
    var reflection = new Physijs.PlaneMesh( reflectionGeometry, material2, 0 );

    reflection.position.set(0,10, 400);
    reflection.scale.set(1,1,1);
    reflection.rotation.x = - Math.PI / 2;
    reflection.rotation.z = - Math.PI;
    reflection.recieveShadow = true;

    scene.add(reflection)
}

function createCoinSlot (scene) {
    left = new Physijs.BoxMesh(new THREE.BoxGeometry(10, 20, 5), {color: 0xfff000}, 0);
    right = new Physijs.BoxMesh(new THREE.BoxGeometry(5,10,5), {color: 0xfff000}, 0);
    left.position.set(300, 350, 0);
    right.position.set(300, 350, 0);
    scene.add(left);
    scene.add(right);
}

function initFloor () {
    var textureLoader = new THREE.TextureLoader();
    // var maxAnisotropy = renderer.getMaxAnisotropy();
    var texture1 = textureLoader.load( "assets/marble.png" );
    var material1 = new THREE.MeshPhongMaterial( { color: 0xffffff, map: texture1, reflectivity: 0.8} );
    // texture1.anisotropy = maxAnisotropy;
    texture1.wrapS = texture1.wrapT = THREE.RepeatWrapping;
    texture1.repeat.set( 512, 512 );

    var pMat = Physijs.createMaterial(material1, .8, .4);

    var geometry = new THREE.PlaneGeometry( 300, 300 );
    var mesh1 = new Physijs.PlaneMesh( geometry, pMat, 0 );
    mesh1.rotation.x = - Math.PI / 2;
    mesh1.scale.set( 1000, 1000, 1000 );
    mesh1.receiveShadow = true;

    mesh1.addEventListener('collision', (o, lv, av) => {
       scene.remove(o);
    });

    generateReflection(scene);
    return mesh1;
}

function generateBase(scene, bodyMaterial) {
    var base;
    var loader = new THREE.TextureLoader();
    var texture = loader.load("assets/doge.jpg");
    var material = new THREE.MeshPhongMaterial({map: THREE.ImageUtils.loadTexture("assets/doge.png")});
    texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(512, 512);
    // The base
    var pMat = Physijs.createMaterial(material, .8, .4)
    base = new Physijs.BoxMesh( new THREE.BoxGeometry( 300, 400, 300 ), pMat, 0);
    base.position.x = 0;
    base.position.y = 250;
    base.position.z = 0;
    base.castShadow = true;
    base.receiveShadow = true;

    scene.add( base );
}

function generateStands(scene, bodyMaterial) {
    var xy = [[1, 1], [1, -1], [-1, 1], [-1, -1]];
    var loader = new THREE.TextureLoader();
    var texture = loader.load("assets/doge.jpg");
    var material = new THREE.MeshPhongMaterial({map: THREE.ImageUtils.loadTexture("assets/doge.png")});
    texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(512, 512);
    // The base
    var pMat = Physijs.createMaterial(material, .8, .4)
    // Creates the stands
    var stand;
    for (var i = 0; i < xy.length; i++) {
        stand = new Physijs.BoxMesh( new THREE.BoxGeometry( 50, 400, 50 ), pMat ,0);
        stand.position.x = 125 * xy[i][0];
        stand.position.y = 650;
        stand.position.z = 125 * xy[i][1];
        stand.castShadow = true;
        stand.receiveShadow = true;
        scene.add( stand );
    }
}

function generateWalls(scene) {
    var wallMaterial = new THREE.MeshLambertMaterial({color: 0xffffff, transparent: true, opacity: 0.5})
    var roofMaterial = new THREE.MeshLambertMaterial({color: 0xff00ff});

    // front wall
    var chuteWallOrigin = new THREE.Object3D();
    chuteWallOrigin.position.set(0, 650, 147.5);
    topLeft = new Physijs.BoxMesh(new THREE.BoxGeometry(100, 300, 5), wallMaterial, 0);
    topLeft.position.set(-50, 700, 147.5);
    topRight = new Physijs.BoxMesh(new THREE.BoxGeometry(100, 400, 5), wallMaterial, 0);
    topRight.position.set(50, 650, 147.5);


    chuteWallOrigin.add(topLeft);
    scene.add(topRight);
    scene.add(topLeft);

    var wall = new Physijs.BoxMesh(new THREE.BoxGeometry(200, 400, 5), wallMaterial, 0);
    wall.position.set(0, 650, -148.5);

    scene.add(wall);

    wall = new Physijs.BoxMesh(new THREE.BoxGeometry(200, 400, 5), wallMaterial, 0);
    wall.position.set(148.5, 650, 0);
    wall.rotation.y = Math.PI/2;

    scene.add(wall);

    wall = new Physijs.BoxMesh(new THREE.BoxGeometry(200, 400, 5), wallMaterial, 0);
    wall.position.set(-148.5, 650, 0);
    wall.rotation.y = Math.PI/2;
    scene.add(wall);
    // roof
    wall = new Physijs.BoxMesh(new THREE.BoxGeometry(300, 5, 300), roofMaterial, 0);
    wall.position.set(0, 852.5, 0);
    wall.castShadow = true;


    scene.add(wall);

}

function generateClawMechanism (scene) {
    var trackMaterial = new THREE.MeshLambertMaterial({color: 0x000000});
    var crossbarMaterial = new THREE.MeshLambertMaterial({color: 0xfff000});
    var sliderMaterial = new THREE.MeshLambertMaterial({color: 0x000fff});
    var clawShaftMaterial = new THREE.MeshLambertMaterial({color: 0xf00000});
    var clawMaterial = new THREE.MeshLambertMaterial({color: 0x00ff00});

    var track1 = new THREE.Mesh(new THREE.BoxGeometry(20, 20, 200), trackMaterial);
    var track2 = new THREE.Mesh(new THREE.BoxGeometry(20, 20, 200), trackMaterial);
    track1.add(track2);
    track1.position.set(130, 820, 0);
    track2.position.set(-260, 0, 0);

    crossbar = new THREE.Mesh(new THREE.BoxGeometry(260, 10, 10), crossbarMaterial);
    crossbar.position.set(-130, 15, 0);

    slider = new THREE.Mesh(new THREE.BoxGeometry(10, 10, 10), sliderMaterial);
    slider.position.set(0, -10, 0);
    crossbar.add(slider);

    clawBase = new THREE.Object3D();


    clawShaft = new THREE.Mesh(new THREE.BoxGeometry(5, 100, 5), clawShaftMaterial)
    clawShaft.position.set(0,-55,0);

    claw = new THREE.Object3D();
    claw.position.set(0,-110,0);
    var textureLoader = new THREE.TextureLoader();
    var texture = textureLoader.load("assets/marble.png");
    var material = new THREE.MeshPhongMaterial( {
        color: 0xffffff,
        map: texture,
    });


    sphere = new THREE.SphereGeometry(10);
    mesh = new THREE.Mesh(sphere, material);

    // returns a mesh of a spherical knuckle
    function generateKnuckle (size) {
        var knuckle = new THREE.SphereGeometry(size);
        var mesh = new Physijs.SphereMesh(knuckle, material);
        return mesh
    }

    // returns a mesh of a cylinder
    function generateFinger (x,y,z) {
        var finger = new THREE.CylinderGeometry(x,y,z);
        var mesh = new Physijs.CylinderMesh(finger, material);
        return mesh;
    }

    knuckles = [];
    fingers = [];
    pads = [];
    for (var i = 0; i < 3; i++) {
        knuckles.push(generateKnuckle(2));
        fingers.push(generateFinger(1.5,1.5,10));
        pads.push(generateKnuckle(3));
    }

    var positions = [[0, -9, -7], [-6, -9, 3], [6, -9, 3]];
    var rotations = [[Math.PI/4, 0, 0], [0, Math.PI/4, -Math.PI/4], [0, -Math.PI/4, Math.PI/4]];
    knuckles.map(function(e,i) {
        fingers[i].position.set(0,-6.75,0);
        pads[i].position.set(0,-11,0);
        e.position.set(positions[i][0],positions[i][1],positions[i][2]);
        e.rotation.x = rotations[i][0];
        e.rotation.y = rotations[i][1];
        e.rotation.z = rotations[i][2];
        e.add(fingers[i]);
        e.add(pads[i]);
        mesh.add(e);
    });


    claw.add(mesh);

    clawBase.add(clawShaft);
    clawBase.add(claw);
    slider.add(clawBase);
    track1.add(crossbar);

    scene.add(track1);
}

function generateControlPanel(scene, bodyMaterial) {
    var loader = new THREE.TextureLoader();
    var texture = loader.load("assets/doge.jpg");
    var material = new THREE.MeshPhongMaterial({map: THREE.ImageUtils.loadTexture("assets/doge.png")});
    texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(512, 512);

    var pMat = Physijs.createMaterial(material, .8, .4)

    var panel = new Physijs.BoxMesh( new THREE.BoxGeometry(300, 50, 50), pMat, 0);
    panel.position.x = 0;
    panel.position.y = 410;
    panel.position.z = 150;
    panel.rotation.x = Math.PI / 4;
    scene.add(panel)

    baseJoystick = new Physijs.SphereMesh(new THREE.SphereGeometry(7), bodyMaterial, 0);
    baseJoystick.position.set(80, 430, 165);
    baseJoystick.rotation.set(Math.PI/4, 0, 0);
    baseJoystick.castShadow = true;

    joystick = new Physijs.CylinderMesh(new THREE.CylinderGeometry(5, 5, 35), bodyMaterial, 0);
    joystick.position.set(0, 10, 0);
    joystick.castShadow = true;

    handleHead = new Physijs.SphereMesh(new THREE.SphereGeometry(10), bodyMaterial, 0);
    handleHead.position.set(0, 20, 0);
    handleHead.castShadow = true;

    joystick.add(handleHead);
    baseJoystick.add(joystick)
    scene.add(baseJoystick);
}

function generateChute(scene) {
    var chuteMaterial1 = new THREE.MeshLambertMaterial({color: 0xffffff, transparent: true, opacity: 0.5});
    var chuteMaterial2 = new THREE.MeshLambertMaterial({color: 0xfff000, transparent: true, opacity: 0.5});
    var chuteWall1 = new Physijs.BoxMesh(new THREE.BoxGeometry(5, 100, 125), chuteMaterial1, 0);
    var chuteWall2 = new Physijs.BoxMesh(new THREE.BoxGeometry(5, 100, 150), chuteMaterial2, 0);

    chuteWall1.position.set(2.5, 500, 83.5);
    chuteWall1.rotation.y = Math.PI;

    chuteWall2.rotation.y = Math.PI/2;
    chuteWall2.position.set(75, 0, 60);

    chuteWall1.add(chuteWall2);
    scene.add(chuteWall1);
}

function builder(scene) {
    claw = new THREE.Object3D();
    claw.position.set(200,500,200);
    var textureLoader = new THREE.TextureLoader();
    var texture = textureLoader.load("assets/marble.png");
    var material = new THREE.MeshPhongMaterial( {
       color: 0xffffff,
       map: texture,
    });


    sphere = new THREE.SphereGeometry(10);
    mesh = new THREE.Mesh(sphere, material);

    // returns a mesh of a spherical knuckle
    function generateKnuckle (size) {
        var knuckle = new THREE.SphereGeometry(size);
        var mesh = new Physijs.SphereMesh(knuckle, material);
        return mesh
    }

    // returns a mesh of a cylinder
    function generateFinger (x,y,z) {
        var finger = new THREE.CylinderGeometry(x,y,z);
        var mesh = new Physijs.CylinderMesh(finger, material);
        return mesh;
    }

    knuckles = [];
    fingers = [];
    pads = [];
    for (var i = 0; i < 3; i++) {
        knuckles.push(generateKnuckle(2));
        fingers.push(generateFinger(1.5,1.5,10));
        pads.push(generateKnuckle(3));
    }

    var positions = [[0, -9, -7], [-6, -9, 3], [6, -9, 3]];
    var rotations = [[Math.PI/4, 0, 0], [0, Math.PI/4, -Math.PI/4], [0, -Math.PI/4, Math.PI/4]];
    knuckles.map(function(e,i) {
       fingers[i].position.set(0,-6.75,0);
       pads[i].position.set(0,-11,0);
       e.position.set(positions[i][0],positions[i][1],positions[i][2]);
       e.rotation.x = rotations[i][0];
       e.rotation.y = rotations[i][1];
       e.rotation.z = rotations[i][2];
       e.add(fingers[i]);
       e.add(pads[i]);
       mesh.add(e);
    });


    claw.add(mesh);
    scene.add(claw);
}

function dropClaw() {

    var scale = {yScale: clawShaft.scale.y, yPos: clawShaft.position.y, clawPos: claw.position.y };
    var targetScale = { yScale: 2.5 , yPos: -125  , clawPos: -250};
    var tween = new TWEEN.Tween(scale).to(targetScale, 3000);

    tween.onUpdate(() => {
        clawShaft.scale.y = scale.yScale;
        clawShaft.position.y = scale.yPos;
        claw.position.y = scale.clawPos;
    });

    tween.onComplete(() => {
        grabPrize();
    });

    tween.start();
}

function grabPrize () {
    var position = {x0: knuckles[0].rotation.x, z1: knuckles[1].rotation.z, z2: knuckles[2].rotation.z };
    var targetPosition = {x0: Math.PI/6, z1: Math.PI/8, z2: -Math.PI/8};
    var tween = new TWEEN.Tween(position).to(targetPosition, 2000);

    tween.onUpdate(() => {
        knuckles[0].rotation.x = position.x0;
        knuckles[1].rotation.z = position.z1;
        knuckles[2].rotation.z = position.z2;
    });

    tween.onComplete(() => {
        deliverPrize();
    });

    tween.start();

}

function deliverPrize () {
    var position = {x: slider.position.x, z: crossbar.position.z };
    var target = {x: -75, z: 100 };
    var tween = new TWEEN.Tween(position).to(target, 1000);

    tween.onUpdate(() => {
       crossbar.position.z = position.z;
       slider.position.x = position.x;
    });

    tween.onComplete(() => {
        resetClaw();
    });

    tween.start();
}

function resetClaw() {
    var position = {
        x: slider.position.x,
        z: crossbar.position.z,
        yScale: clawShaft.scale.y,
        yPos: clawShaft.position.y,
        clawPos: claw.position.y
    };

    var target = {
        x: 0,
        z: 0,
        yScale: 1,
        yPos: -55,
        clawPos: -110
    };

    var tween = new TWEEN.Tween(position).to(target, 1000);

    tween.onUpdate(() => {
        crossbar.position.z = position.z;
        slider.position.x = position.x;
        clawShaft.scale.y = position.yScale;
        clawShaft.position.y = position.yPos;
        claw.position.y = position.clawPos;
    });

    tween.start();
}

function setEgocentric() {
    camera.position.set( 0, 630, 700);
    cameraControls.target.set(0,600,150);
}

function resetCamera() {
    camera.position.set( 0, 900, 1000);
    cameraControls.target.set(4,500,92);
}

// Initialization. Define the size of the canvas and store the aspect ratio
// You can change these as well

function init() {
	var canvasWidth = 1280;
	var canvasHeight = 720;
	var canvasRatio = canvasWidth / canvasHeight;

	// Set up a renderer. This will allow WebGL to make your scene appear
	renderer = new THREE.WebGLRenderer( { antialias: true } );

	renderer.gammaInput = true;
	renderer.gammaOutput = true;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.setSize(canvasWidth, canvasHeight);
	renderer.setClearColor( 0xAAAAAA, 1.0 );


    // You also want a camera. The camera has a default position, but you most likely want to change this.
	// You'll also want to allow a viewpoint that is reminiscent of using the machine as described in the pdf
	// This might include a different position and/or a different field of view etc.
	camera = new THREE.PerspectiveCamera( 45, canvasRatio, 1, 4000 );
	// Moving the camera with the mouse is simple enough - so this is provided. However, note that by default,
	// the keyboard moves the viewpoint as well
	cameraControls = new THREE.OrbitControls(camera, renderer.domElement);
	camera.position.set( 0, 900, 1000);
	cameraControls.target.set(4,500,92);

}

document.onkeydown = (key) => {
    var crossbarLimit = 90;
    var sliderLimit = 111;
    var crossbarSliderMovement = 5;
    switch (key.keyCode) {
        case 87:
            if (baseJoystick.rotation.x > Math.PI/4 - Math.PI/8) baseJoystick.rotation.x -= Math.PI / 8;
            if (crossbar.position.z > -crossbarLimit) crossbar.translateZ(-crossbarSliderMovement);
            break;
        case 83:
            if (baseJoystick.rotation.x < Math.PI/4 + Math.PI/8) baseJoystick.rotation.x += Math.PI / 8;
            if (crossbar.position.z < crossbarLimit) crossbar.translateZ(crossbarSliderMovement);
            break;
        case 65:
            if (baseJoystick.rotation.z < Math.PI/8) baseJoystick.rotation.z += Math.PI/8;
            if (slider.position.x > -sliderLimit) slider.translateX(-crossbarSliderMovement);
            break;
        case 68:
            if (baseJoystick.rotation.z > -Math.PI/8) baseJoystick.rotation.z -= Math.PI/8;
            if (slider.position.x < sliderLimit) slider.translateX(crossbarSliderMovement);
            break;
        case 86:
            egocentric ? resetCamera() : setEgocentric();
            egocentric = !egocentric;
            break;
        case 32:
            dropClaw();
            break;
    }
}

document.onkeyup = (e) => {
    baseJoystick.rotation.set(Math.PI/4, 0, 0);
}

function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

	// We want our document object model (a javascript / HTML construct) to include our canvas
	// These allow for easy integration of webGL and HTML
function addToDOM() {
    var canvas = document.getElementById('canvas');
    canvas.appendChild(renderer.domElement);
}

	// This is a browser callback for repainting
	// Since you might change view, or move things
	// We cant to update what appears
function animate() {
	window.requestAnimationFrame(animate);
	render();
}

	// getDelta comes from THREE.js - this tells how much time passed since this was last called
	// This might be useful if time is needed to make things appear smooth, in any animation, or calculation
	// The following function stores this, and also renders the scene based on the defined scene and camera
function render() {
	var delta = clock.getDelta();
	cameraControls.update(delta);
    scene.simulate(); // run physics
	renderer.render(scene, camera);
    TWEEN.update();
}

	// Since we're such talented programmers, we include some exception handeling in case we break something
	// a try and catch accomplished this as it often does
	// The sequence below includes initialization, filling up the scene, adding this to the DOM, and animating (updating what appears)
try {
  init();
  fillScene();
  addToDOM();
  animate();
} catch(error) {
    console.log("You did something bordering on utter madness. Error was:");
    console.log(error);
}
