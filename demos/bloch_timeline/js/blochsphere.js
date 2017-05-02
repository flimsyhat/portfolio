var container;
var camera, cameraControls, scene, renderer, mesh;
var group;
var container;
var cylinder;
var pivot;
var dynamicPath;
var staticPath;
var empty;

var heightCircle;
var heightLine;

var clock = new THREE.Clock();
var frame = 0;

var SpriteText2D = THREE_Text.SpriteText2D;
var textAlign = THREE_Text.textAlign;

var test_path;
var path_position = new THREE.Vector3(0, -50, 0)

var radius = 50;
var points = 256;

var x_rotation = { rotation: 0 };
var y_rotation = { rotation: 0 };

var x_axis, y_axis, z_axis;

var prev_y_rotation = 0;
var prev_x_rotation = 0;

var current_path;

var buttons_enabled = true;

var DPR = (window.devicePixelRatio) ? window.devicePixelRatio : 1;

var rotation_z = 0;
var precess = false;

var plane_pivot;

var rotation_counter = 0;

var path_array = []; // for storing the spawned paths

init();
animate();
sphere_resize();

function init() {

        // Renderer

        renderer = new THREE.WebGLRenderer({antialias: true, alpha: true, transparent: true});
        container = document.getElementById('container');

        renderer.setSize(container.offsetWidth * DPR, container.offsetHeight * DPR);
        container.appendChild(renderer.domElement);

        camera = new THREE.PerspectiveCamera( 75, container.offsetWidth / container.offsetHeight, 0.1, 10000 );
        camera.position.set(-3,3,3);

        cameraControls = new THREE.OrbitControls(camera, renderer.domElement);
        cameraControls.target.set(0, 0, 0);
        cameraControls.minDistance = 100;
        cameraControls.maxDistance = 100;
        cameraControls.enablePan = false;
        cameraControls.enableZoom = false;
        cameraControls.minPolarAngle = Math.PI/8;
        cameraControls.maxPolarAngle = 7 * Math.PI/8;

        scene = new THREE.Scene();

        // Vector arrow

        var cylinderGeometry = new THREE.CylinderGeometry( 1, 1, 46, 32 );
        var cylinderMaterial = new THREE.MeshBasicMaterial( {
          color: 0x0ea2ed,
          opacity: 1
        } );
        cylinder = new THREE.Mesh( cylinderGeometry, cylinderMaterial );
        cylinder.translateY(23);
        scene.add( cylinder );

        var coneGeometry = new THREE.CylinderGeometry (0, 2, 4, 30);
        var cone = new THREE.Mesh( coneGeometry, cylinderMaterial );
        cone.translateY(48);
        scene.add( cone );
  
        // Spheres 
  
        function add_sphere(pos) {
          var loc = new THREE.Vector3(pos[0], pos[1], pos[2])
          var geometry = new THREE.SphereGeometry(1, 24, 24, 0, Math.PI * 2, 0, Math.PI * 2);
          var material = new THREE.MeshBasicMaterial({
            color: 0x3A3A3A,
            opacity: 1,
          });
          var sphere = new THREE.Mesh(geometry, material);
          scene.add(sphere);
          sphere.position.add(loc);
        }
  
        add_sphere([-50, 0, 0])
        add_sphere([0, -50, 0])
        add_sphere([0, 50, 0])
        add_sphere([0, 0, 50])

        // Edge circles
  
        var circleLineMaterial = new THREE.MeshLineMaterial({
          color: new THREE.Color(0x3A3A3A),
          lineWidth: 0.15,
          opacity: 1,
        });
  
        function createCircle(radius, points, material, shifted) {
          var g = new THREE.CircleGeometry(radius, points);
          if (shifted) {
            g.vertices.shift();
          }
          var line = new THREE.MeshLine();
          line.setGeometry(g);
          var mesh = new THREE.Mesh( line.geometry, material );
          return mesh
        }
  
        scene.add(createCircle(radius, points, circleLineMaterial, true).rotateX(Math.PI/2));
  
        // Circle mesh
  
        var meshCircleMaterial = new THREE.MeshLineMaterial({
          color: new THREE.Color(0x000000),
          transparent: true,
          lineWidth: 0.1,
          opacity: 0.1,
        });
  
        for (i = 0; i < 4; i++) {
          var circle = createCircle(radius, points, meshCircleMaterial, true)
          circle.rotation.set(0, (2*Math.PI/4) * i, 0)
          scene.add(circle)
        }
        
        for (i = 0; i < 3; i++) {
          var height = (100/4) * (i + 1) - 50
          var new_radius = Math.sqrt(Math.pow(radius, 2) - Math.pow(height, 2))
          var circle = createCircle(new_radius, points, meshCircleMaterial, true)
          circle.rotation.set(Math.PI/2, 0, Math.PI/2)
          circle.position.set(0, height, 0)
          scene.add(circle)
        }

        // Axes
  
        function createLine (start, end, color) {
          
          var material = new THREE.MeshLineMaterial({
            color: new THREE.Color(color),
            lineWidth: 0.4,
            opacity: 1
          });
          
          var startPoint = new THREE.Vector3(start[0], start[1], start[2])
          var endPoint = new THREE.Vector3(end[0], end[1], end[2])
          
          var g = new THREE.Geometry();
          g.vertices.push(startPoint);
          g.vertices.push(endPoint);
          
          var line = new THREE.MeshLine();
          line.setGeometry(g);
          
          var mesh = new THREE.Mesh(line.geometry, material);
          return mesh
          
        }
        
        x_axis = createLine([-radius, 0, 0], [0, 0, 0], 0xf4a82e)
        z_axis = createLine([0, -radius, 0], [0, radius, 0], 0x3A3A3A)
        y_axis = createLine([0, 0, 0], [0, 0, radius], 0x20b51b)
        
        scene.add(x_axis, y_axis, z_axis)
        
        // Backing plane
        
        var plane_material = new THREE.MeshBasicMaterial({
          color: 0xfcfcfc,
          opacity: 1,
        });
        
        plane = new THREE.Mesh( new THREE.CircleGeometry(90, points, Math.PI * 2), plane_material );
        plane.position.set( 0, 0, -55 );
        scene.add( plane );
    
        var outlineMaterial = new THREE.MeshLineMaterial({
          color: new THREE.Color(0x3A3A3A),
          lineWidth: 0.4,
          opacity: 0.4,
        });
        
        var outline = createCircle(87, points, outlineMaterial, true);
        outline.position.set( 0, 0, -50 );
        scene.add( outline );
  
        plane_pivot = new THREE.Group();
        scene.add(plane_pivot)
        plane_pivot.add(plane)
        plane_pivot.add(outline)

        // Text labels

        var sprite1 = new SpriteText2D(" 1", { align: textAlign.center, font: '60px Arial', fillStyle: '#000000', antialias: true });
        sprite1.position.set(-1,57,0);
        sprite1.scale.set(0.1, 0.1, 0.1)
        sprite1.material.alphaTest = 0.1;
        scene.add(sprite1);

        var sprite2 = new SpriteText2D(" 0", { align: textAlign.center, font: '60px Arial', fillStyle: '#000000', antialias: true });
        sprite2.position.set(-1,-50,0);
        sprite2.scale.set(0.1, 0.1, 0.1)
        sprite2.material.alphaTest = 0.1;
        scene.add(sprite2);

        var spriteX = new SpriteText2D("Y", { align: textAlign.center, font: '40px Arial', fillStyle: '#000000', antialias: true });
        spriteX.position.set(0,2.5,55);
        spriteX.scale.set(0.1, 0.1, 0.1)
        spriteX.material.alphaTest = 0.1;
        scene.add(spriteX);

        var spriteY = new SpriteText2D("X", { align: textAlign.center, font: '40px Arial', fillStyle: '#000000', antialias: true });
        spriteY.position.set(-55,2.5,0);
        spriteY.scale.set(0.1, 0.1, 0.1)
        spriteY.material.alphaTest = 0.1;
        scene.add(spriteY);

        var spriteZ = new SpriteText2D("Z", { align: textAlign.center, font: '40px Arial', fillStyle: '#000000', antialias: true });
        spriteZ.position.set(3,25,3);
        spriteZ.scale.set(0.1, 0.1, 0.1)
        spriteZ.material.alphaTest = 0.1;
        scene.add(spriteZ);

        // Pivot point
  
        empty = new THREE.Group();
        empty.position.add(new THREE.Vector3(0,50,0))

        pivot = new THREE.Group();
        scene.add( pivot );
        pivot.add( cylinder );
        pivot.add( cone );
        pivot.add( empty );
        pivot.rotation.set(Math.PI,0,0)
  
        // Path trail
        
        function square_wave(x, length=1) {
            // for drawing a dashed line
            var freq = 120;
            var wave = Math.sin(freq * length * x)
            if (wave>0) {
              return 1
            }
            else {
              return 0
            }
        }
  
        var pathMaterial = new THREE.MeshLineMaterial({
          color: new THREE.Color(0xf4a82e),
          lineWidth: 0.4,
        });
        
         staticPath = function(color, dashed=false) {
          
          this.name = "Path"
          this.position = path_position;
          this.trail = new THREE.Geometry();
           
          var path_length = 0;
           
          var material = new THREE.MeshLineMaterial({
          color: new THREE.Color(color),
          lineWidth: 0.4,
          });
           
          var dashes = function(p) {
            if (dashed) {
              return square_wave(p, path_length); }
            else {
              return 1;
            }
          }
          
          this.createTrail = function () {
            
            path_length = this.trail.vertices.length
            this.trail.vertices.push(this.position.clone());
            this.trail_line = new THREE.MeshLine();
            this.trail_line.setGeometry(this.trail, dashes);
            this.trail_mesh = new THREE.Mesh(this.trail_line.geometry, material);
            scene.add(this.trail_mesh) 
            
          }
          
          this.createTrail();
          
          this.update = function() {
            this.position = path_position;
            scene.remove(this.trail_mesh);
            this.createTrail();
          }
    
        }
      
}

