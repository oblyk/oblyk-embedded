<template>
  <div
    class="full-height gym-three-spaces"
    style="position: relative; overflow: hidden"
  >
    <div
      v-if="loadingSpaces"
      class="full-height d-flex flex-column justify-center"
    >
      <div class="text-center">
        <p>
          <small class="font-weight-bold">
            chargement
          </small>
        </p>
      </div>
    </div>
    <div
      v-show="!loadingSpaces"
      id="three-d-area"
      class="full-height --transparent"
    >
      <p class="text-center mt-10">
        chargement
      </p>
    </div>
    <div
      v-show="!loadingSpaces"
      class="spaces-list"
      :class="isDraggingScene ? '--in-dragging-scene' : ''"
    >
      <div
        v-for="(space, spaceIndex) in gym.gym_spaces"
        :id="`space-label-${space.id}`"
        :key="`space-${spaceIndex}`"
        class="rounded font-weight-bold sector-label-in-spaces"
        :class="labelDisableEvent ? 'pointer-event-insensitive' : null"
        :style="activeSpaceId === space.id ? `background-color: ${space.color || 'rgb(0, 0, 0)'}; color: ${space.text_contrast_color}` : 'color: black'"
        @mousemove.stop="glossySpace(space.id)"
      >
        {{ space.name }}
      </div>
    </div>
  </div>
</template>

