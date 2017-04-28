const random = require('./random');

exports.deliver = () => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const luck = random(0, 100);
      if (luck < 50) {
        return reject();
      }
      return resolve();
    }, random(1500, 5000));
  });
}