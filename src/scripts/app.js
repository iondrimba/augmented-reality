import '../scss/demo.scss';

export default class App {
  constructor() {
    this.init();
  }

  init() {
    this.star = new THREE.Object3D();
    this.house = new THREE.Object3D();

    this.createScene();
    this.createCamera();
    this.addAmbientLight();
    this.addSpotLight();

    this.addCameraControls();
    this.addFloor();

    this.animate();

    this.loadModels('space-ship', (spaceShip) => {
      const scale = 7;
      spaceShip.scale.set(scale, scale, scale);

      this.scene.add(spaceShip);
    });

    this.loadModels('dinosaur', (dinosaur) => {
      const scale = 5;

      dinosaur.scale.set(scale, scale, scale);
      dinosaur.rotateY(this.radians(180));
      dinosaur.position.set(15, 0, 15);

      this.scene.add(dinosaur);
    });

    this.loadModels('tower', (tower) => {
      const scale = 5;

      tower.scale.set(scale, scale, scale);
      tower.rotateY(this.radians(180));
      tower.position.set(-30, 0, -30);

      this.scene.add(tower);
    });
  }

  loadModels(name, callback) {
    const mtlLoader = new THREE.MTLLoader();
    const folder = 'models/';

    mtlLoader.setPath(folder);
    mtlLoader.load(`${name}.mtl`, (materials) => {
      materials.preload();

      const objLoader = new THREE.OBJLoader();

      objLoader.setMaterials(materials);
      objLoader.setPath(folder);

      objLoader.load(`${name}.obj`, (object) => {
        object.castShadow = true;

        callback(object);
      });
    });
  }

  createScene() {
    this.scene = new THREE.Scene();

    this.renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    this.renderer.setSize(window.innerWidth, window.innerHeight);

    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    document.body.appendChild(this.renderer.domElement);
  }

  createCamera() {
    this.camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight);
    this.camera.position.set(-5, 19, 32);

    this.scene.add(this.camera);
  }

  addCameraControls() {
    this.controls = new THREE.OrbitControls(this.camera);
  }

  addGrid() {
    const size = 25;
    const divisions = 25;
    const gridHelper = new THREE.GridHelper(size, divisions);

    gridHelper.position.set(0, -5, 0);
    gridHelper.material.opacity = 0.50;
    gridHelper.material.transparent = false;

    this.scene.add(gridHelper);
  }

  onResize() {
    const ww = window.innerWidth;
    const wh = window.innerHeight;

    this.camera.aspect = ww / wh;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(ww, wh);
  }

  addFloor() {
    const planeGeometry = new THREE.PlaneGeometry(100, 100);
    const planeMaterial = new THREE.ShadowMaterial({ opacity: 1 });
    const plane = new THREE.Mesh(planeGeometry, planeMaterial);

    planeGeometry.rotateX(- Math.PI / 2);

    plane.position.y = -5;
    plane.receiveShadow = true;

    this.scene.add(plane);
  }

  rotateObject(group, value) {
    group.rotation.y += value;
  }

  addSpotLight() {
    const spotLight = new THREE.SpotLight(0xffffff);

    spotLight.position.set(4, 30, 1);
    spotLight.castShadow = true;

    this.scene.add(spotLight);
  }

  addAmbientLight() {
    const light = new THREE.AmbientLight(0xffffff);

    this.scene.add(light);
  }

  animate() {
    this.controls.update();

    this.renderer.render(this.scene, this.camera);

    requestAnimationFrame(this.animate.bind(this));
  }

  radians(degrees) {
    return degrees * Math.PI / 180;
  }
}
