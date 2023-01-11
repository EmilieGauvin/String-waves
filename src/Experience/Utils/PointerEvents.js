import * as THREE from 'https://cdn.jsdelivr.net/gh/mrdoob/three.js@r146/build/three.module.js'
import Experience from '../Experience'
import EventEmitter from './EventEmitter'




export default class PointerEvents extends EventEmitter {
    constructor() {
        super()

        this.experience = new Experience()
        this.sizes = this.experience.sizes
        this.scene = this.experience.scene

        this.pointer = new THREE.Vector2(1.0, 0.0)//initiate the mouse in 0,0

        //Settings
        this.sensibility = 0.1
        this.orientationChangeSpeed = 0.1

        //Set up
        this.oldPointerX = 0
        this.deltaX = 0

        this.deltaOrientation = 1
        this.deltaOrientationPositive = true
        this.orientation = 0

        // Events
        if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
            // Touch move
            window.addEventListener('touchmove', (event) => {
                this.updateTouch(event)
                this.trigger('pointerMove')
            })

        } else {
            // Pointer move
            window.addEventListener('pointermove', (event) => {
                this.updatePointer(event)
                this.trigger('pointerMove')
            })
        }
    }

    updateTouch(event) {
        var touch = event.touches[0];
        var x = touch.pageX;
        var y = touch.pageY;
        this.pointer.x = x / this.sizes.width * 2 - 1 //normalize the coord.
        this.pointer.y = - (y / this.sizes.height) * 2 + 1 //normalize …

        this.updateDeltaOrientation()
    }

    updatePointer(event) {
        this.pointer.x = event.clientX / this.sizes.width * 2 - 1 //normalize the coord.
        this.pointer.y = - (event.clientY / this.sizes.height) * 2 + 1 //normalize …

        this.updateDeltaOrientation()
    }

    updateDeltaOrientation() {
        this.pointer.x *= this.sensibility
        this.pointer.y *= this.sensibility

        this.deltaX = this.pointer.x - this.oldPointerX
        this.oldPointerX = this.pointer.x

        if (this.deltaX != 0) this.deltaOrientation = this.deltaX / Math.abs(this.deltaX)
    }

    update() {
        if (this.deltaOrientation === 1 && this.deltaOrientationPositive === true) this.orientation = 1
        if (this.deltaOrientation === -1 && this.deltaOrientationPositive === false) this.orientation = -1

        if (this.deltaOrientation === 1 && this.deltaOrientationPositive === false) {
            if (this.orientation < 1) this.orientation += this.orientationChangeSpeed
            if (this.orientation >= 1) {
                this.deltaOrientationPositive = true
                this.orientation = 1
            }
        }
        if (this.deltaOrientation === -1 && this.deltaOrientationPositive === true) {
            if (this.orientation > -1) this.orientation -= this.orientationChangeSpeed
            if (this.orientation <= -1) {
                this.deltaOrientationPositive = false
                this.orientation = -1
            }
        }
    }

}