import * as THREE from 'https://cdn.jsdelivr.net/gh/mrdoob/three.js@r146/build/three.module.js'
import Experience from '../Experience.js'

export default class Objects {

    constructor() {
        this.experience = new Experience()
        this.scene = this.experience.scene
        this.time = this.experience.time
        this.sizes = this.experience.sizes
        this.camera = this.experience.camera
        this.debug = this.experience.debug
        this.pointer = this.experience.pointer

        //Debug
        if (this.debug.active) {
            this.debugFolder = this.debug.ui.addFolder('Camera')
        }

        // Set up
        this.meshArray = []
        this.debugObject = {}
        this.debugObject.meshCount = 101
        this.debugObject.distBetweenMeshes = 0.07
        this.updateRadius = 0
        this.initialRadius = 0.1
        this.radius = this.initialRadius
        this.maxRadius = 5
        this.radiusScale = 50 * this.radius
        this.strength = 1
        this.setUp()
    }

    setUp() {

        // Geometry
        this.geometry = new THREE.PlaneGeometry(0.02, 8, 1, 350)
        this.count = this.geometry.attributes.position.count

        // attributes array
        this.position = this.geometry.attributes.position.array
        this.aDeltaMove = new Float32Array(this.count)
        for (let i = 0; i < this.count; i++) {
            const i3 = i * 3
            this.aDeltaMove[i] = this.position[i3]
        }
        this.geometry.setAttribute('aDeltaMove', new THREE.BufferAttribute(this.aDeltaMove, 1))

        this.aDeltaNormal = new Float32Array(this.count)
        for (let i = 0; i < this.count; i++) {
            const i3 = i * 3
            this.aDeltaNormal[i] = this.position[i3]
        }
        this.geometry.setAttribute('aDeltaNormal', new THREE.BufferAttribute(this.aDeltaNormal, 1))

        this.meshGroup = new THREE.Group()
        this.resize()
        this.scene.add(this.meshGroup)

        this.setMaterial()
        this.createMesh()

        //Debug
        if (this.debug.active) {
            this.debugFolder.add(this.debugObject, 'meshCount').min(1).max(100).step(1).onFinishChange(() => this.createMesh())
            this.debugFolder.add(this.debugObject, 'distBetweenMeshes').min(0.01).max(1).step(0.01).onFinishChange(() => this.createMesh())
        }
    }

    setMaterial() {

        this.material = new THREE.MeshStandardMaterial({
            metalness: 0,
            roughness: 1,
            color: 'white'
        })
        this.material.onBeforeCompile = (shader) => {
            shader.vertexShader = shader.vertexShader.replace(
                '#include <common>',
                `
                #include <common>
        
                attribute float aDeltaMove;
                attribute float aDeltaNormal;

                `
            )
            shader.vertexShader = shader.vertexShader.replace(
                '#include <beginnormal_vertex>',
                `
                #include <beginnormal_vertex>

                objectNormal.y += aDeltaNormal;
                `
            )

            shader.vertexShader = shader.vertexShader.replace(
                '#include <begin_vertex>',
                `
                #include <begin_vertex>
        
                // transformed.z += aDeltaMove;
                transformed.x += aDeltaMove;
                `
            )
        }

        this.depthMaterial = new THREE.MeshDepthMaterial({
            depthPacking: THREE.RGBADepthPacking
        })
        this.depthMaterial.onBeforeCompile = (shader) => {
            shader.uniforms.uTime = this.customUniforms.uTime
            shader.vertexShader = shader.vertexShader.replace(
                '#include <common>',
                `
                #include <common>

                // uniform float uTime;
                attribute float aDeltaMove;

                // mat2 get2dRotateMatrix(float _angle)
                // {
                //     return mat2(cos(_angle), - sin(_angle), sin(_angle), cos(_angle));
                // }
                `
            )
            shader.vertexShader = shader.vertexShader.replace(
                '#include <begin_vertex>',
                `
                #include <begin_vertex>
                
                // float angle = 1.0;//sin(position.y + uTime) * 0.4;
                // mat2 rotateMatrix = get2dRotateMatrix(angle);

                // transformed.xz = transformed.xz * rotateMatrix;
                transformed.z += aDeltaMove;
                transformed.x += aDeltaMove;

                `
            )
        }

    }

    resize() {
        // resizeFullScreenGroup(this.fullscreen)
        let scale = this.sizes.width / this.sizes.height
        this.meshGroup.scale.set(scale, scale, scale)

        if (this.sizes.width > this.sizes.height) this.meshGroup.rotation.z = 0.8
        if (this.sizes.width <= this.sizes.height) this.meshGroup.rotation.z = 0.6

    }

    createMesh() {
        if (this.meshArray.length) {
            for (const mesh of this.meshArray) {
                mesh.geometry.dispose()
                mesh.material.dispose()
                this.meshGroup.remove(mesh)
            }
            this.meshArray = []
        }

        for (let i = 0; i < this.debugObject.meshCount; i++) {
            const mesh = new THREE.Mesh(this.geometry, this.material)
            mesh.customDepthMaterial = this.depthMaterial
            this.meshArray.push(mesh)
            mesh.position.x = (this.debugObject.meshCount * this.debugObject.distBetweenMeshes / 2) - i * this.debugObject.distBetweenMeshes
            this.meshGroup.add(mesh)

        }

    }

