import * as THREE from "three";

import postFragment from "../../shaders/fragmentScanlinePost.glsl";
import postVertex from "../../shaders/vertexPost.glsl";

class PostEffect {
  constructor(texture, width, height) {
    this.uniforms = {
      // time elapsed since start
      time: {
        type: "f",
        value: 0,
      },

      resolution: {
        type: "v2",
        value: new THREE.Vector2(width, height),
      },

      // render target texture
      texture: {
        type: "t",
        value: texture,
      },
    };
    this.obj = this.createObj(texture);
  }

  createObj() {
    return new THREE.Mesh(
      new THREE.PlaneGeometry(2, 2),
      new THREE.RawShaderMaterial({
        uniforms: this.uniforms,
        vertexShader: postVertex,
        fragmentShader: postFragment,
      })
    );
  }

  render(time) {
    this.uniforms.time.value = time;
  }

  resize(width, height) {
    this.uniforms.resolution.value.set(width, height);
  }
}

export default class Sketch {
  constructor(options) {
    this.container = options.dom;
    this.width = this.container.offsetWidth;
    this.height = this.container.offsetHeight;

    this.renderer = new THREE.WebGLRenderer({ alpha: true, antialias: false });
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.setSize(this.width, this.height);
    this.renderer.setClearColor(new THREE.Color("white"), 1.0);
    this.renderer.outputEncoding = THREE.sRGBEncoding;

    this.container.appendChild(this.renderer.domElement);

    this.renderTarget = new THREE.WebGLRenderTarget(this.width, this.height);

    this.renderTargetScene = new THREE.Scene();
    this.renderTargetCamera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(
      45,
      this.width / this.height,
      1,
      10000
    );

    this.time = 0;

    this.postEffect = new PostEffect(
      this.renderTarget.texture,
      this.width,
      this.height
    );
    this.renderTargetScene.add(this.postEffect.obj);

    this.play();
    this.setupResize();
  }

  play() {
    if (!this.isPlaying) {
      this.isPlaying = true;
      this.render();
    }
  }

  stop() {
    this.isPlaying = false;
  }

  setupResize() {
    window.addEventListener("resize", this.resize.bind(this));
  }

  resize() {
    this.width = this.container.offsetWidth;
    this.height = this.container.offsetHeight;
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderTarget.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.postEffect.resize();
  }

  render() {
    if (!this.isPlaying) return;
    this.time += 0.05;

    // draw render target scene to render target
    this.renderer.setRenderTarget(this.renderTarget);
    this.renderer.render(this.scene, this.camera);
    this.renderer.setRenderTarget(null);

    // update the post effect
    this.postEffect.render(this.time, this.width, this.height);
    this.renderer.render(this.renderTargetScene, this.renderTargetCamera);

    requestAnimationFrame(this.render.bind(this));
  }
}

new Sketch({
  dom: document.getElementById("container"),
});
