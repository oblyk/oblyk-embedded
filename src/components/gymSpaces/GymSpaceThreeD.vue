<template>
  <div
    class="full-height gym-three-space"
    style="position: relative; overflow: hidden"
  >
    <div
      v-if="loadingSpace"
      class="full-height d-flex flex-column justify-center"
    >
      <div class="loading-space-three-d d-flex align-center justify-center text-center">
        <div>
          <animate-oblyk-logo color="#6200EA" stroke-linejoin="round" />
          <p class="font-weight-medium text-disabled mt-0">
            {{ t('loading3D') }}
          </p>
        </div>
      </div>
    </div>
    <div
      v-show="!loadingSpace"
      id="three-d-area"
      class="full-height --transparent"
    >
      <div class="loading-space-three-d d-flex align-center justify-center text-center">
        <div>
          <animate-oblyk-logo color="#6200EA" stroke-linejoin="round" />
          <p class="font-weight-medium text-disabled mt-0">
            {{ t('loading3D') }}
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
  import * as THREE from 'three'
  import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
  import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'
  import { Text } from 'troika-three-text'
  import { inject, onMounted, ref } from 'vue'
  import { useI18n } from 'vue-i18n'
  import AnimateOblykLogo from '@/components/ui/AnimateOblykLogo.vue'
  import { useThreeJs } from '@/composables/useThreeJs.js'

  const { t } = useI18n()
  const spaceObject = ref(null)
  const sectorBoundingBoxes = ref([])
  const sectorLineSegments = ref([])
  const loadingSpace = ref(true)
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
    removeObject,
    calculatePointerPosition,
    threeDLabels,
    raycaster,
    pointer,
  } = useThreeJs()

  const props = defineProps({ gym: Object, gymSpace: Object })

  const switchGymSector = inject('Gym:switchGymSector')

  onMounted(() => {
    TDArea.value = document.querySelector('#three-d-area')
    initThreeJs()
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

      setTimeout(() => {
        loadingSpace.value = false
      }, 500)
      setTimeout(() => {
        fitCameraToObjects([spaceObject.value])
        TDArea.value.classList.remove('--transparent')
      }, 1000)
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
    autoRotateScene(-0.6)
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

    // SECTOR TEXT NAME
    const box = new THREE.Box3().setFromObject(boundingBox)
    const size = new THREE.Vector3()
    const center = new THREE.Vector3()
    box.getSize(size)
    box.getCenter(center)
    let centerX, centerZ, gapY
    if (sector.three_d_label_options) {
      centerX = sector.three_d_label_options.x === null ? 50 : sector.three_d_label_options.x
      centerZ = sector.three_d_label_options.z === null ? 50 : sector.three_d_label_options.z
      gapY = sector.three_d_label_options.y === null ? 0.2 : sector.three_d_label_options.y
    } else {
      centerX = 50
      centerZ = 50
      gapY = 0.2
    }

    const spaceName = new Text()
    spaceName.text = sector.name
    spaceName.fontSize = 0.5
    spaceName.anchorX = 'center'
    spaceName.anchorY = 'middle'
    spaceName.outlineColor = 'black'
    spaceName.outlineWidth = 0.04
    spaceName.outlineBlur = 0
    spaceName.outlineOpacity = 0.5
    spaceName.position.x = center.x + size.x * (centerX - 50) / 100
    spaceName.position.z = center.z + size.z * (centerZ - 50) / 100
    spaceName.position.y = center.y * 2 + (gapY + 0.1) - Number.parseFloat(sector.three_d_elevated)
    scene.value.add(spaceName)
    threeDLabels.value.push(spaceName)

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
        switchGymSector(sector)
      }
    }
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
  .loading-space-three-d {
    height: 100vh;
  }
}
</style>