function rotate_pivot() {
  
        var rotation_y = y_rotation.rotation - prev_y_rotation;
        var rotation_x = x_rotation.rotation - prev_x_rotation;
  
        // store total rotation of current action
        rotation_counter += Math.abs(rotation_x) + Math.abs(rotation_y);
  
        var quaternion_x = new THREE.Quaternion();
        var quaternion_y = new THREE.Quaternion();
  
        quaternion_x.setFromAxisAngle( new THREE.Vector3( 1, 0, 0 ), -rotation_x );
        quaternion_y.setFromAxisAngle( new THREE.Vector3( 0, 0, 1 ), rotation_y);
  
        var rotation_quaternion = new THREE.Quaternion();
        
        rotation_quaternion.multiplyQuaternions(quaternion_y, quaternion_x)
//        rotation_quaternion.multiplyQuaternions(quaternion_z, rotation_quaternion)
  
        curQuaternion = pivot.quaternion;
		curQuaternion.multiplyQuaternions(rotation_quaternion, curQuaternion);
        curQuaternion.normalize();
        pivot.setRotationFromQuaternion(curQuaternion);
  
        prev_y_rotation = y_rotation.rotation;
        prev_x_rotation = x_rotation.rotation;
  
        scene.updateMatrixWorld();
  
        var empty_position = new THREE.Vector3();
        empty_position.setFromMatrixPosition(empty.matrixWorld);
        
        path_position = empty_position;
  
        // if rotation > 2*PI, don't add to path
        if (rotation_counter < 2 * Math.PI) {
          current_path.update()
        }

}

