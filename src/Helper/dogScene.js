import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'

export default class DogScene {
  get dogModel() {
    return new URL('../Resources/dog.glb', import.meta.url)
  }
  get houseModel() {
    return new URL('../Resources/house.glb', import.meta.url)
  }
  backgroundColor = 0x85C88A
  dog = null
  house = null
  lastRenderedPlayTime = 0
  playTime = 0

  constructor(selector) {
    this.scene = new THREE.Scene();
    this.container = selector;
    this.setSize()
    this.initRenderer()
    this.setAmbientLight()
    this.initCamera()
    this.container.appendChild(this.renderer.domElement);
  }

  setSize() {
    this.width = this.container.offsetWidth;
    this.height = this.container.offsetHeight;
  }

  initRenderer() {
    this.renderer = new THREE.WebGLRenderer({
      antialias: true
    });
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.setSize(this.width, this.height);
    this.renderer.setClearColor(this.backgroundColor, 1);
    this.renderer.outputEncoding = THREE.sRGBEncoding;
  }

  initCamera() {

    this.camera = new THREE.PerspectiveCamera(
      70,
      this.width / this.height,
      0.001,
      1000
    );

    if(this.width < 1000) {
      this.camera.position.set(6, 2, 1);  
    }else {
      this.camera.position.set(4, 1.5, 3);
    } 
    
  }

  setAmbientLight() {
    const light = new THREE.AmbientLight(0x404040)
    light.intensity = 0.3
    this.scene.add(light);
    this.ambientLight = light
  }

  setSpotLight() {
    if(this.dog !== null) {
      const light = new THREE.SpotLight(0xffffff)
      light.intensity = 0.1
      light.castShadow = true
      light.penumbra = 0.4
      const modelPostion = this.dog.position
      light.position.set(modelPostion.x, modelPostion.y + 1, modelPostion.z + 0.5)
      light.target = this.dog
      this.spotLight = light
      this.scene.add(light)
    }
  }

  resize() {
    this.setSize()
    this.renderer.setSize(this.width, this.height);
    this.camera.aspect = this.width / this.height;
    this.camera.updateProjectionMatrix();
    this.render()
  }

  updatePlaytime(playTime) {
    if (this.spotLight == undefined) {
      this.setSpotLight()
    }
    this.playTime = playTime
    requestAnimationFrame(this.render.bind(this));
  }

  render() {
    if(this.dog === null) {
      return
    }
    if(this.playTime !== this.lastRenderedPlayTime) {
      const delta = this.playTime - this.lastRenderedPlayTime
      this.animateDog(delta)
      this.moveDog(delta)
      this.animateLight(delta)
    }
    this.camera.lookAt(this.dog.position)
    this.renderer.render(this.scene, this.camera);
  }

  animateDog(delta) {
    this.lastRenderedPlayTime = this.playTime
    this.mixer.update(delta)
  }

  moveDog(delta) {
    const position = this.dog.position
    this.dog.position.set(position.x, position.y, position.z + delta * 0.1)
  }

  animateLight(delta) {
    this.ambientLight.intensity += delta * 0.01
    this.spotLight.intensity += delta * 0.05
    this.spotLight.position.z += delta * 0.001
  }

  loadModel(modelURL) {
    const loader = new GLTFLoader()
    loader.load(modelURL.href, (gltf) => {
      gltf.scene.traverse((c) => {
        c.castShadow = true
      })
      this.scene.add(gltf.scene)
      if(modelURL.href === this.dogModel.href) {
        this.addDog(gltf)
      }
      else if(modelURL.href === this.houseModel.href) {
        this.addHouse(gltf)
      }else {
        console.error("Invalid model url ", modelURL)
      }
      this.render()
    }, null, function (error) {

      console.error(error);

    })
  }

  addDog(gltf) {
    this.dog = gltf.scene
    gltf.scene.scale.set(0.1, 0.1, 0.1)
    const dog = gltf.scene.children[0];
    this.mixer = new THREE.AnimationMixer(dog);
    this.mixer.clipAction(gltf.animations[0]).play();
    this.dog.position.set(0, 0, 0)
  }

  addHouse(gltf) {
    this.house = gltf.scene
    gltf.scene.scale.set(0.3, 0.3, 0.3)
    const dogPosition = this.dog?.position || {x: 0, y: 0, z: 0}
    this.house.position.set(dogPosition.x - 0.5, dogPosition.y - 0.08, dogPosition.z + 5)
    this.house.rotation.set(0, 3, 0)
  }
}
