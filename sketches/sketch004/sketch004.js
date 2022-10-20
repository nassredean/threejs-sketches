import * as THREE from "three";

import Stats from "three/examples/jsm/libs/stats.module.js";

import GUI from "lil-gui";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import RoseModel from "../../models/rose.glb";

import {
  BackSide,
  BoxGeometry,
  Mesh,
  MeshLambertMaterial,
  MeshStandardMaterial,
  PointLight,
  Scene,
} from "three";

class EnvironmentScene extends Scene {
  constructor() {
    super();

    const geometry = new BoxGeometry();
    geometry.deleteAttribute("uv");

    const mainLight = new PointLight(0xffffff, 50, 0, 2);
    this.add(mainLight);

    const material1 = new MeshLambertMaterial({
      color: 0xff0000,
      emissive: 0xffffff,
      emissiveIntensity: 10,
    });
    const light1 = new Mesh(geometry, material1);
    light1.position.set(-5, 2, 0);
    light1.scale.set(0.1, 1, 1);
    this.add(light1);

    const material2 = new MeshLambertMaterial({
      color: 0x00ff00,
      emissive: 0xffffff,
      emissiveIntensity: 10,
    });
    const light2 = new Mesh(geometry, material2);
    light2.position.set(0, 5, 0);
    light2.scale.set(1, 0.1, 1);
    this.add(light2);

    const material3 = new MeshLambertMaterial({
      color: 0x0000ff,
      emissive: 0xffffff,
      emissiveIntensity: 10,
    });
    const light3 = new Mesh(geometry, material3);
    light3.position.set(2, 1, 5);
    light3.scale.set(1.5, 2, 0.1);
    this.add(light3);
  }
}

const params = {
  roughness: 0.0,
  metalness: 0.0,
  exposure: 1.0,
};

let container, stats;
let camera, scene, renderer, controls;
// let torusMesh;
let floorMesh;
let generatedCubeRenderTarget;

function init() {
  container = document.getElementById("container");

  camera = new THREE.PerspectiveCamera(
    40,
    window.innerWidth / window.innerHeight,
    1,
    1000
  );
  camera.position.set(0, 45, 175);

  scene = new THREE.Scene();
  scene.background = new THREE.Color(0x000000);

  renderer = new THREE.WebGLRenderer();
  renderer.physicallyCorrectLights = true;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;

  // let geometry = new THREE.TorusKnotGeometry(18, 8, 150, 20);
  // let geometry = new THREE.SphereGeometry( 26, 64, 32 );
  // let material = new THREE.MeshStandardMaterial({
  //   color: 0xffffff,
  //   metalness: params.metalness,
  //   roughness: params.roughness,
  // });

  // torusMesh = new THREE.Mesh(geometry, material);
  // scene.add(torusMesh);

  const geoFloor = new THREE.BoxGeometry(200, 0.1, 200);
  const matStdFloor = new THREE.MeshStandardMaterial({
    color: 0x808080,
    roughness: 0.1,
    metalness: 0,
  });
  floorMesh = new THREE.Mesh(geoFloor, matStdFloor);
  scene.add(floorMesh);

  const loader = new GLTFLoader();
  loader.load(RoseModel, (gltf) => {
    let rose = gltf.scene.children[0];
    rose.material = matStdFloor;
    rose.position.y += 10;
    scene.add(rose);
  });

  THREE.DefaultLoadingManager.onLoad = function () {
    pmremGenerator.dispose();
  };

  const pmremGenerator = new THREE.PMREMGenerator(renderer);
  pmremGenerator.compileCubemapShader();

  const envScene = new EnvironmentScene();
  generatedCubeRenderTarget = pmremGenerator.fromScene(envScene);

  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(window.innerWidth, window.innerHeight);
  container.appendChild(renderer.domElement);

  //renderer.toneMapping = ReinhardToneMapping;
  renderer.outputEncoding = THREE.sRGBEncoding;

  stats = new Stats();
  container.appendChild(stats.dom);

  controls = new OrbitControls(camera, renderer.domElement);
  controls.minDistance = 50;
  controls.maxDistance = 1000;

  window.addEventListener("resize", onWindowResize);

  const gui = new GUI();

  gui.add(params, "roughness", 0, 1, 0.01);
  gui.add(params, "metalness", 0, 1, 0.01);
  gui.add(params, "exposure", 0, 2, 0.01);
  gui.open();
}

function onWindowResize() {
  const width = window.innerWidth;
  const height = window.innerHeight;

  camera.aspect = width / height;
  camera.updateProjectionMatrix();

  renderer.setSize(width, height);
}

function animate() {
  requestAnimationFrame(animate);
  stats.begin();
  render();
  stats.end();
}

function render() {
  let renderTarget, cubeMap;
  renderTarget = generatedCubeRenderTarget;
  cubeMap = generatedCubeRenderTarget.texture;

  const newEnvMap = renderTarget ? renderTarget.texture : null;

  if (newEnvMap && newEnvMap !== floorMesh.material.envMap) {
    floorMesh.material.envMap = newEnvMap;
    floorMesh.material.needsUpdate = true;
  }

  scene.background = cubeMap;
  renderer.toneMappingExposure = params.exposure;

  // console.log(camera.position)
  // console.log(camera.rotation)

  renderer.render(scene, camera);
}

init();
animate();
