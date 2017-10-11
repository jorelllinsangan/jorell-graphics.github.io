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
	scene = new THREE.Scene();
	scene.fog = new THREE.Fog( 0x808080, 2000, 4000 );

	// Some basic default lighting - in A2 complexity will be added

	scene.add( new THREE.AmbientLight( 0x222222 ) );

	var light = new THREE.DirectionalLight( 0xffffff, 0.7 );
	light.position.set( 200, 500, 500 );

	scene.add( light );

	light = new THREE.DirectionalLight( 0xffffff, 0.9 );
	light.position.set( -200, -100, -400 );

	scene.add( light );

//A simple grid floor, the variables hint at the plane that this lies within
// Later on we might install new flooring.
 var gridXZ = new THREE.GridHelper(2000, 100, new THREE.Color(0xCCCCCC), new THREE.Color(0x888888));
 scene.add(gridXZ);

 //Visualize the Axes - Useful for debugging, can turn this off if desired
 var axes = new THREE.AxisHelper(150);
 axes.position.y = 1;
 scene.add(axes);

 drawClawMachine();
}

function drawClawMachine() {

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

}

function generateBase(scene, bodyMaterial) {
    var base;

    // This is where the model gets created. Add the appropriate geometry to create your machine
    // You are not limited to using BoxGeometry, and likely want to use other types of geometry for pieces of your submission
    // Note that the actual shape, size and other factors are up to you, provided constraints listed in the assignment description are met

    // The base
    base = new THREE.Mesh( new THREE.BoxGeometry( 300, 400, 300 ), bodyMaterial );
    base.position.x = 0;
    base.position.y = 250;
    base.position.z = 0;

    scene.add( base );
}

function generateStands(scene, bodyMaterial) {
    var xy = [[1, 1], [1, -1], [-1, 1], [-1, -1]];

    // Creates the stands
    var stand;
    for (var i = 0; i < xy.length; i++) {
        stand = new THREE.Mesh( new THREE.BoxGeometry( 50, 400, 50 ), bodyMaterial );
        stand.position.x = 125 * xy[i][0];
        stand.position.y = 650;
        stand.position.z = 125 * xy[i][1];
        scene.add( stand );
    }
}

function generateWalls(scene) {
    var wallMaterial = new THREE.MeshLambertMaterial({color: 0xffffff, transparent: true, opacity: 0.5})

    var wall = new THREE.Mesh(new THREE.BoxGeometry(200, 400, 5), wallMaterial);
    wall.position.set(0, 650, 148.5);

    scene.add(wall);

    wall = new THREE.Mesh(new THREE.BoxGeometry(200, 400, 5), wallMaterial);
    wall.position.set(0, 650, -148.5);

    scene.add(wall);

    wall = new THREE.Mesh(new THREE.BoxGeometry(200, 400, 5), wallMaterial);
    wall.position.set(148.5, 650, 0);
    wall.rotation.y = Math.PI/2;

    scene.add(wall);

    wall = new THREE.Mesh(new THREE.BoxGeometry(200, 400, 5), wallMaterial);
    wall.position.set(-148.5, 650, 0);
    wall.rotation.y = Math.PI/2;

    scene.add(wall);

}

function generateClawMechanism (scene) {
    var trackMaterial = new THREE.MeshLambertMaterial({color: 0x000000});
    var crossbarMaterial = new THREE.MeshLambertMaterial({color: 0xfff000});
    var sliderMaterial = new THREE.MeshLambertMaterial({color: 0x000fff});
    var clawShaftMaterial = new THREE.MeshLambertMaterial({color: 0xf00000});

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

    clawShaft = new THREE.Mesh(new THREE.BoxGeometry(5, 100, 5), clawShaftMaterial)
    clawShaft.position.set(0,-55,0);
    slider.add(clawShaft);


    track1.add(crossbar);

    scene.add(track1);
}

function generateControlPanel(scene, bodyMaterial) {

    var panel = new THREE.Mesh( new THREE.BoxGeometry(300, 50, 50), bodyMaterial);
    panel.position.x = 0;
    panel.position.y = 410;
    panel.position.z = 150;
    panel.rotation.x = Math.PI / 4;
    scene.add(panel)

    baseJoystick = new THREE.Mesh(new THREE.SphereGeometry(7), bodyMaterial);
    baseJoystick.position.set(80, 430, 165);
    baseJoystick.rotation.set(Math.PI/4, 0, 0);

    joystick = new THREE.Mesh(new THREE.CylinderGeometry(5, 5, 35), bodyMaterial);
    joystick.position.set(0, 10, 0);

    handleHead = new THREE.Mesh(new THREE.SphereGeometry(10), bodyMaterial);
    handleHead.position.set(0, 20, 0);
    joystick.add(handleHead);
    baseJoystick.add(joystick)
    scene.add(baseJoystick);

}

document.onkeydown = (key) => {
    console.log(key.keyCode);
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

/*
A sequence of animations is needed. Can't just do a for loop
 */
function dropClaw() {

    console.log(clawShaft.scale.clone());
    var scale = {yScale: clawShaft.scale.y, yPos: clawShaft.position.y };
    var targetScale = { yScale: 2.5 , yPos: -125 };
    var tween = new TWEEN.Tween(scale).to(targetScale, 3000);

    tween.onUpdate(() => {
        clawShaft.scale.y = scale.yScale;
        clawShaft.position.y = scale.yPos
    })

    tween.onComplete(() => {
        deliverPrize();
    })

    tween.start();
}

function deliverPrize () {
    var position = {x: slider.position.x, z: crossbar.position.z };
    var target = {x: -75, z: 100 };
    var tween = new TWEEN.Tween(position).to(target, 500);

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
    var position = {x: slider.position.x, z: crossbar.position.z };
    var target = {x: 0, z: 0 };
    var tween = new TWEEN.Tween(position).to(target, 1000);

    tween.onUpdate(() => {
        crossbar.position.z = position.z;
        slider.position.x = position.x;
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
