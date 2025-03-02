import { Component } from '../Component';

export class Velocity extends Component {
  constructor(
    public x: number = 0,
    public y: number = 0
  ) {
    super('Velocity');
  }
}