function reset_rotation(object) {
  
        object.updateMatrix();
        object.applyMatrix( object.matrix );
        object.rotation.set( 0, 0, 0 );
        object.updateMatrix();
}

function precession() {
  
        if (precess) {
          
          rotation_z = .02;
          rotation_counter += rotation_z;
          
          var quaternion_z = new THREE.Quaternion();
          quaternion_z.setFromAxisAngle( new THREE.Vector3( 0, 1, 0 ), rotation_z );
          curQuaternion = pivot.quaternion;
          curQuaternion.multiplyQuaternions(quaternion_z, curQuaternion);
          curQuaternion.normalize();
          pivot.setRotationFromQuaternion(curQuaternion);
          
          var empty_position = new THREE.Vector3();
          empty_position.setFromMatrixPosition(empty.matrixWorld);
          
          // if rotation > 2*PI, don't add to path
          if (rotation_counter < 2 * Math.PI) {
            path_position = empty_position;
            current_path.update()
          }
        }
}

function precession_start() {
        if (buttons_enabled) {
          var new_path = new staticPath(0x0ea2ed, true);
          path_array.push(new_path)
          current_path = new_path;
          precess = true;
          rotation_counter = 0;
        }
}

function precession_stop() {
        precess = false;
        // record position where procession stops
        var empty_position = new THREE.Vector3();
        empty_position.setFromMatrixPosition(empty.matrixWorld);
        path_position = empty_position;
}

