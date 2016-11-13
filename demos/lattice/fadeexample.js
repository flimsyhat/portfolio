"use strict";

b4w.register("example_main", function(exports, require) {

var m_anim   = require("animation");
var m_app    = require("app");
var m_data   = require("data");
var m_scenes = require("scenes");
var m_main   = require("main");
var m_nla    = require("nla");
var m_obj    = require("objects");
var m_mat    = require("material")

var _previous_selected_obj = null;

exports.init = function() {
    m_app.init({
        canvas_container_id: "canvas3d",
        callback: init_cb,
        physics_enabled: false,
        alpha: false,
        autoresize: true
    });
}

function init_cb(canvas_elem, success) {

    if (!success) {
        console.log("b4w init failure");
        return;
    }

    m_app.enable_controls();

    load();

    window.onresize = m_app.resize_to_container;
    m_app.resize_to_container();
}

function load() {
    m_data.load("3Dlattice.json", load_cb);
}

function load_cb(data_id) {
    m_app.enable_camera_controls();
    run();
}

var slider = document.getElementById('slider');

noUiSlider.create(slider, {
	start: [0, 100],
    behaviour: 'drag',
	connect: true,
    direction: 'rtl',
    orientation: 'vertical',
    margin: 20,
	range: {
		'min': 0,
		'max': 90
	}
});

function run() {

   var objects = m_scenes.get_all_objects("MESH");

   var names = [];

   for (var i = 0; i < objects.length - 1; i++) {
      if (m_scenes.get_object_type(objects[i]) == "MESH") {
         var name = m_scenes.get_object_name(objects[i])
         names.push(name)
      }
   }

   names.sort();

   function alpha(index) {
      var value = slider.noUiSlider.get()

      var left = value[0]
      var right = value[1]

      var rightEdge = index - right
      var leftEdge = index - 10 - left

      var rightValue = 1 - rightEdge / 10
      var leftValue = leftEdge / 10

      if (leftEdge > 10) {
         leftValue = 1 }
      else if (leftEdge < 0) {
         leftValue = 0 }

      if (rightEdge > 10) {
         rightValue = 0 }
      else if (rightEdge < 0) {
         rightValue = 1 }

      return (leftValue * rightValue)
   }

   function fade(objectName, index) {
      var object = m_scenes.get_object_by_name(objectName);
      var mat = m_mat.get_materials_names(object);
      m_obj.set_nodemat_value(object,[mat,mat], alpha(index * 10 + 20) * .1)
   }


   slider.noUiSlider.on('update', function() {
      for (var i = 0; i < names.length; i++) {
         fade(names[i],i)
      }
   });

}

});

b4w.require("example_main").init();
