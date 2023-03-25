import Experience from "../Experience";
import Environment from './Environment';
import Objects from './Objects';


export default class World {
    constructor() {
        this.experience = new Experience()
        this.scene = this.experience.scene
        this.camera = this.experience.camera.instance
        this.time = this.experience.time
        this.renderer = this.experience.renderer

        this.objects = new Objects()
        this.environment = new Environment()
    }

    lightMode() {
        if (this.environment) this.environment.lightMode()
    }

    darkMode() {
        if (this.environment) this.environment.darkMode()
    }

    resize() {
        if (this.objects) this.objects.resize()
    }

    update() {
        if (this.objects) this.objects.update()
    }
}





