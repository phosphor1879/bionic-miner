const nvidia = require('./nvidia');

const TARGET_TEMP = 69;

let timeouts = [];
let interval = null;

async function autofan(gpus, uuid, tempTarget) {
  const tick = async () => {
    let gpu_int = gpus[uuid];
    try {
      let [temp_C, fan_pct] = await nvidia.getTempAndFanSpeed(gpu_int);
      if (temp_C > 89) {
        // uh oh, let's cool things down ASAP
        nvidia.setFanTarget(gpu_int, 90);
      }
      if (temp_C < tempTarget-1) {
        console.log('it is running cooler... slow down the fan');
        nvidia.setFanTarget(gpu_int, fan_pct-1)
      } else if (temp_C > tempTarget+1) {
        console.log('it is running warmer... speed up the fan');
        nvidia.setFanTarget(gpu_int, fan_pct+1)
      }
    } catch(e) {
      console.log(e);
    }
  }
  interval = setInterval(tick, 25000);
  tick();
}

async function start() {
  const gpus = await nvidia.getGPUList();
  const uuids = Object.keys(gpus);
  for (var i=0; i<uuids.length; i++) {
    let uuid = uuids[i]
    let gpu_int = gpus[uuid];
    await nvidia.setFanTarget(gpu_int, 90);
    let timeout = setTimeout(()=>{
      autofan(gpus, uuid, TARGET_TEMP);
    }, i*5000);
    timeouts.push(timeout);
  }
}

async function stop() {
  console.log('stopping autofan');
  for (var i=0; i<timeouts.length; i++) {
    clearTimeout(timeouts[i]);
  }
  clearInterval(interval);
}

if (module.parent) {
  module.exports.start = start
  module.exports.stop = stop
} else {
  start();
}
