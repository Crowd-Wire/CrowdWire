import * as Phaser from 'phaser';


const createFromObjects = (map, objectLayerName, config) => {
        var results = [];

        var objectLayer = map.getObjectLayer(objectLayerName);
        if (!objectLayer) {
            console.warn('createFromObjects: Invalid objectLayerName given: ' + objectLayerName);

            return results;
        }

        if (!Array.isArray(config)) {
            config = [config];
        }

        var objects = objectLayer.objects;

        for (var c = 0; c < config.length; c++) {
            var singleConfig = config[c];

            var id = Phaser.Utils.Objects.GetFastValue(singleConfig, 'id', null);
            var gid = Phaser.Utils.Objects.GetFastValue(singleConfig, 'gid', null);
            var name = Phaser.Utils.Objects.GetFastValue(singleConfig, 'name', null);

            var obj;
            var toConvert = [];

            //  Sweep to get all the objects we want to convert in map pass
            for (var s = 0; s < objects.length; s++) {
                obj = objects[s];

                if (
                    (id === null && gid === null && name === null) ||
                    (id !== null && obj.id === id) ||
                    (gid !== null && obj.gid === gid) ||
                    (name !== null && obj.name === name)
                ) {
                    toConvert.push(obj);
                }
            }

            //  Now let's convert them ...

            var classType = Phaser.Utils.Objects.GetFastValue(singleConfig, 'classType', Phaser.GameObjects.Sprite);
            var scene = Phaser.Utils.Objects.GetFastValue(singleConfig, 'scene', map.scene);
            var container = Phaser.Utils.Objects.GetFastValue(singleConfig, 'container', null);
            var texture = Phaser.Utils.Objects.GetFastValue(singleConfig, 'key', null);
            var frame = Phaser.Utils.Objects.GetFastValue(singleConfig, 'frame', null);

            for (var i = 0; i < toConvert.length; i++) {
                obj = toConvert[i];

                var sprite = new classType(scene);

                sprite.setName(obj.name);
                sprite.setPosition(obj.x, obj.y);
                sprite.setTexture(texture, frame);

                if (obj.width) {
                    sprite.displayWidth = obj.width;
                }

                if (obj.height) {
                    sprite.displayHeight = obj.height;
                }

                //  Origin is (0, 1) in Tiled, so find the offset that matches the Sprites origin.
                //  Do not offset objects with zero dimensions (e.g. points).
                var offset = {
                    x: sprite.originX * obj.width,
                    y: (sprite.originY - 1) * obj.height
                };

                //  If the object is rotated, then the origin offset also needs to be rotated.
                if (obj.rotation) {
                    var angle = Phaser.Math.DegToRad(obj.rotation);

                    Phaser.Math.Rotate(offset, angle);

                    sprite.rotation = angle;
                }

                sprite.x += offset.x;
                sprite.y += offset.y;

                if (obj.flippedHorizontal !== undefined || obj.flippedVertical !== undefined) {
                    sprite.setFlip(obj.flippedHorizontal, obj.flippedVertical);
                }

                if (!obj.visible) {
                    sprite.visible = false;
                }

                //  Set properties the class may have, or setData those it doesn't
                if (Array.isArray(obj.properties)) {
                    // Tiled objects custom properties format
                    obj.properties.forEach(function (propData) {
                        var key = propData['name'];
                        if (sprite[key] !== undefined) {
                            sprite[key] = propData['value'];
                        }
                        else {
                            sprite.setData(key, propData['value']);
                        }
                    });
                }
                else {
                    for (var key in obj.properties) {
                        if (sprite[key] !== undefined) {
                            sprite[key] = obj.properties[key];
                        }
                        else {
                            sprite.setData(key, obj.properties[key]);
                        }
                    }
                }

                if (container) {
                    container.add(sprite);
                }
                else {
                    scene.add.existing(sprite);
                }

                results.push(sprite);
            }
        }

        return results;
    }

export default createFromObjects;
