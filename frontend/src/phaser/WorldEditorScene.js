import Phaser, { Scene } from 'phaser';


const sceneConfig = {
    active: false,
    visible: false,
    key: 'WorldEditorScene',
};


class WorldEditorScene extends Scene {
    constructor() {
        super(sceneConfig);
    }


}

export default WorldEditorScene;
