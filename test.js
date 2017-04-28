/*
exports.deliver = () => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const luck = random(0, 100);
      if (luck < 10) {
        return reject();
      }
      return resolve();
    }, random(1500, 5000));
  });
}
*/
function delay1(ms) {
    return new Promise((resolve, reject) => {
        setTimeout(() => resolve(), ms);
    });
}

function fn() {
    console.log('qwerty');
}
delay1(100).then(fn);