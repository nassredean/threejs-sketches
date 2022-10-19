import * as THREE from "three";

import postFragment from "../../shaders/fragmentScanlinePost.glsl";
import postVertex from "../../shaders/vertexPost.glsl";

class PostEffect {
  constructor(texture) {
    this.uniforms = {
      // time elapsed since start
      time: {
        type: "f",
        value: 0,
      },

      resolution: {
        type: "v2",
        value: new THREE.Vector2(window.innerWidth, window.innerHeight),
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
      new THREE.PlaneBufferGeometry(2, 2),
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

  resize() {
    this.uniforms.resolution.value.set(window.innerWidth, window.innerHeight);
  }
}

export default class Sketch {
  constructor(options) {
    this.container = options.dom;

    this.renderer = new THREE.WebGLRenderer({ alpha: true, antialias: false });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setClearColor(new THREE.Color("white"), 1.0);

    this.container.appendChild(this.renderer.domElement);

    this.renderTarget = new THREE.WebGLRenderTarget(
      window.innerWidth,
      window.innerHeight
    )

    this.scene = new THREE.Scene();
    this.camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

    this.rtScene = new THREE.Scene();
    this.rtCamera = new THREE.PerspectiveCamera(
      45,
      window.innerWidth / window.innerHeight,
      1,
      10000
    );

    this.time = 0;

    this.postEffect = new PostEffect(this.renderTarget.texture);
    this.scene.add(this.postEffect.obj)

    this.render();
    this.setupResize();
  }

  setupResize() {
    window.addEventListener("resize", this.resize.bind(this));
  }

  resize() {}

  render() {
    this.time += 0.05;

    // draw render target scene to render target
    this.renderer.setRenderTarget(this.renderTarget);
    this.renderer.render(this.rtScene, this.rtCamera);
    this.renderer.setRenderTarget(null);

    // update the post effect
    this.postEffect.render(this.time);
    this.renderer.render(this.scene, this.camera);

    requestAnimationFrame(this.render.bind(this));
  }
}

new Sketch({
  dom: document.getElementById("container"),
});
