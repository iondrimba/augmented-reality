import '@babel/polyfill';
import '../scss/demo.scss';
// import'./threex/threex-artoolkitsource';
// import'./threex/threex-artoolkitcontext';
// import'./jsartoolkit5/artoolkit.min';
// import'./jsartoolkit5/artoolkit.api';
// import'./threex/threex-arbasecontrols';
// import'./threex/threex-armarkercontrols';

export default class App {
  async init() {
    this.star = new THREE.Object3D();
    this.house = new THREE.Object3D();

    this.createScene();
    this.createCamera();
    this.addAmbientLight();
    this.addSpotLight();
    this.addCameraControls();
    this.addFloor();

    // this.spaceShip = await this.loadModelsAsync('dinosaur');
    // this.spaceShip.scale.set(7, 7, 7);

    // this.dinosaur = await this.loadModelsAsync('dinosaur');
    // this.dinosaur.scale.set(5, 5, 5);
    // this.dinosaur.rotateY(this.radians(180));
    // this.dinosaur.position.set(15, 0, 15);
    // this.scene.add(this.dinosaur);

    // this.tower = await this.loadModelsAsync('tower');
    // this.tower.scale.set(5, 5, 5);
    // this.tower.rotateY(this.radians(180));
    // this.tower.position.set(-30, 0, -30);
    // this.scene.add(this.tower);

    var geometry = new THREE.BoxGeometry(1, 1, 1);
    var material = new THREE.MeshBasicMaterial({ color: 0xff00ff });
    this.cube = new THREE.Mesh(geometry, material);
    // this.cube.position.set(0, 0, 0);

    this.setupARToolkitContext();
    this.setupARToolkitSource();
    this.setupMarkers();
    this.animate();
  }

  setupARToolkitContext() {
    this.arToolkitContext = new THREEx.ArToolkitContext({
      cameraParametersUrl: './data/camera_para.dat',
      detectionMode: 'mono'
    });

    this.arToolkitContext.init(() => {
      this.camera.projectionMatrix.copy(this.arToolkitContext.getProjectionMatrix());
    });
  }

  setupARToolkitSource() {
    this.arToolkitSource = new THREEx.ArToolkitSource({
      sourceType: 'webcam',
    });

    this.arToolkitSource.init(() => {
      this.onResize();
    });
  }

  setupMarkers() {
    const patternArray = [{
      id: 'letterA',
      model: this.cube
    }];

    patternArray.map((pattern) => {
      const markerRoot = new THREE.Group();
      this.scene.add(markerRoot);

      new THREEx.ArMarkerControls(this.arToolkitContext, markerRoot, {
        type: 'pattern', patternUrl: `./data/${pattern.id}.patt`,
      });

      markerRoot.add(pattern.model);
    });
  }

  loadModelsAsync(name) {
    return new Promise((resolve) => {
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

          resolve(object);
        });
      });
    })
  }

  createScene() {
    this.scene = new THREE.Scene();

    this.renderer = new THREE.WebGLRenderer({ alpha: true});
    this.renderer.setClearColor( 0x000000, 0 ); // the default
    this.renderer.setSize(window.innerWidth, window.innerHeight);

    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    document.body.appendChild(this.renderer.domElement);
  }

  createCamera() {
    this.camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 1, 1000);
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

    this.arToolkitSource.onResize();
    this.arToolkitSource.copyElementSizeTo(this.renderer.domElement);

    if (this.arToolkitContext.arController) {
      this.arToolkitSource.copyElementSizeTo(this.arToolkitContext.arController.canvas)
    }
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

    if (this.arToolkitSource && this.arToolkitSource.ready) {
      this.arToolkitContext.update(this.arToolkitSource.domElement);
    }

    requestAnimationFrame(this.animate.bind(this));
  }

  radians(degrees) {
    return degrees * Math.PI / 180;
  }
}
