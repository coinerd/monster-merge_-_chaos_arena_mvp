import { Component } from '../Component';

export class Collidable extends Component {
  constructor(
    public width: number = 0,
    public height: number = 0
  ) {
    super('Collidable');
  }
}
