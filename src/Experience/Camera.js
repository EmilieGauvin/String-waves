import * as THREE from 'https://cdn.jsdelivr.net/gh/mrdoob/three.js@r146/build/three.module.js'
import Experience from "./Experience";

export default class Camera
{
    constructor()
    {

        this.experience = new Experience()
        this.sizes = this.experience.sizes
        this.scene = this.experience.scene
        this.canvas = this.experience.canvas
        this.debug = this.experience.debug

        //Debug
        if(this.debug.active)
        {
            this.debugFolder = this.debug.ui.addFolder('Camera')
        }

        this.setInstance()
    }

    setInstance()
    {
        this.instance = new THREE.PerspectiveCamera(
            75, this.sizes.width / this.sizes.height, 0.1, 100)
        this.instance.position.set(0, 0, 2)
        this.scene.add(this.instance)

        //Debug
        if(this.debug.active)
        {
            this.debugFolder.add(this.instance.rotation, 'z').min(- Math.PI * 0.5).max(Math.PI * 0.5).step(0.1).name('camera rotation')
            this.debugFolder.add(this.instance.position, 'z').min(0.2).max(5).step(0.1).name('camera position')
        }
    }

    resize()
    {
        this.instance.aspect = this.sizes.width / this.sizes.height
        this.instance.updateProjectionMatrix()
        this.scaleRatio = this.experience.scaleRatio
    }
}

