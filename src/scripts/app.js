import '@babel/polyfill';
import '../scss/demo.scss';

export default class App {
  init() {
    this.icosahedron = this.getIcosahedron(0xff005c);
    this.velocity = .08;
    this.angle = 0;

    this.patterns = [{
      id: 'hiro',
      mesh: this.getHole()
    }, {
      id: 'letterA',
      mesh: this.getTourus()
    },
    {
      id: 'letterB',
      mesh: this.getIcosahedron()
    },
    {
      id: 'letterC',
      mesh: this.getSphere()
    }];

    this.createScene();
    this.createCamera();
    this.addAmbientLight();
    this.addSpotLight();
    this.addRectLight();

    this.setupARToolkitContext();
    this.setupARToolkitSource();
    this.mapMarkersWithMeshes();

    this.animate();
  }

  createScene() {
    this.scene = new THREE.Scene();

    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    this.renderer.setClearColor(0x000000, 0);
    this.renderer.setSize(640, 480);

    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    document.body.appendChild(this.renderer.domElement);
  }

  createCamera() {
    const width = window.innerWidth;
    const height = window.innerHeight;

    this.camera = new THREE.OrthographicCamera(width / - 2, width / 2, height / 2, height / - 2, 1, 1000);

    this.scene.add(this.camera);
  }

  addRectLight() {
    const rectLight = new THREE.RectAreaLight('#0077ff', 1, 2000, 2000);

    rectLight.position.set(5, 50, 50);
    rectLight.lookAt(0, 0, 0);

    this.scene.add(rectLight);
  }

  addSpotLight() {
    const spotLight = new THREE.SpotLight(0xffffff);

    spotLight.position.set(0, 10, 0);
    spotLight.castShadow = true;

    this.scene.add(spotLight);
  }

  addAmbientLight() {
    this.scene.add(new THREE.AmbientLight(0xffffff));
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

  getTourus() {
    const mesh = new THREE.Mesh(new THREE.TorusBufferGeometry(10, 3, 16, 100), new THREE.MeshPhysicalMaterial({
      color: 0xff00ff,
      metalness: .58,
      emissive: '#000000',
      roughness: .18,
    }));

    mesh.scale.set(.1, .1, .1)
    mesh.position.set(0, 2, 0);

    return mesh;
  }

  getIcosahedron(color = 0x00ff00) {
    const mesh = new THREE.Mesh(new THREE.IcosahedronGeometry(1, 0), new THREE.MeshPhysicalMaterial({
      color,
      metalness: .58,
      emissive: '#000000',
      roughness: .18,
    }));

    mesh.position.set(0, 2, 0);

    return mesh;
  }

  getSphere() {
    const mesh = new THREE.Mesh(new THREE.SphereGeometry(1, 32, 32), new THREE.MeshPhysicalMaterial({
      color: 0x0986f5,
      metalness: .58,
      emissive: '#000000',
      roughness: .18,
    }));

    mesh.position.set(0, 2, 0);

    return mesh;
  }

  getHole() {
    const group = new THREE.Group();
    const cube = new THREE.Mesh(new THREE.BoxGeometry(2, 2, 2), new THREE.MeshPhysicalMaterial({ color: 0xffffff, side: THREE.BackSide, transparent: true }));
    cube.position.y = -1;

    group.add(cube);

    const geometry = new THREE.PlaneGeometry(18, 18, 9, 9);
    geometry.faces.splice(80, 2);
    geometry.faceVertexUvs[0].splice(80, 2);

    const mesh = new THREE.Mesh(geometry, new THREE.MeshBasicMaterial({ colorWrite: false }));
    mesh.rotation.x = -Math.PI / 2;

    group.add(mesh);

    this.icosahedron = this.getIcosahedron(0xff005c);
    this.icosahedron.position.y = -.5;
    this.icosahedron.scale.set(.5, .5, .5);

    group.add(this.icosahedron);

    return group;
  }

  mapMarkersWithMeshes() {
    this.patterns.map((pattern) => {
      const markerRoot = new THREE.Group();

      this.scene.add(markerRoot);

      new THREEx.ArMarkerControls(this.arToolkitContext, markerRoot, {
        type: 'pattern', patternUrl: `./data/${pattern.id}.patt`,
      });

      markerRoot.add(pattern.mesh);
    });
  }

  onResize() {
    this.arToolkitSource.onResizeElement();
    this.arToolkitSource.copyElementSizeTo(this.renderer.domElement);

    if (this.arToolkitContext.arController) {
      this.arToolkitSource.copyElementSizeTo(this.arToolkitContext.arController.canvas)
    }
  }

  animate() {

    this.renderer.render(this.scene, this.camera);

    this.patterns[1].mesh.rotation.y += .05;
    this.patterns[2].mesh.rotation.y += .05;

    this.patterns[1].mesh.rotation.x -= .08;
    this.patterns[2].mesh.rotation.x -= .08;

    this.icosahedron.rotation.y += .05;
    this.icosahedron.rotation.x -= .08;

    this.patterns[3].mesh.position.x = Math.sin(this.angle);

    if (this.arToolkitSource && this.arToolkitSource.ready) {
      this.arToolkitContext.update(this.arToolkitSource.domElement);
    }

    this.angle += this.velocity;

    requestAnimationFrame(this.animate.bind(this));
  }
}
