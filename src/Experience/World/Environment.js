import * as THREE from 'https://cdn.jsdelivr.net/gh/mrdoob/three.js@r146/build/three.module.js'
import Experience from "../Experience";

export default class Environment {

    constructor() {
        this.experience = new Experience()
        this.scene = this.experience.scene
        this.resources = this.experience.resources
        this.debug = this.experience.debug

        //Debug
        if (this.debug.active) {
            this.debugFolder = this.debug.ui.addFolder('Environment')
        }
        this.upLightColor = '#d0a406'
        this.downLightColor = '#6a390b'
        this.upDarkColor = '#854d00'
        this.downDarkColor = '#2e0000'
        this.setUpDirectionalLight(this.upLightColor)
        this.setDownDirectionalLight(this.downLightColor)
    }



    setUpDirectionalLight(color) {
        this.uPDirectionalLight = new THREE.DirectionalLight(color, 10)
        this.scene.add(this.uPDirectionalLight)
        this.uPDirectionalLight.position.set(0, 1, 0.25)

        //Debug
        if (this.debug.active) {
            this.debugFolder.addColor(this.uPDirectionalLight, 'color').name('up color')
            this.debugFolder.add(this.uPDirectionalLight, 'intensity').min(0).max(50).step(0.01)
        }
    }

    setDownDirectionalLight(color) {
        this.downDirectionalLight = new THREE.DirectionalLight(color, 10)
        this.scene.add(this.downDirectionalLight)
        this.downDirectionalLight.position.set(0, -1, 0.25)

        //Debug
        if (this.debug.active) {
            this.debugFolder.addColor(this.downDirectionalLight, 'color').name('down color')
            this.debugFolder.add(this.downDirectionalLight, 'intensity').min(0).max(50).step(0.01)
        }
    }

    lightMode() {
        if (this.uPDirectionalLight) this.uPDirectionalLight.color = new THREE.Color(this.upLightColor)
        if (this.downDirectionalLight) this.downDirectionalLight.color = new THREE.Color(this.downLightColor)
    }

    darkMode() {
        if (this.uPDirectionalLight) this.uPDirectionalLight.color = new THREE.Color(this.upDarkColor)
        if (this.downDirectionalLight) this.downDirectionalLight.color = new THREE.Color(this.downDarkColor)
    }
}