<script setup>
  import * as THREE from 'three'
  import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
  import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'
  import { inject, onMounted, ref } from 'vue'
  import { useThreeJs } from '@/composables/useThreeJs.js'

  const props = defineProps({ gym: Object })

  const spaces = ref([])
  const assets = ref([])
  const loadingSpaces = ref(true)
  const activeSpaceId = ref(null)
  const switchGymSpace = inject('Gym:switchGymSpace')

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
    raycaster,
    pointer,
    disableClick,
    isDraggingScene,
    labelDisableEvent,
  } = useThreeJs(updateLabelsPosition)

  onMounted(() => {
    TDArea.value = document.querySelector('#three-d-area')
    initThreeJs()
  })

  function initThreeJs () {
    // Camera
    camera.value = new THREE.PerspectiveCamera(45, TDArea.value.offsetWidth / TDArea.value.offsetHeight, 5, 200)
    camera.value.position.z = 25
    camera.value.position.y = 25
    camera.value.position.x = 25

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

    // Load files
    const loader = new GLTFLoader()

    const edgeLine = new THREE.LineBasicMaterial({ color: edgeColor.value, opacity: 0.3, transparent: true })
    let spaceIndex = 0
    for (const space of props.gym.gym_spaces) {
      loader.load(space.three_d_gltf_url, gltf => {
        spaceIndex += 1
        const object = gltf.scene

        const treatedColors = []
        object.traverse(child => {
          if (child.isMesh) {
            child.castShadow = true
            child.receiveShadow = true

            // Add Edges
            if (space.three_d_parameters?.highlight_edges) {
              const edges = new THREE.EdgesGeometry(child.geometry)
              const line = new THREE.LineSegments(edges, edgeLine)
              child.add(line)
            }

            // color correction
            if (space.three_d_parameters?.color_correction_sketchup_exports && !treatedColors.includes(child.material.uuid)) {
              const color = child.material.color
              const rgbColor = `rgb(${Math.round(255 * color.r)}, ${Math.round(255 * color.g)}, ${Math.round(255 * color.b)})`
              child.material.color = new THREE.Color(rgbColor)
              treatedColors.push(child.material.uuid)
            }

            // Add user data for highlight
            child.userData = {
              space: { id: space.id },
              material: child.material,
            }
          }
        })

        object.position.y = space.three_d_position?.y || 0
        object.position.x = space.three_d_position?.x || 0
        object.position.z = space.three_d_position?.z || 0

        object.rotation.y = (space.three_d_rotation?.y || 0) * (Math.PI / 180)
        object.rotation.x = (space.three_d_rotation?.x || 0) * (Math.PI / 180)
        object.rotation.z = (space.three_d_rotation?.z || 0) * (Math.PI / 180)

        object.scale.setScalar(space.three_d_scale || 1)
        object.userData = { space }

        spaces.value.push(object)
        scene.value.add(object)

        // Center scene to all boxes
        if (spaceIndex === props.gym.gym_spaces.length) {
          const allBoxes = new THREE.Box3()
          for (const space of spaces.value) {
            allBoxes.expandByObject(space)
          }
          const center = new THREE.Vector3()
          allBoxes.getCenter(center)
          orbitControls.value.target.copy(center)
          orbitControls.value.update()
          buildGroundPlan(spaces.value)
          addShadowLight(spaces.value)
          loadingSpaces.value = false
          setTimeout(() => {
            fitCameraToObjects(spaces.value)
            TDArea.value.classList.remove('--transparent')
          }, 100)
        }
      })
    }

    for (const asset of props.gym.assets) {
      loader.load(asset.gym_three_d_asset.three_d_gltf_url, gltf => {
        const object = gltf.scene

        const treatedColors = []
        object.traverse(child => {
          if (child.isMesh) {
            child.castShadow = true
            child.receiveShadow = true

            // Add Edges
            if (asset.gym_three_d_asset.three_d_parameters?.highlight_edges) {
              const edges = new THREE.EdgesGeometry(child.geometry)
              const line = new THREE.LineSegments(edges, edgeLine)
              child.add(line)
            }

            // color correction
            if (asset.gym_three_d_asset.three_d_parameters?.color_correction_sketchup_exports && !treatedColors.includes(child.material.uuid)) {
              const color = child.material.color
              const rgbColor = `rgb(${Math.round(255 * color.r)}, ${Math.round(255 * color.g)}, ${Math.round(255 * color.b)})`
              child.material.color = new THREE.Color(rgbColor)
              treatedColors.push(child.material.uuid)
            }

            // Add user data for highlight
            child.userData = {
              space: { id: asset.id },
              material: child.material,
            }
          }
        })

        object.position.y = asset.three_d_position?.y || 0
        object.position.x = asset.three_d_position?.x || 0
        object.position.z = asset.three_d_position?.z || 0

        object.rotation.y = (asset.three_d_rotation?.y || 0) * (Math.PI / 180)
        object.rotation.x = (asset.three_d_rotation?.x || 0) * (Math.PI / 180)
        object.rotation.z = (asset.three_d_rotation?.z || 0) * (Math.PI / 180)

        object.scale.setScalar(asset.three_d_scale || 1)
        object.userData = { asset }

        assets.value.push(object)
        scene.value.add(object)

        renderScene()
      })
    }

    TDArea.value.innerHTML = null
    TDArea.value.append(renderer.value.domElement)

    // Orbit controller
    orbitControls.value = new OrbitControls(camera.value, renderer.value.domElement)
    orbitControls.value.minDistance = 5
    orbitControls.value.maxDistance = 150
    orbitControls.value.maxPolarAngle = Math.PI / 2
    orbitControls.value.addEventListener('change', renderScene)

    // Raycaster and mouse setup
    raycaster.value = new THREE.Raycaster()
    pointer.value = new THREE.Vector2()

    TDArea.value.addEventListener('mousemove', highlightSpace, false)
    TDArea.value.addEventListener('mousemove', disableClickOnDragging, false)
    TDArea.value.addEventListener('mouseup', goToSpace, false)
    TDArea.value.addEventListener('mousedown', onMouseDown)
    orbitControls.value.addEventListener('start', startDragging)
    orbitControls.value.addEventListener('start', startHighlightSpace)
    orbitControls.value.addEventListener('end', endDragging)
    orbitControls.value.addEventListener('end', endHighlightSpace)

    // Turns the scene on its head
    initTDAResizer()
    initLabelInsensitiveEvent()
    renderScene()
    autoRotateScene(-0.6)
  }

  function highlightSpace (event) {
    calculatePointerPosition(event)

    // Render all line box transparent
    unGlossySpace()

    // Check intersections on bounding boxes
    let intersects = raycaster.value.intersectObjects(spaces.value)
    intersects = intersects.filter(intersect => intersect.object.isMesh)
    if (intersects.length > 0) {
      const spaceId = intersects[0].object.userData.space.id
      glossySpace(spaceId)
    }
    renderScene()
  }

  function unGlossySpace () {
    activeSpaceId.value = null
    for (const space of spaces.value) {
      space.traverse(child => {
        if (child.isMesh) {
          child.material = child.userData.material
        }
      })
    }
  }

  function glossySpace (spaceId) {
    unGlossySpace()
    const space = spaces.value.find(space => space.userData.space.id === spaceId)
    const intensity = 0.3
    const colorFiltre = {
      r: 0,
      g: 188 * intensity,
      b: 212 * intensity,
    }
    space.traverse(child => {
      if (child.isMesh) {
        const color = child.material.color
        const colorR = Math.round(color.r * 255 * (1 - intensity) + colorFiltre.r)
        const colorG = Math.round(color.g * 255 * (1 - intensity) + colorFiltre.g)
        const colorB = Math.round(color.b * 255 * (1 - intensity) + colorFiltre.b)
        const newRgbColor = `rgb(${colorR}, ${colorG}, ${colorB})`
        const newColor = new THREE.Color(newRgbColor)
        child.material = new THREE.MeshBasicMaterial({ color: newColor })
      }
    })
    activeSpaceId.value = spaceId
    renderScene()
  }

  function goToSpace (event) {
    if (disableClick.value) {
      return
    }
    event.preventDefault()
    calculatePointerPosition(event)

    // Check intersections on bounding boxes
    let intersects = raycaster.value.intersectObjects(spaces.value)
    intersects = intersects.filter(intersect => intersect.object.isMesh)
    if (intersects.length > 0) {
      const gymSpace = props.gym.gym_spaces.find(space => space.id === intersects[0].object.userData.space.id)
      switchGymSpace(gymSpace)
      // renderScene()
    }
  }

  function startHighlightSpace () {
    TDArea.value.removeEventListener('mousemove', highlightSpace)
  }

  function endHighlightSpace () {
    TDArea.value.addEventListener('mousemove', highlightSpace, false)
  }

  function updateLabelsPosition () {
    const tempV = new THREE.Vector3()
    for (const space of spaces.value) {
      const box = new THREE.Box3().setFromObject(space)
      const size = new THREE.Vector3()
      const center = new THREE.Vector3()
      box.getSize(size)
      box.getCenter(center)
      let centerX, centerZ, centerY
      if (space.userData.space.three_d_label_options) {
        centerX = space.userData.space.three_d_label_options.x === null ? 50 : space.userData.space.three_d_label_options.x
        centerZ = space.userData.space.three_d_label_options.z === null ? 50 : space.userData.space.three_d_label_options.z
        centerY = space.userData.space.three_d_label_options.y === null ? 50 : space.userData.space.three_d_label_options.y
      } else {
        centerX = 50
        centerZ = 50
        centerY = 50
      }
      center.x = center.x + size.x * (centerX - 50) / 100
      center.z = center.z + size.z * (centerZ - 50) / 100
      center.y = center.y * 2 + size.y * (centerY - 100) / 100 - Number.parseFloat(space.userData.space.three_d_position?.y || '0')
      tempV.copy(center)
      tempV.project(camera.value)

      // convert the normalized position to CSS coordinates
      const x = (tempV.x * 0.5 + 0.5) * TDArea.value.offsetWidth
      const y = (tempV.y * -0.5 + 0.5) * TDArea.value.offsetHeight

      const domElement = document.querySelector(`#space-label-${space.userData.space.id}`)
      if (domElement !== null) {
        domElement.style.transform = `translate(-50%, -50%) translate(${x}px,${y}px)`
        domElement.style.zIndex = Math.trunc(-tempV.z * 0.5 + 0.5)
      }
    }
  }
</script>

<style lang="scss">
.gym-three-spaces {
  height: 100vh;
  #three-d-area {
    height: 100vh;
    transition: opacity 0.1s;
    &.--transparent {
      opacity: 0;
    }
  }
  .spaces-list {
    position: absolute;
    top: 0;
    left: 0;
    will-change: opacity;
    transition: opacity 0.2s;
    opacity: 1;
    .sector-label-in-spaces {
      position: absolute;
      top: 0;
      left: 0;
      white-space: nowrap;
      padding: 1px 5px;
      box-sizing: border-box;
      background-color: rgba(255, 255, 255, 0.8);
      font-size: 0.6em;
      transition: background-color 0.2s;
    }
    &.--in-dragging-scene {
      opacity: 0.3;
      .sector-label-in-spaces {
        background-color: rgba(255, 255, 255, 0);
      }
    }
  }
}
</style>