function animate() {
        
        var delta = clock.getDelta();
        requestAnimationFrame(animate);
        cameraControls.update(delta);
        plane_pivot.quaternion.copy( camera.quaternion );
        precession();
        move_dot();
        renderer.render(scene, camera);

}

function sphere_resize() {
      // Hack to fix resolution issues
      renderer.setSize(container.offsetWidth * DPR, container.offsetHeight * DPR);
      x = document.getElementsByTagName("canvas")[0];
      x.style.height = "100%";
      x.style.width = "100%";
}

function fade_label() {
      // Fade label on click
      var label = document.getElementById("label");
      x.addEventListener('mousedown', function() {
      label.style.opacity = "0";
      });
}

function axis_rotation(axis, amount) {
    
      if (buttons_enabled) {
        
        buttons_enabled = false;
        precession_stop();

        var rotation_axis;
        var color;

        if (axis == x_axis) {
          rotation_axis = x_rotation;
          color = 0xf4a82e;
        }

        else {
          rotation_axis = y_rotation;
          color = 0x20b51b;
        }

        var new_path = new staticPath(color);
        path_array.push(new_path)
        current_path = new_path;

        TweenMax.to(rotation_axis, 2, {
          rotation: "+=" + amount,
          ease: Power1.easeInOut, 
          onStart:reset_rotation_counter(),
          onUpdate:rotate_pivot,
          onComplete:set_buttons
        }); 
      }
}

function reset_rotation_counter() {
      rotation_counter = 0;
}

function set_buttons() {
      buttons_enabled = true;
}

function reset() {
  
      precession_stop();
  
      pivot.rotation.set(Math.PI,0,0)
      TweenMax.killAll();
  
      var array_length = path_array.length;
      for (var i = array_length - 1; i >= 0; i--) {
          var mesh = path_array[i].trail_mesh
          scene.remove(mesh);
          path_position = new THREE.Vector3(0, -50, 0);
      }
  
      TweenMax.set("#bar", {x:0});
  
}

function test_log(this_thing) {
      console.log(this_thing);
}

function sequence() {
      reset();
  
      var delay = 2.1 + document.getElementById("delay").value * 5.333;
      var x_slider = document.getElementById("delay").value;
      var distance = $("#pulses").width() * .69;
  
      var tl = new TimelineMax();
      tl.addCallback(axis_rotation, 0, [x_axis, Math.PI/2]);
      tl.to("#bar", 2, {x: distance/5, ease:Power1.easeInOut});
      tl.addCallback(precession_start, 2.1);
      tl.to("#bar", delay - 2.1, {x: distance * x_slider + distance/5, ease:Linear.easeNone});
      tl.addCallback(axis_rotation, delay, [y_axis, Math.PI/2]);
      tl.to("#bar", 2, {x: "+=" + distance/5, ease:Power1.easeInOut});
      return tl;
}

window.addEventListener( 'resize', onWindowResize, false );

function onWindowResize() {
  // rescale scene
  renderer.setSize( container.offsetWidth, container.offsetHeight );
  camera.aspect = container.offsetWidth / container.offsetHeight;
  camera.updateProjectionMatrix();
  sphere_resize();
}

// Graph stuff

function move_dot() {
      var x_slider = document.getElementById("delay").value
      
      var x_pos = x_slider * $("#graph").width() * 0.87;
      var y_pos = Math.sin(x_slider * 2 * Math.PI) * $("#graph").height()/3.5;
      TweenMax.set('#dot', {x:x_pos, y:y_pos});
  
      var graph_pos = x_slider * $("#pulses").width() * .69;
  
      TweenMax.set('#green', {x: graph_pos});
}
