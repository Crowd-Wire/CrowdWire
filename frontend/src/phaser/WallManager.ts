import { Tilemaps } from "phaser";

enum WallType {
    WALL,
    WINDOW,
    DOOR1,
    DOOR2,
}

class WallManager {
    static _instance: WallManager;
    static INDEX = 0b0011111;
    static LOCKED_TOP = 0b0100000;
    static LOCKED_BOT = 0b1000000;

    private wallLayer: Tilemaps.LayerData;
    private data: number[][];

    constructor(wallLayer: Tilemaps.LayerData) {
        if (!WallManager._instance) {
            this.wallLayer = wallLayer;
            const { width, height } = wallLayer;
            this.data = Array.from(Array(height), _ => Array(width).fill(0));

            for (let y = 0; y < height; y++)
                for (let x = 0; x < width; x++) {
                    const tile = wallLayer.data[y][x];

                    if (y === 0 || tile.index === -1
                        || wallLayer.data[y - 1][x].index === -1) {
                        continue;
                    }
                    const id = tile.index - tile.tileset.firstgid;
                    if (id < 7) {
                        continue;
                    }
                    if ([8, 9].includes(id)) {
                        this.data[y - 1][x] |= WallManager.LOCKED_TOP;
                        y + 1 < height && (this.data[y + 1][x] |= WallManager.LOCKED_BOT);
                    } else if (id === 10) {
                        this.data[y][x + 1] |= 11;
                        this.data[y - 1][x + 1] |= WallManager.LOCKED_TOP;
                        this.data[y + 1][x + 1] |= WallManager.LOCKED_BOT;
                    } else if (id === 12) {
                        this.data[y][x - 1] |= 11;
                        this.data[y - 1][x - 1] |= WallManager.LOCKED_TOP;
                        this.data[y + 1][x - 1] |= WallManager.LOCKED_BOT;
                    }
                    this.data[y][x] |= id;
                }
            WallManager._instance = this;
            console.log(this.data);
        }
        return WallManager._instance;
    }

    private onBounds(x: number, y: number): boolean {
        return 0 <= x && x < this.wallLayer.width && 0 <= y && y < this.wallLayer.height;
    }

    private blocked(x: number, y: number): boolean {
        return this.onBounds(x, y) && (this.data[y][x] & WallManager.INDEX) > 0;
    }

    private locked(x: number, y: number): boolean {
        return this.onBounds(x, y) && (this.data[y][x] & (WallManager.LOCKED_TOP | WallManager.LOCKED_BOT)) > 0;
    }

    private isRight(x: number, y: number): boolean {
        return this.onBounds(x, y) && [9, 12].includes(this.data[y][x] & WallManager.INDEX);
    }

    private isLeft(x: number, y: number): boolean {
        return this.onBounds(x, y) && [8, 10].includes(this.data[y][x] & WallManager.INDEX);
    }

    checkPlace(type: WallType, x: number, y: number): boolean {
        if (y < 2)
            return false;

        switch (type) {
            case WallType.WALL:
                return !this.blocked(x, y) && !this.locked(x, y);
            case WallType.WINDOW:
                return (
                    x > 0 && !this.blocked(x, y) && !this.locked(x, y)
                    && !this.blocked(x - 1, y) && !this.locked(x - 1, y)
                    && !this.blocked(x - 1, y - 1) && !this.blocked(x, y - 1)
                    && !this.blocked(x - 1, y + 1) && !this.blocked(x, y + 1)
                )
            case WallType.DOOR1:
                return (
                    x > 1 && !this.blocked(x, y) && !this.locked(x, y)
                    && !this.blocked(x - 1, y) && !this.locked(x - 1, y)
                    && !this.blocked(x - 2, y) && !this.locked(x - 2, y)
                    && !this.blocked(x - 1, y - 1) && !this.blocked(x - 1, y + 1)
                )
            case WallType.DOOR2:
                return (
                    x > 2 && !this.blocked(x, y) && !this.locked(x, y)
                    && !this.blocked(x - 1, y) && !this.locked(x - 1, y)
                    && !this.blocked(x - 2, y) && !this.locked(x - 2, y)
                    && !this.blocked(x - 3, y) && !this.locked(x - 3, y)
                    && !this.blocked(x - 1, y - 1) && !this.blocked(x - 2, y - 1)
                    && !this.blocked(x - 1, y + 1) && !this.blocked(x - 2, y + 1)
                )
        }
    }

    checkRemove(x: number, y: number): boolean {
        return this.blocked(x, y);
    }

    place(firstgid: number, type: WallType, x: number, y: number): void {
        if (!this.checkPlace(type, x, y))
            return;
    }

    remove(x: number, y: number) {
        if (!this.checkRemove(x, y))
            return;
    }
}

export default WallManager;
