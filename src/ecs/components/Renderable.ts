import { Component } from '../Component';

export class Renderable extends Component {
  constructor(
    public texture: string = '',
    public width: number = 0,
    public height: number = 0
  ) {
    super('Renderable');
  }
}
