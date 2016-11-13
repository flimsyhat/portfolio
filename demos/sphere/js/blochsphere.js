var container;

var camera, cameraControls, scene, renderer, mesh;
var group;
var container;
var cylinder;
var pivot;

var heightCircle;
var heightLine;

var clock = new THREE.Clock();

var SpriteText2D = THREE_Text.SpriteText2D;
var textAlign = THREE_Text.textAlign;

var theta = document.getElementById("theta").value * Math.PI;
var phi = document.getElementById("phi").value * 2 * Math.PI;

init();
animate();


function init() {

        // Renderer

        renderer = new THREE.WebGLRenderer({antialias: true, alpha: true, transparent: true});
        container = document.getElementById('container');

        var DPR = (window.devicePixelRatio) ? window.devicePixelRatio : 1;

        renderer.setSize(container.offsetWidth * DPR, container.offsetHeight * DPR);
        container.appendChild(renderer.domElement);

        camera = new THREE.PerspectiveCamera( 75, container.offsetWidth / container.offsetHeight, 0.1, 10000 );
        camera.position.set(-3,3,4);

        cameraControls = new THREE.OrbitControls(camera, renderer.domElement);
        cameraControls.target.set(0, 0, 0);
        cameraControls.minDistance = 4;
        cameraControls.maxDistance = 4;
        cameraControls.enablePan = false;
        cameraControls.noZoom = true;
        cameraControls.minPolarAngle = Math.PI/8;
        cameraControls.maxPolarAngle = 7 * Math.PI/8;

        scene = new THREE.Scene();

        // Sphere outline

        var outlineGeometry = new THREE.SphereGeometry(2.02, 100, 100, 0, Math.PI * 2, 0, Math.PI * 2);
        var outlineMaterial = new THREE.MeshBasicMaterial({
          color: 0x000000,
          side: THREE.BackSide,
          depthWrite: false,
          depthTest: false,
          transparent: true,
          opacity: .4,
        });
        var outline = new THREE.Mesh(outlineGeometry, outlineMaterial);
        scene.add(outline);

        var outlineGeometry2 = new THREE.SphereGeometry(2, 100, 100, 0, Math.PI * 2, 0, Math.PI * 2);
        var outlineMaterial2 = new THREE.MeshPhongMaterial({
          color: 0x2089C9,
          side: THREE.BackSide,
          depthWrite: false,
          depthTest: false,
          transparent: true,
          opacity: 1,
        });
        var outline2 = new THREE.Mesh(outlineGeometry2, outlineMaterial2);
        scene.add(outline2);

        // Vector cylinder

        var cylinderGeometry = new THREE.CylinderGeometry( .05, .05, 1.8, 32 );
        var cylinderMaterial = new THREE.MeshBasicMaterial( {
          color: 0xffff00,
          side: THREE.DoubleSide,
          depthWrite: false,
          depthTest: false,
          transparent: true,
          opacity: 1
        } );
        cylinder = new THREE.Mesh( cylinderGeometry, cylinderMaterial );
        cylinder.translateY(.9);
        cylinder.renderOrder = 10;
        scene.add( cylinder );

        var coneGeometry = new THREE.CylinderGeometry (0, .1, .3, 32);
        var cone = new THREE.Mesh( coneGeometry, cylinderMaterial );
        cone.translateY(1.875);
        cone.renderOrder = 10;
        scene.add( cone );

        // Main Sphere

        var geometry = new THREE.SphereGeometry(2, 24, 24, 0, Math.PI * 2, 0, Math.PI * 2);
        var material = new THREE.MeshPhongMaterial({
          side: THREE.BackSide,
          depthWrite: false,
          depthTest: false,
          color: 0x66CCFF,
          transparent: true,
          opacity: 0.0,
        });
        var sphere = new THREE.Mesh(geometry, material);
        scene.add(sphere);

        // Edge circles

        var radius = 2;

        var circleMaterial = new THREE.LineBasicMaterial({
          color: 0x000000,
          side: THREE.BackSide,
          depthWrite: false,
          depthTest: false,
          transparent: true,
          opacity: 0.2,
        });

        var circleGeometry1 = new THREE.CircleGeometry( radius, 64 );
        var circleGeometry2 = new THREE.CircleGeometry( radius, 64 );
        var circleGeometry3 = new THREE.CircleGeometry( radius, 64 );

        var circle1 = circleGeometry1.rotateX(Math.PI/2);
        var circle2 = circleGeometry2.rotateY(Math.PI/2);
        var circle3 = circleGeometry3.rotateZ(Math.PI/2);

        scene.add( new THREE.Line( circle1, circleMaterial ) );
        scene.add( new THREE.Line( circle2, circleMaterial ) );
        scene.add( new THREE.Line( circle3, circleMaterial ) );

        // Height circle

        var heightLineGeometry = new THREE.CircleGeometry( radius, 64 );

        heightLineGeometry.rotateX(Math.PI/2);
        heightLineGeometry.rotateY(-Math.PI/2);

        var heightLineMaterial = new THREE.LineBasicMaterial({
          color: 0x99FF00,
          side: THREE.BackSide,
          depthWrite: false,
          depthTest: false,
          transparent: true,
          opacity: 1,
        });

        heightLine = new THREE.Line(heightLineGeometry, heightLineMaterial);

        scene.add(heightLine);

        heightLine.renderOrder = 10;

        // Axes

        var lineMaterial = new THREE.LineBasicMaterial({
          color: 0x000000,
          side: THREE.BackSide,
          depthWrite: false,
          depthTest: false,
          transparent: true,
          opacity: 0.8,
        });

        var Xgeometry = new THREE.Geometry();
        Xgeometry.vertices.push(new THREE.Vector3(-2, 0, 0));
        Xgeometry.vertices.push(new THREE.Vector3(2, 0, 0));

        var Ygeometry = new THREE.Geometry();
        Ygeometry.vertices.push(new THREE.Vector3(0, -2, 0));
        Ygeometry.vertices.push(new THREE.Vector3(0, 2, 0));

        var Zgeometry = new THREE.Geometry();
        Zgeometry.vertices.push(new THREE.Vector3(0, 0, -2));
        Zgeometry.vertices.push(new THREE.Vector3(0, 0, 2));

        var Xline = new THREE.Line(Xgeometry, lineMaterial);
        var Yline = new THREE.Line(Ygeometry, lineMaterial);
        var Zline = new THREE.Line(Zgeometry, lineMaterial);

        scene.add(Xline, Yline, Zline);

        // Lights

        scene.add(new THREE.AmbientLight(0xffffff,1));

        // Text labels

        var sprite1 = new SpriteText2D("   State A", { align: textAlign.center, font: '25px Arial', fillStyle: '#000000', antialias: true });
        sprite1.position.set(-.15,2.3,0);
        sprite1.scale.set(0.01, 0.01, 0.01)
        sprite1.material.alphaTest = 0.1;
        scene.add(sprite1);

        var sprite2 = new SpriteText2D("   State B", { align: textAlign.center, font: '25px Arial', fillStyle: '#000000', antialias: true });
        sprite2.position.set(-.15,-2,0);
        sprite2.scale.set(0.01, 0.01, 0.01)
        sprite2.material.alphaTest = 0.1;
        scene.add(sprite2);

        // All backwards, but whatever..

        var spriteX = new SpriteText2D("X", { align: textAlign.center, font: '15px Arial', fillStyle: '#000000', antialias: true });
        spriteX.position.set(0,-.1,1);
        spriteX.scale.set(0.01, 0.01, 0.01)
        spriteX.material.alphaTest = 0.1;
        scene.add(spriteX);

        var spriteY = new SpriteText2D("Y", { align: textAlign.center, font: '15px Arial', fillStyle: '#000000', antialias: true });
        spriteY.position.set(1,-.1,0);
        spriteY.scale.set(0.01, 0.01, 0.01)
        spriteY.material.alphaTest = 0.1;
        scene.add(spriteY);

        var spriteZ = new SpriteText2D("Z", { align: textAlign.center, font: '15px Arial', fillStyle: '#000000', antialias: true });
        spriteZ.position.set(.08,1,.08);
        spriteZ.scale.set(0.01, 0.01, 0.01)
        spriteZ.material.alphaTest = 0.1;
        scene.add(spriteZ);

        // Pivot point

        pivot = new THREE.Group();
        scene.add( pivot );
        pivot.add( cylinder );
        pivot.add( cone );

}

window.addEventListener( 'resize', onWindowResize, false );

function onWindowResize() {

  renderer.setSize( container.offsetWidth, container.offsetHeight );
  camera.aspect = container.offsetWidth / container.offsetHeight;
  camera.updateProjectionMatrix();

}

function animate() {

        var delta = clock.getDelta();

        requestAnimationFrame(animate);

        cameraControls.update(delta);

        renderer.render(scene, camera);

        theta = document.getElementById("theta").value
        phi = document.getElementById("phi").value;

        pivot.rotation.set(theta * Math.PI, phi * 2 * Math.PI, 0, 'YZX');

        var height = -2 * Math.sin((theta - .5) * Math.PI);

        var circleScale = 1;

        if (height != 0) {
          circleScale = Math.sqrt(4 - Math.pow(height,2))/2;
        }
        else {
          circleScale = 1;
        }

        heightLine.scale.set(circleScale,1,circleScale);

        heightLine.position.set(0,height, 0)
        heightLine.rotation.set(0, phi * 2 * Math.PI, 0)
}
