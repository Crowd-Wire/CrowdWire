import { Tilemaps } from "phaser";

enum WallType {
    WALL,
    WINDOW,
    DOOR1,
    DOOR2,
}

class WallManager {
    static _instance: WallManager;
    static REVERSE = 0b1111111;
    static INDEX = 0b0011111;
    static LOCKED_TOP = 0b0100000;
    static LOCKED_BOT = 0b1000000;

    private wallLayer: Tilemaps.LayerData;
    private roofLayer: Tilemaps.LayerData;
    private data: number[][];
    private firstGids: number[][];

    constructor(wallLayer: Tilemaps.LayerData, roofLayer: Tilemaps.LayerData) {
        if (!WallManager._instance) {
            this.wallLayer = wallLayer;
            this.roofLayer = roofLayer;
            const { width, height } = wallLayer;
            this.data = Array.from(Array(height), _ => Array(width).fill(0));
            this.firstGids = Array.from(Array(height), _ => Array(width).fill(0));

            for (let y = 0; y < height; y++)
                for (let x = 0; x < width; x++) {
                    const tile = wallLayer.data[y][x];

                    if (y === 0 || tile.index === -1
                        || wallLayer.data[y - 1][x].index === -1) {
                        continue;
                    }
                    // TODO: Fix error when tileset is not loaded
                    let id = tile.index - tile.tileset.firstgid;
                    if (id < 7 || 12 < id) {
                        // Search correct id
                        if (wallLayer.data[y - 2][x].index - tile.tileset.firstgid === 13
                            || roofLayer.data[y - 2][x].index - tile.tileset.firstgid === 6) {
                            id = 7;
                        } else {
                            continue;
                        }
                    }
                    if ([8, 9].includes(id)) {
                        this.data[y - 1][x] |= WallManager.LOCKED_TOP;
                        y + 1 < height && (this.data[y + 1][x] |= WallManager.LOCKED_BOT);
                    } else if (id === 10) {
                        this.data[y - 1][x + 1] |= WallManager.LOCKED_TOP;
                        this.data[y + 1][x + 1] |= WallManager.LOCKED_BOT;

                        // Hack to address an id to the door empty tile
                        this.data[y][x + 1] |= 11;
                        this.firstGids[y][x + 1] = tile.tileset.firstgid;
                    } else if (id === 12) {
                        this.data[y - 1][x - 1] |= WallManager.LOCKED_TOP;
                        this.data[y + 1][x - 1] |= WallManager.LOCKED_BOT;
                    }
                    this.data[y][x] |= id;
                    this.firstGids[y][x] |= tile.tileset.firstgid;
                    console.log(id)
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
        return !this.onBounds(x, y) || [7, 9, 12].includes(this.data[y][x] & WallManager.INDEX);
    }

    private isLeft(x: number, y: number): boolean {
        return !this.onBounds(x, y) || [7, 8, 10].includes(this.data[y][x] & WallManager.INDEX);
    }

    private fill(x: number, y: number): void {
        let fill = [-1, -1, -1],
            fillRoof = [-1, -1, -1];

        // Refill walls
        for (let i = -2; i <= 3; i++) {
            if (!this.onBounds(x, y + i))
                continue;
            // console.log(y+i, y, i)
            const dt = this.data[y + i][x] & WallManager.INDEX;
            if (dt != 0) {
                fill[2 + i] = dt + this.firstGids[y + i][x];    // Fill 
                fill[2 + i - 1] = dt - 7 + this.firstGids[y + i][x];
            }
        }
        // Refill roofs
        let prevDt = this.data[y - 1][x] & WallManager.INDEX;
        for (let i = 0; i <= 4; i++) {
            if (!this.onBounds(x, y + i))
                continue;
            const dt = this.data[y + i][x] & WallManager.INDEX;
            console.log(dt)
            if (dt != 0) {
                if (prevDt != 0) {
                    fill[i] = 13 + this.firstGids[y + i][x];
                } else {
                    console.log('roof')
                    fillRoof[i] = 6 + this.firstGids[y + i][x];
                }
            }
            prevDt = dt;
        }
        // Update map
        for (let i = 0; i < 5; i++) {
            fill[i] && this.wallLayer.tilemapLayer.fill(fill[i], x, y + i - 2, 1, 1);
            fillRoof[i] && this.roofLayer.tilemapLayer.fill(fillRoof[i], x, y + i - 2, 1, 1);
        }
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

        const update = (width: number) => {
            for (let i = 0; i < width; i++) {
                this.firstGids[y][x - i] = firstgid;
                this.fill(x - i, y);
            }
        }
        switch (type) {
            case WallType.WALL:
                this.data[y][x] |= 7;
                this.firstGids[y][x] = firstgid;
                update(1);
                break;
            case WallType.WINDOW:
                this.data[y][x] |= 9;
                this.data[y][x - 1] |= 8;
                this.data[y - 1][x] |= WallManager.LOCKED_TOP;
                this.data[y - 1][x - 1] |= WallManager.LOCKED_TOP;
                this.data[y + 1][x] |= WallManager.LOCKED_BOT;
                this.data[y + 1][x - 1] |= WallManager.LOCKED_BOT;
                update(2);
                break;
            case WallType.DOOR1:
                this.data[y][x] |= 12;
                this.data[y][x - 1] |= 11;
                this.data[y][x - 2] |= 10;
                this.data[y - 1][x - 1] |= WallManager.LOCKED_TOP;
                this.data[y + 1][x - 1] |= WallManager.LOCKED_BOT;
                update(3);
                break;
            case WallType.DOOR2:
                this.data[y][x] |= 12;
                this.data[y][x - 1] |= 11;
                this.data[y][x - 2] |= 11;
                this.data[y][x - 3] |= 10;
                this.data[y - 1][x - 1] |= WallManager.LOCKED_TOP;
                this.data[y - 1][x - 2] |= WallManager.LOCKED_TOP;
                this.data[y + 1][x - 1] |= WallManager.LOCKED_BOT;
                this.data[y + 1][x - 2] |= WallManager.LOCKED_BOT;
                update(4);
                break;
        }
    }

    remove(x: number, y: number) {
        if (!this.checkRemove(x, y))
            return;

        let endLeft = 0;
        let endRight = 0;
        for (let l = 0; ; l++) {
            if (this.isLeft(x - l, y)) {
                endLeft = x - l;
                break;
            }
        }
        for (let r = 0; ; r++) {
            if (this.isRight(x + r, y)) {
                endRight = x + r;
                break;
            }
        }
        for (let z = endLeft; z <= endRight; z++) {
            this.data[y][z] &= (WallManager.INDEX ^ WallManager.REVERSE);
            this.onBounds(z, y - 1) && (this.data[y - 1][z] &= (WallManager.LOCKED_TOP ^ WallManager.REVERSE));
            this.onBounds(z, y + 1) && (this.data[y + 1][z] &= (WallManager.LOCKED_BOT ^ WallManager.REVERSE));
            this.firstGids[y][z] = 0;
            this.fill(z, y);
        }
    }
}

export default WallManager;
