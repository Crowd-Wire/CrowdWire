import * as Phaser from 'phaser';

const buildTilesetIndex = (mapData) => {
    var tiles = [];

    for (var i = 0; i < mapData.imageCollections.length; i++)
    {
        var collection = mapData.imageCollections[i];
        var images = collection.images;

        for (var j = 0; j < images.length; j++) {
            var image = images[j];

            var set = new Phaser.Tilemaps.Tileset(image.image, image.gid, collection.imageWidth, collection.imageHeight, 0, 0);
            set.updateTileData(collection.imageWidth, collection.imageHeight);

            mapData.tilesets.push(set);
        }
    }

    for (var i = 0; i < mapData.tilesets.length; i++)
    {
        var set = mapData.tilesets[i];

        var x = set.tileMargin;
        var y = set.tileMargin;

        var count = 0;
        var countX = 0;
        var countY = 0;

        for (var t = set.firstgid; t < set.firstgid + set.total; t++)
        {
            //  Can add extra properties here as needed
            tiles[t] = [ x, y, i ];

            x += set.tileWidth + set.tileSpacing;

            count++;

            if (count === set.total)
            {
                break;
            }

            countX++;

            if (countX === set.columns)
            {
                x = set.tileMargin;
                y += set.tileHeight + set.tileSpacing;

                countX = 0;
                countY++;

                if (countY === set.rows)
                {
                    break;
                }
            }
        }
    }

    return tiles;
};

export {buildTilesetIndex};
