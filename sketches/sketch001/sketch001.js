import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import GUI from "lil-gui";

import fragment from "../../shaders/edgeDetectionFragment.glsl";
import vertex from "../../shaders/vertexProject.glsl";

export default class Sketch {
  constructor(options) {
    this.scene = new THREE.Scene();

    this.container = options.dom;
    this.width = this.container.offsetWidth;
    this.height = this.container.offsetHeight;

    this.renderer = new THREE.WebGLRenderer({ alpha: true });
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.setSize(this.width, this.height);
    this.renderer.setClearColor(0x000000, 1);
    this.renderer.outputEncoding = THREE.sRGBEncoding;

    this.container.appendChild(this.renderer.domElement);

    this.camera = new THREE.PerspectiveCamera(
      70,
      window.innerWidth / window.innerHeight,
      0.001,
      1000
    );

    this.camera.position.set(0, 0, 2);
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.time = 0;

    this.addObjects();

    this.play();
    this.setupResize();
    this.settings();
  }

  settings() {
    this.settings = {
      wireThickness: 1,
    };
    this.gui = new GUI();
    this.gui.add(this.settings, "wireThickness", 0, 5, 0.1);
  }

  setupResize() {
    window.addEventListener("resize", this.resize.bind(this));
  }

  resize() {
    this.width = this.container.offsetWidth;
    this.height = this.container.offsetHeight;
    this.renderer.setSize(this.width, this.height);
    this.camera.aspect = this.width / this.height;
    this.camera.updateProjectionMatrix();
  }

  addObjects() {
    this.material = new THREE.ShaderMaterial({
      side: THREE.DoubleSide,
      uniforms: {
        time: { type: "f", value: 0 },
        thickness: { type: "f", value: this.settings.wireThickness },
      },
      vertexShader: vertex,
      fragmentShader: fragment,
    });

    const boxGeo = new THREE.BoxGeometry(1, 1, 1);

    this.boxes = [
      new THREE.Mesh(boxGeo, this.material),
      new THREE.Mesh(boxGeo, this.material),
      new THREE.Mesh(boxGeo, this.material),
    ];

    this.boxes[0].position.set(0, 7, 0);
    this.boxes[0].rotation.set(0, 270, 0);
    this.boxes[1].position.set(0, 7, -7);
    this.boxes[1].rotation.set(-90, 270, 90);
    this.boxes[2].position.set(0, 0, 0);
    this.boxes[2].rotation.set(0, 0, -90);

    for (let i = 0; i < this.boxes.length; i++) {
      let box = this.boxes[i];
      this.scene.add(box);
    }
  }

  stop() {
    this.isPlaying = false;
  }

  play() {
    if (!this.isPlaying) {
      this.isPlaying = true;
      this.render();
    }
  }

  render() {
    if (!this.isPlaying) return;
    this.time += 0.05;

    this.material.uniforms.time.value = this.time;
    this.material.uniforms.thickness.value = this.settings.wireThickness;

    requestAnimationFrame(this.render.bind(this));
    this.renderer.render(this.scene, this.camera);
  }
}

new Sketch({
  dom: document.getElementById("container"),
});
