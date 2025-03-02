export class Position {
  x: number = 0;
  y: number = 0;
  z: number = 0;
  rotation: number = 0;
  scale: number = 1;
  
  constructor(x: number = 0, y: number = 0, z: number = 0) {
    this.x = x;
    this.y = y;
    this.z = z;
  }
  
  clone(): Position {
    return new Position(this.x, this.y, this.z);
  }
}
