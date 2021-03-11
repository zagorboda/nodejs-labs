import * as math from './node_modules/math/index.js';

console.log(' --- Absolute value --- ');
console.log(math.return_absolute_value(-56));
console.log(math.return_absolute_value(123));
console.log(math.return_absolute_value(0));
console.log(math.return_absolute_value(-0));
console.log(math.return_absolute_value('abc'));

console.log();
console.log(' --- Sum --- ');
console.log(math.return_sum([1, 2, 3, 4, 5]))
console.log(math.return_sum([0, -7, 9, 2, 1]))
console.log(math.return_sum([4, 2, 'a']))

console.log();
console.log(' --- Min element --- ');
console.log(math.return_min_element([1, 2, 3, 4, 5]))
console.log(math.return_min_element([0, -7, 9, 2, 1]))
console.log(math.return_min_element([4, 2, 'a']))


