<template>
  <div
    class="full-height gym-three-space"
    style="position: relative; overflow: hidden"
  >
    <div
      v-if="loadingSpace"
      class="full-height d-flex flex-column justify-center"
    >
      <p class="text-center">
        <small class="font-weight-bold">
          chargement ...
        </small>
      </p>
    </div>
    <div
      v-show="!loadingSpace"
      id="three-d-area"
      class="full-height --transparent"
    >
      <p class="text-center mt-10">
        chargement ...
      </p>
    </div>
    <div
      v-if="gymSpace"
      v-show="!loadingSpace"
      class="sectors-list full-width"
      :class="isDraggingScene ? '--in-dragging-scene' : null"
    >
      <div
        v-for="(sector, sectorIndex) in gymSpace.gym_sectors"
        v-show="sector.three_d_path"
        :id="`sector-label-${sector.id}`"
        :key="`sector-${sectorIndex}`"
        class="rounded font-weight-bold sector-label-in-space text-truncate"
        :class="highlightSectorId === sector.id ? '--highlight' : null"
        @click="filterBySector(sector.id)"
        @mousemove="highlightSector(sector)"
      >
        {{ sector.name }}
      </div>
    </div>
  </div>
</template>

<script setup>
  import * as THREE from 'three'
  import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
  import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'
  import { onActivated, onDeactivated, onMounted, ref } from 'vue'
  import { useThreeJs } from '@/composables/useThreeJs.js'

  const spaceObject = ref(null)
  const sectorBoundingBoxes = ref([])
  const sectorLineSegments = ref([])
  const loadingSpace = ref(true)
  const isDraggingScene = ref(false)
  const highlightSectorId = ref(false)
  const disableClick = ref(false)

  const {
    TDArea,
    camera,
    scene,
    renderer,
    edgeColor,
    orbitControls,
    buildGroundPlan,
    addShadowLight,
    fitCameraToObjects,
    renderScene,
    disableClickOnDragging,
    onMouseDown,
    startDragging,
    endDragging,
    initLabelInsensitiveEvent,
    initTDAResizer,
    autoRotateScene,
    stopAutoRotateScene,
    removeObject,
    calculatePointerPosition,
    raycaster,
    pointer,
  } = useThreeJs(updateLabelsPosition)

  const props = defineProps({ gym: Object, gymSpace: Object })

  onMounted(() => {
    TDArea.value = document.querySelector('#three-d-area')
    initThreeJs()
  })

  onActivated(() => {
    console.log('activated')
    autoRotateScene(-0.6)
  })

  onDeactivated(() => {
    console.log('deactivated')
    stopAutoRotateScene()
  })

  function initThreeJs () {
    if (props.gymSpace.three_d_gltf_url === null) {
      return
    }

    // Camera
    camera.value = new THREE.PerspectiveCamera(45, TDArea.offsetWidth / TDArea.offsetHeight, 1, 200)
    camera.value.position.z = props.gymSpace.three_d_camera_position?.z || 25
    camera.value.position.y = props.gymSpace.three_d_camera_position?.y || 25
    camera.value.position.x = props.gymSpace.three_d_camera_position?.x || 25

    // Scene
    scene.value = new THREE.Scene()
    scene.value.background = null

    // Ambient Light
    const ambientLight = new THREE.AmbientLight('rgb(255,255,255)', 0.7)
    scene.value.add(ambientLight)

    // Hemisphere Light
    const light = new THREE.HemisphereLight('rgb(255,255,255)', 'rgb(0,0,0)', 3)
    scene.value.add(light)

    // Renderer
    renderer.value = new THREE.WebGLRenderer({ antialias: true, alpha: true })
    renderer.value.shadowMap.enabled = true
    renderer.value.shadowMap.type = THREE.PCFSoftShadowMap
    renderer.value.setPixelRatio(window.devicePixelRatio)
    renderer.value.setSize(TDArea.value.offsetWidth, TDArea.value.offsetHeight)

    // Orbit orbitControls
    orbitControls.value = new OrbitControls(camera.value, renderer.value.domElement)

    // Load files
    const loader = new GLTFLoader()

    const edgeLine = new THREE.LineBasicMaterial({ color: edgeColor.value, opacity: 0.2, transparent: true })
    loader.load(props.gymSpace.three_d_gltf_url, gltf => {
      const object = gltf.scene
      spaceObject.value = object

      const treatedColors = []
      object.traverse(child => {
        if (child.isMesh) {
          child.castShadow = true
          child.receiveShadow = true
          // Add Edges
          if (props.gymSpace.three_d_parameters?.highlight_edges) {
            const edges = new THREE.EdgesGeometry(child.geometry)
            const line = new THREE.LineSegments(edges, edgeLine)
            child.add(line)
          }

          // color correction
          if (props.gymSpace.three_d_parameters?.color_correction_sketchup_exports && !treatedColors.includes(child.material.uuid)) {
            const color = child.material.color
            const rgbColor = `rgb(${Math.round(255 * color.r)}, ${Math.round(255 * color.g)}, ${Math.round(255 * color.b)})`
            child.material.color = new THREE.Color(rgbColor)
            treatedColors.push(child.material.uuid)
          }
        }
      })

      scene.value.add(object)

      // Update line Segments color
      for (const child of object.children) {
        if (child.isLineSegments) {
          child.material = edgeLine
        }
      }

      // Center space on center of scene
      const box = new THREE.Box3().setFromObject(object)
      const center = new THREE.Vector3()
      box.getCenter(center)
      orbitControls.value.target.copy(center)
      buildGroundPlan([object])
      addShadowLight([object])
      orbitControls.value.update()

      loadingSpace.value = false
      setTimeout(() => {
        fitCameraToObjects([spaceObject.value])
        TDArea.value.classList.remove('--transparent')
      }, 100)
    })

    TDArea.value.innerHTML = null
    TDArea.value.append(renderer.value.domElement)

    // Orbit controller
    orbitControls.value.minDistance = 1
    orbitControls.value.maxDistance = 100
    orbitControls.value.maxPolarAngle = Math.PI / 2
    orbitControls.value.addEventListener('change', renderScene)

    // Raycaster and mouse setup
    raycaster.value = new THREE.Raycaster()
    pointer.value = new THREE.Vector2()

    TDArea.value.addEventListener('mousemove', disableClickOnDragging, false)
    TDArea.value.addEventListener('mousedown', onMouseDown)
    orbitControls.value.addEventListener('start', startDragging)
    orbitControls.value.addEventListener('end', endDragging)

    TDArea.value.addEventListener('mousemove', pointerMouveEvent, false)
    TDArea.value.addEventListener('mouseup', pointerUpEvent, false)

    sectorsBuilder()
    initLabelInsensitiveEvent()
    initTDAResizer()
    // autoRotateScene(-0.6)
  }

  function sectorsBuilder () {
    clearSectors()
    for (const sector of props.gymSpace.gym_sectors) {
      if (sector.three_d_path !== null) {
        sectorBuilder(sector)
      }
    }
  }

  function sectorBuilder (sector) {
    const points = sector.three_d_path

    // Création d'un shape 2D pour extrusion
    const shapePoints = []
    for (const point of points) {
      shapePoints.push(new THREE.Vector2(point.x, point.z))
    }
    const shape = new THREE.Shape(shapePoints)

    const extrudeGeometry = new THREE.ExtrudeGeometry(shape, {
      depth: -(sector.three_d_height - sector.three_d_elevated),
      bevelEnabled: false,
      bevelSegments: 2,
      steps: 1,
      bevelSize: 0,
      bevelThickness: 0,
    })
    const boundingBox = new THREE.Mesh(extrudeGeometry, new THREE.MeshBasicMaterial({ color: 'white', transparent: true, opacity: 0.3, side: THREE.DoubleSide }))
    boundingBox.visible = false
    boundingBox.rotateX(THREE.MathUtils.degToRad(90))
    boundingBox.translateZ(-sector.three_d_elevated)
    boundingBox.userData = { sector }
    sectorBoundingBoxes.value.push(boundingBox)
    scene.value.add(boundingBox)

    // Create edge sector
    const edges = new THREE.EdgesGeometry(extrudeGeometry)
    const lineMaterial = new THREE.LineBasicMaterial({
      color: props.gymSpace.sectors_color || 'rgb(0, 0, 0)',
      linewidth: 3,
    })
    const lineSegments = new THREE.LineSegments(edges, lineMaterial)
    lineSegments.rotateX(THREE.MathUtils.degToRad(90))
    lineSegments.translateZ(-sector.three_d_elevated)
    lineSegments.computeLineDistances()
    lineSegments.visible = false
    lineSegments.userData = { sector }
    sectorLineSegments.value.push(lineSegments)
    scene.value.add(lineSegments)
    renderScene()
  }

  function clearSectors () {
    for (const object of sectorBoundingBoxes.value) {
      removeObject(object)
    }
    for (const object of sectorLineSegments.value) {
      removeObject(object)
    }
    sectorBoundingBoxes.value = []
    sectorLineSegments.value = []
  }

  function pointerMouveEvent (event) {
    calculatePointerPosition(event)
    event.preventDefault()

    unHighlightSector({ render: false })

    // Check intersections on bounding boxes
    const intersects = raycaster.value.intersectObjects(sectorBoundingBoxes.value)
    if (intersects.length > 0) {
      highlightSector(intersects[0].object.userData.sector, { render: false })
    }
    renderScene()
  }

  function pointerUpEvent (event) {
    event.preventDefault()
    calculatePointerPosition(event)

    // CALLBACK WHEN CLICK ON SECTOR
    if (!disableClick.value) {
      const intersects = raycaster.value.intersectObjects(sectorBoundingBoxes.value)
      if (intersects.length > 0) {
        const sector = intersects[0].object.userData.sector
        filterBySector(sector.id)
      }
    }
  }

  function filterBySector () {
    // const query = { ...this.$route.query } || {}
    // query.sector = sectorId
    // this.$router.push({ path: this.$route.path, query })
  }

  function unHighlightSector (options = {}) {
    options.render ??= true
    highlightSectorId.value = null
    if (options.render) {
      renderScene()
    }
  }

  function highlightSector (sector, options = {}) {
    options.render ??= true
    unHighlightSector({ render: false })
    for (const boxSector of sectorBoundingBoxes.value) {
      boxSector.visible = boxSector.userData.sector.id === sector.id
    }
    for (const lineSector of sectorLineSegments.value) {
      lineSector.visible = lineSector.userData.sector.id === sector.id
    }
    highlightSectorId.value = sector.id
    if (options.render) {
      renderScene()
    }
  }

  function updateLabelsPosition () {
    if (document.querySelector('.gym-three-space') === null) {
      console.log('no space')
      return false
    }

    const tempV = new THREE.Vector3()
    for (const sector of sectorBoundingBoxes.value) {
      const box = new THREE.Box3().setFromObject(sector)
      const size = new THREE.Vector3()
      const center = new THREE.Vector3()
      box.getSize(size)
      box.getCenter(center)
      let centerX, centerZ, gapY
      if (sector.userData.sector.three_d_label_options) {
        centerX = sector.userData.sector.three_d_label_options.x === null ? 50 : sector.userData.sector.three_d_label_options.x
        centerZ = sector.userData.sector.three_d_label_options.z === null ? 50 : sector.userData.sector.three_d_label_options.z
        gapY = sector.userData.sector.three_d_label_options.y === null ? 0.2 : sector.userData.sector.three_d_label_options.y
      } else {
        centerX = 50
        centerZ = 50
        gapY = 0.2
      }
      center.y = center.y * 2 + gapY - Number.parseFloat(sector.userData.sector.three_d_elevated)
      center.x = center.x + size.x * (centerX - 50) / 100
      center.z = center.z + size.z * (centerZ - 50) / 100
      tempV.copy(center)
      tempV.project(camera.value)

      // convert the normalized position to CSS coordinates
      const x = (tempV.x * 0.5 + 0.5) * TDArea.value.offsetWidth
      const y = (tempV.y * -0.5 + 0.5) * TDArea.value.offsetHeight

      const domElement = document.querySelector(`#sector-label-${sector.userData.sector.id}`)
      domElement.style.transform = `translate(-50%, -50%) translate(${x}px,${y}px)`
      domElement.style.zIndex = Math.trunc(-tempV.z * 0.5 + 0.5)
    }
  }
</script>

<style lang="scss">
.gym-three-space {
  #three-d-area {
    height: 100vh;
    transition: opacity 0.1s;
    &.--transparent {
      opacity: 0;
    }
  }
  .sectors-list {
    position: absolute;
    top: 0;
    left: 0;
    will-change: opacity;
    transition: opacity 0.2s;
    opacity: 1;
    .sector-label-in-space {
      color: black;
      position: absolute;
      top: 0;
      left: 0;
      white-space: nowrap;
      background-color: rgba(255, 255, 255, 0.8);
      font-size: 0.6em;
      padding: 2px 5px;
      cursor: pointer;
      &.--highlight {
        color: white;
        background-color: rgba(0, 0, 0, 0.8);
      }
    }
    &.--in-dragging-scene {
      opacity: 0.3;
      .sector-label-in-space {
        background-color: rgba(255, 255, 255, 0);
      }
    }
  }

  @media only screen and (max-width: 600px) {
    .sectors-list {
      .sector-label-in-space {
        max-width: 80px;
      }
    }
  }
}
</style>
