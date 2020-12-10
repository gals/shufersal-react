const colors = [
  'blue',
  'blue-grey',
  'brown',
  'green',
  'orange',
  'purple',
];

export class Person {
  constructor(name, amount = 0) {
    this.name = name;
    this.amount = amount;
  }
  
  static getColor() {
    let color = colors.splice(Math.floor(Math.random()*colors.length), 1)[0];
    return color || '';
  }
}