    pointerMoveStrings() {
        const orientation = this.experience.pointerEvents.orientation
        const radiusNormalFactor = 0.1 / this.radius
        this.radiusScale = Math.round(50 * this.radius)

        for (let i = 0; i < this.count / 2; i++) {
            const i2 = i * 2
            const i3 = i * 3
            const i6 = i * 6

            // Original curve
            var dx = (this.position[i6] - this.pointer.x),
                dy = (this.position[i6 + 1] - this.pointer.y),
                dist = Math.sqrt(dx * dx + dy * dy)

            if (dist < this.radius) {
                const formula = orientation * (Math.sqrt((this.radius * this.radius) - (dy * dy)) - Math.abs(dx)) * this.strength

                this.aDeltaMove[i2] = this.position[i6] + formula
                this.aDeltaMove[i2 + 1] = this.position[i6 + 3] + formula

                this.aDeltaNormal[i2 - this.radiusScale] = this.position[i6] + formula * radiusNormalFactor
                this.aDeltaNormal[i2 - this.radiusScale + 1] = this.position[i6 + 3] + formula * radiusNormalFactor

            } else {
                this.aDeltaMove[i2] = this.position[i6]
                this.aDeltaMove[i2 + 1] = this.position[i6 + 3]

                this.aDeltaNormal[i2 - this.radiusScale] = this.position[i6]
                this.aDeltaNormal[i2 - this.radiusScale + 1] = this.position[i6 + 3]
            }

            // Opposite curves
            for (let j = 0; j < Math.ceil(this.geometry.parameters.height / (2 * this.radius)); j++) {
                var dx = (this.position[i6] - this.pointer.x)

                //Original curve copy down             
                var dy = (this.position[i6 + 1] - this.pointer.y + (4 + j * 4) * Math.sqrt(this.radius * this.radius - dx * dx)),
                    dist = Math.sqrt(dx * dx + dy * dy)
                if (dist < this.radius) {
                    const formula = orientation * (Math.sqrt((this.radius * this.radius) - (dy * dy)) - Math.abs(dx)) * this.strength

                    this.aDeltaMove[i2] = this.position[i6] + formula
                    this.aDeltaMove[i2 + 1] = this.position[i6 + 3] + formula

                    this.aDeltaNormal[i2 - this.radiusScale] = this.position[i6] + formula * radiusNormalFactor
                    this.aDeltaNormal[i2 - this.radiusScale + 1] = this.position[i6 + 3] + formula * radiusNormalFactor
                }

                //Opposite curve down 
                var dy = (this.position[i6 + 1] - (this.pointer.y - (2 + j * 4) * Math.sqrt(this.radius * this.radius - dx * dx))),
                    dist = Math.sqrt(dx * dx + dy * dy)
                if (dist < this.radius) {
                    const formula = orientation * (Math.sqrt((this.radius * this.radius) - (dy * dy)) - Math.abs(dx)) * this.strength

                    this.aDeltaMove[i2] = this.position[i6] - formula
                    this.aDeltaMove[i2 + 1] = this.position[i6 + 3] - formula

                    this.aDeltaNormal[i2 - this.radiusScale] = this.position[i6] - formula * radiusNormalFactor
                    this.aDeltaNormal[i2 - this.radiusScale + 1] = this.position[i6 + 3] - formula * radiusNormalFactor
                }

                //Original curve copy up
                var dy = (this.position[i6 + 1] - this.pointer.y - (4 + j * 4) * Math.sqrt(this.radius * this.radius - dx * dx)),
                    dist = Math.sqrt(dx * dx + dy * dy)
                if (dist < this.radius) {
                    const formula = orientation * (Math.sqrt((this.radius * this.radius) - (dy * dy)) - Math.abs(dx)) * this.strength

                    this.aDeltaMove[i2] = this.position[i6] + formula
                    this.aDeltaMove[i2 + 1] = this.position[i6 + 3] + formula

                    this.aDeltaNormal[i2 - this.radiusScale] = this.position[i6] + formula * radiusNormalFactor
                    this.aDeltaNormal[i2 - this.radiusScale + 1] = this.position[i6 + 3] + formula * radiusNormalFactor
                }

                //Opposite curve up
                var dy = (this.position[i6 + 1] - (this.pointer.y + (2 + j * 4) * Math.sqrt(this.radius * this.radius - dx * dx))),
                    dist = Math.sqrt(dx * dx + dy * dy)
                if (dist < this.radius) {
                    const formula = orientation * (Math.sqrt((this.radius * this.radius) - (dy * dy)) - Math.abs(dx)) * this.strength

                    this.aDeltaMove[i2] = this.position[i6] - formula
                    this.aDeltaMove[i2 + 1] = this.position[i6 + 3] - formula

                    this.aDeltaNormal[i2 - this.radiusScale] = this.position[i6] - formula * radiusNormalFactor
                    this.aDeltaNormal[i2 - this.radiusScale + 1] = this.position[i6 + 3] - formula * radiusNormalFactor
                }
            }
        }
        this.geometry.setAttribute('aDeltaMove', new THREE.BufferAttribute(this.aDeltaMove, 1))
        this.geometry.setAttribute('aDeltaNormal', new THREE.BufferAttribute(this.aDeltaNormal, 1))
    }

    pointerDownRadius() {
        this.updateRadius = 1
    }

    pointerCancelRadius() {
        this.updateRadius = -1
    }

    update() {
        if (this.updateRadius === 1) {
            if (this.radius < this.maxRadius) this.radius += 0.03
            this.pointerMoveStrings()
        }

        if (this.updateRadius === -1) {
            if (this.radius > this.initialRadius) this.radius -= 0.1
            if (this.radius <= this.initialRadius) {
                this.radius = this.initialRadius
                this.updateRadius = 0
            }
            this.pointerMoveStrings()
        }
    }
}
