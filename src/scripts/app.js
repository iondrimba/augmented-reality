import '@babel/polyfill';
import '../scss/demo.scss';
// import'./threex/threex-artoolkitsource';
// import'./threex/threex-artoolkitcontext';
// import'./jsartoolkit5/artoolkit.min';
// import'./jsartoolkit5/artoolkit.api';
// import'./threex/threex-arbasecontrols';
// import'./threex/threex-armarkercontrols';

const radians = (degrees) => {
  return degrees * Math.PI / 180;
}

const distance = (x1, y1, x2, y2) => {
  return Math.sqrt(Math.pow((x1 - x2), 2) + Math.pow((y1 - y2), 2));
}

const map = (value, istart, istop, ostart, ostop) => {
  return ostart + (ostop - ostart) * ((value - istart) / (istop - istart));
}

const hexToRgbTreeJs = (hex) => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);

  return result ? {
    r: parseInt(result[1], 16) / 255,
    g: parseInt(result[2], 16) / 255,
    b: parseInt(result[3], 16) / 255
  } : null;
}

export default class App {
  async init() {
    this.star = new THREE.Object3D();
    this.house = new THREE.Object3D();
    this.gutter = { size: 0 };
    this.meshes = [];
    this.grid = { cols: 30, rows: 30 };
    this.width = window.innerWidth;
    this.height = window.innerHeight;
    this.velocity = -.1;
    this.angle = 0;
    this.amplitude = .1;
    this.radius = 1;
    this.waveLength = 200;
    this.ripple = {};
    this.interval = 0;
    this.waterDropPositions = [];
    this.ripples = [];

    this.createScene();
    this.createCamera();
    this.addAmbientLight();
    this.addSpotLight();

    // var geometry = new THREE.BoxGeometry(10, 10, 10);
    // var material = new THREE.MeshBasicMaterial({ color: 0xff00ff });
    // this.cube = new THREE.Mesh(geometry, material);
    // this.cube.position.set(0, 0, 0);

    var geometry = new THREE.SphereGeometry(1, 32, 32);
    var material = new THREE.MeshNormalMaterial({ color: 0xffff00 });

    this.modelA = new THREE.Mesh(geometry, material);
    this.modelB = new THREE.Mesh(geometry, material);

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
      model: this.modelA
    },
    {
      id: 'letterB',
      model: this.modelB
    }];

    patternArray.map((pattern, i) => {
      const markerRoot = new THREE.Group();
      this.scene.add(markerRoot);

      new THREEx.ArMarkerControls(this.arToolkitContext, markerRoot, {
        type: 'pattern', patternUrl: `./data/${pattern.id}.patt`,
      });

      markerRoot.position.set(i * 50, 0, 0);
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

    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.setSize(640, 480);
    this.renderer.setClearColor(0x000000, 0);

    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    document.body.appendChild(this.renderer.domElement);
  }

  createCamera() {
    const width = window.innerWidth;
    const height = window.innerHeight;

    this.camera = new THREE.OrthographicCamera( width / - 2, width / 2, height / 2, height / - 2, 1, 1000 );

    this.scene.add(this.camera);
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
