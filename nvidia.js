const { exec } = require('child_process');

const getGPUList = async () => {
  return new Promise(function(resolve, reject) {
    exec('nvidia-smi -L', (err, stdout, stderr) => {
      if (err) return reject(err);
      let gpuMap = stdout.trim().split('\n').reduce((acc, line)=>{
        let [_, numStr, uuid] = line.match(/GPU (\d+):.+UUID: (.+)\)/)
        return {...acc, [uuid]: numStr}
      }, {});
      resolve(gpuMap);
    });
  });
}

module.exports.getGPUList = getGPUList;

const tuneGPU = async (gfx, mem, pwr, gpu_int) => {
  return new Promise(function(resolve, reject) {
    exec(`${__dirname}/../bin/oc.sh ${gfx} ${mem} ${pwr} ${gpu_int}`, (err, stdout, stderr) => {
      console.log(stdout, stderr);
      if (err) {
        return reject(err);
      }
      resolve(stdout);
    });
  });
}

module.exports.tuneGPU = tuneGPU;

const relinquishFanControl = async (gpu_int) => {
  return new Promise(function(resolve, reject) {
    exec(`/usr/bin/nvidia-settings  -a "[gpu:${gpu_int}]/GPUFanControlState=0"`, {
      env: {
        DISPLAY: ":0",
        XAUTHORITY: "/var/run/lightdm/root/:0"
      }
    }, (err, stdout, stderr) => {
      console.log(stdout, stderr);
      if (err) {
        return reject(err);
      }
      resolve(stdout);
    });
  });
}

module.exports.relinquishFanControl = relinquishFanControl;

const setFanTarget = async (gpu_int, fan) => {
  return new Promise(function(resolve, reject) {
    exec(`/usr/bin/nvidia-settings  -a "[gpu:${gpu_int}]/GPUFanControlState=1" -a "[fan:${gpu_int}]/GPUTargetFanSpeed=${fan}"`, {
      env: {
        DISPLAY: ":0",
        XAUTHORITY: "/var/run/lightdm/root/:0"
      }
    }, (err, stdout, stderr) => {
      console.log(stdout, stderr);
      if (err) {
        return reject(err);
      }
      resolve(stdout);
    });
  });
}

module.exports.setFanTarget = setFanTarget;

const getTempAndFanSpeed = async (gpu_int) => {
  let cmd = `/usr/bin/nvidia-smi -i ${gpu_int} --format=csv --query-gpu=temperature.gpu,fan.speed`;
  return new Promise(function(resolve, reject) {
    exec(cmd, (err, stdout, stderr) => {
      if (err) {
        return reject(err);
      }
      let [temp_C_str, fan_pct_str] = stdout.trim().split('\n')[1].split(', ');
      resolve([parseInt(temp_C_str), parseInt(fan_pct_str.replace(' %',''))])
    });
  });
}

module.exports.getTempAndFanSpeed = getTempAndFanSpeed;

