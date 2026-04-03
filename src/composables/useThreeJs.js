import * as THREE from 'three'
import { onBeforeUnmount, ref, toRaw } from 'vue'

export function useThreeJs (updateLabelsPosition) {
  // State (équivalent de data())
  const TDArea = ref(null)
  const camera = ref(null)
  const scene = ref(null)
  const renderer = ref(null)
  const orbitControls = ref(null)
  const raycaster = ref(null)
  const pointer = ref(null)
  const stats = ref(null)
  const isDraggingScene = ref(false)
  const disableClick = ref(false)
  const animationId = ref(null)
  const TDAreaResizeObserver = ref(null)
  const edgeColor = ref('rgb(0, 0, 0)')
  const labelPositionUpdatable = ref(false)
  const labelDisableEvent = ref(false)
  const labelDisableTimeout = ref(null)
  const objectsSceneSize = ref(null)
  const autoRotate = ref(false)
  const threeDLabels = ref([])

  // ─── Lifecycle ────────────────────────────────────────────────────────────

  onBeforeUnmount(() => {
    if (orbitControls.value) {
      orbitControls.value.removeEventListener('start', startDragging)
      orbitControls.value.removeEventListener('end', endDragging)
    }
    if (TDAreaResizeObserver.value && TDArea.value) {
      TDAreaResizeObserver.value.unobserve(TDArea.value)
      TDAreaResizeObserver.value = null
    }
    if (TDArea.value) {
      // TDArea.value.removeEventListener('mousemove', highlightSpace)
      TDArea.value.removeEventListener('mousemove', disableClickOnDragging)
      TDArea.value.removeEventListener('mousedown', onMouseDown)
      cleanupThreeJS()
    }
    document.removeEventListener('wheel', addPointerInsensitiveClass)
  })

  // ─── Methods ──────────────────────────────────────────────────────────────

  function resizeThreeJsContainer () {
    const aspect = TDArea.value.offsetWidth / TDArea.value.offsetHeight
    if (camera.value.type === 'OrthographicCamera') {
      camera.value.left = -aspect * 5
      camera.value.right = aspect * 5
      camera.value.top = 5
      camera.value.bottom = -5
    } else {
      camera.value.aspect = aspect
    }
    camera.value.updateProjectionMatrix()
    renderer.value.setSize(TDArea.value.offsetWidth, TDArea.value.offsetHeight)
    renderScene()
  }

  function initTDAResizer () {
    TDAreaResizeObserver.value = new ResizeObserver(resizeThreeJsContainer)
    TDAreaResizeObserver.value.observe(TDArea.value)
  }

  function disableClickOnDragging () {
    disableClick.value = isDraggingScene.value
  }

  function onMouseDown () {
    disableClick.value = false
  }

  function startDragging () {
    isDraggingScene.value = true
    orbitControls.value.autoRotate = false
  }

  function endDragging () {
    isDraggingScene.value = false
  }

  function renderScene () {
    renderer.value.render(toRaw(scene.value), camera.value)
    updateLabelsPosition()
  }

  function calculatePointerPosition (event) {
    if (!renderer.value) {
      return
    }
    const canvasBounds = renderer.value.domElement.getBoundingClientRect()
    pointer.value.x = ((event.clientX - canvasBounds.left) / canvasBounds.width) * 2 - 1
    pointer.value.y = -((event.clientY - canvasBounds.top) / canvasBounds.height) * 2 + 1
    raycaster.value.setFromCamera(pointer.value, camera.value)
  }

  function removeObject (object) {
    scene.value.remove(object)
    object.traverse(child => {
      if (child.geometry) {
        child.geometry.dispose()
      }
      if (child.material) {
        if (Array.isArray(child.material)) {
          for (const mat of child.material) {
            mat.dispose()
          }
        } else {
          child.material.dispose()
        }
      }
    })
    object = null
  }

  function cleanupThreeJS () {
    cancelAnimationFrame(animationId.value)

    if (orbitControls.value !== null) {
      orbitControls.value.dispose()
      orbitControls.value = null
    }

    if (scene.value !== null) {
      scene.value.traverse(object => {
        if (!object.isMesh) {
          return
        }
        object.geometry.dispose()
        if (object.material.isMaterial) {
          cleanMaterial(object.material)
        } else {
          for (const material of object.material) {
            cleanMaterial(material)
          }
        }
      })
    }

    if (renderer.value !== null) {
      renderer.value.dispose()
      renderer.value.domElement = null
    }

    scene.value = null
    camera.value = null
    orbitControls.value = null
    renderer.value = null
    raycaster.value = null
    pointer.value = null
    disableClick.value = false
    isDraggingScene.value = false
    labelPositionUpdatable.value = false
    labelDisableEvent.value = false
    objectsSceneSize.value = null

    if (labelDisableTimeout.value) {
      clearTimeout(labelDisableTimeout.value)
    }
  }

  function cleanMaterial (material) {
    material.dispose()
    for (const key of Object.keys(material)) {
      const value = material[key]
      if (value && typeof value === 'object' && 'minFilter' in value) {
        value.dispose()
      }
    }
  }

  function canvasToPng (fileName) {
    renderScene()
    const a = document.createElement('a')
    document.body.append(a)
    a.style.display = 'none'
    TDArea.value.querySelector('canvas').toBlob(blob => {
      a.href = window.URL.createObjectURL(blob)
      a.download = `${fileName}.png`
      a.click()
    })
  }

  function canvasToFile (fileName) {
    renderScene()
    return new Promise(resolve => {
      TDArea.value.querySelector('canvas').toBlob(blob => {
        const file = new File([blob], `${fileName}.png`, { type: 'image/png' })
        resolve(file)
      }, 'image/png', 1)
    })
  }

  function autoRotateScene (autoRotateSpeed = -1) {
    if (!autoRotate.value) {
      orbitControls.value.autoRotate = true
      orbitControls.value.autoRotateSpeed = autoRotateSpeed
      animate()
    } else if (animationId.value !== null) {
      cancelAnimationFrame(animationId.value)
    }
    autoRotate.value = !autoRotate.value
  }

  function animate () {
    animationId.value = requestAnimationFrame(animate)
    if (orbitControls.value) {
      orbitControls.value.update()
    }
    for (const label of threeDLabels.value) {
      label.quaternion.copy(camera.value.quaternion)
    }
    renderScene()
  }

  function stopAutoRotateScene () {
    orbitControls.value.autoRotate = false
  }

  function fitCameraToObjects (objects, offset = 1.2) {
    const size = new THREE.Vector3()
    const center = new THREE.Vector3()
    const box = new THREE.Box3()

    for (const object of objects) {
      box.expandByObject(object)
    }

    box.getSize(size)
    box.getCenter(center)

    const maxSize = Math.max(size.x, size.y, size.z)
    const fitHeightDistance = maxSize / (2 * Math.atan(Math.PI * camera.value.fov / 360))
    const fitWidthDistance = fitHeightDistance / camera.value.aspect
    const distance = offset * Math.max(fitHeightDistance, fitWidthDistance)

    const direction = orbitControls.value.target.clone()
      .sub(camera.value.position)
      .normalize()
      .multiplyScalar(distance)

    orbitControls.value.maxDistance = distance * offset * 1.5
    orbitControls.value.target.copy(center)

    camera.value.near = distance / 100
    camera.value.far = distance * 100
    camera.value.updateProjectionMatrix()

    camera.value.position.copy(orbitControls.value.target).sub(direction)
    orbitControls.value.update()
    renderScene()
  }

  function setView (view) {
    const target = orbitControls.value.target.clone()
    if (view === 'top') {
      const max = Math.max(objectsSceneSize.value.x, objectsSceneSize.value.y, objectsSceneSize.value.z)
      orbitControls.value.target.y = 0
      camera.value.position.set(target.x, target.y + max, target.z)
    }
    if (view === 'bottom') {
      const max = Math.max(objectsSceneSize.value.x, objectsSceneSize.value.y, objectsSceneSize.value.z)
      orbitControls.value.target.y = 0
      camera.value.position.set(target.x, (target.y + max) * -1, target.z)
    }
    orbitControls.value.update()
    renderScene()
  }

  function initLabelInsensitiveEvent () {
    document.addEventListener('scroll', addPointerInsensitiveClass)
    document.addEventListener('wheel', addPointerInsensitiveClass)
  }

  function addPointerInsensitiveClass () {
    if (labelDisableTimeout.value) {
      clearTimeout(labelDisableTimeout.value)
    }
    labelDisableEvent.value = true
    labelDisableTimeout.value = setTimeout(() => {
      labelDisableEvent.value = false
      labelDisableTimeout.value = null
    }, 300)
  }

  function addShadowLight (objects) {
    const size = new THREE.Vector3()
    const center = new THREE.Vector3()
    const box = new THREE.Box3()

    for (const object of objects) {
      box.expandByObject(object)
    }

    box.getSize(size)
    box.getCenter(center)

    const dirLight = new THREE.DirectionalLight('rgb(255, 255, 255)', 0.8)
    dirLight.position.set(0, size.z + 2, 0)
    dirLight.castShadow = true
    dirLight.shadow.mapSize.width = 100
    dirLight.shadow.mapSize.height = 100
    dirLight.shadow.bias = -0.0005
    dirLight.shadow.camera.left = -size.x / 2 + center.x - 0.5
    dirLight.shadow.camera.right = size.x / 2 + center.x + 0.5
    dirLight.shadow.camera.top = size.z / 2 - center.z + 0.5
    dirLight.shadow.camera.bottom = -size.z / 2 - center.z - 0.5
    dirLight.shadow.camera.near = 1
    dirLight.shadow.camera.far = 100
    scene.value.add(dirLight)
  }

  function buildGroundPlan (objects) {
    const size = new THREE.Vector3()
    const center = new THREE.Vector3()
    const box = new THREE.Box3()

    for (const object of objects) {
      box.expandByObject(object)
    }

    box.getSize(size)
    box.getCenter(center)

    const planeGeometry = new THREE.PlaneGeometry(size.x + 5, size.z + 5)
    const planeMaterial = new THREE.ShadowMaterial({ color: 'rgb(0, 0, 0)', opacity: 0.07 })
    const plane = new THREE.Mesh(planeGeometry, planeMaterial)

    plane.rotation.x = -Math.PI / 2
    plane.position.set(center.x, box.min.y, center.z)
    plane.receiveShadow = true

    scene.value.add(plane)
  }

  // ─── Expose ───────────────────────────────────────────────────────────────

  return {
    // State
    TDArea,
    camera,
    scene,
    renderer,
    orbitControls,
    raycaster,
    pointer,
    stats,
    isDraggingScene,
    disableClick,
    animationId,
    TDAreaResizeObserver,
    edgeColor,
    labelPositionUpdatable,
    labelDisableEvent,
    labelDisableTimeout,
    objectsSceneSize,
    autoRotate,
    threeDLabels,

    // Methods
    resizeThreeJsContainer,
    initTDAResizer,
    disableClickOnDragging,
    onMouseDown,
    startDragging,
    endDragging,
    renderScene,
    calculatePointerPosition,
    removeObject,
    cleanupThreeJS,
    cleanMaterial,
    canvasToPng,
    canvasToFile,
    autoRotateScene,
    stopAutoRotateScene,
    animate,
    fitCameraToObjects,
    setView,
    initLabelInsensitiveEvent,
    addPointerInsensitiveClass,
    addShadowLight,
    buildGroundPlan,
  }
}
