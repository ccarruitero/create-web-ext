const { spawn } = require('child_process');

module.exports = (cmdArgs) => {
  const spawnedProcess = spawn(
    process.execPath, cmdArgs
  );

  return new Promise((resolve) => {
    let errorData = '';
    let outputData = '';

    spawnedProcess.stderr.on('data', (data) => {
      console.log(`stderr: ${data}`);
      errorData += data;
    });
    spawnedProcess.stdout.on('data', (data) => {
      console.log(`stdout: ${data}`);
      outputData += data;
    });

    spawnedProcess.on('close', (exitCode) => {
      console.log(`close: ${exitCode}`);
      resolve({
        exitCode,
        stderr: errorData,
        stdout: outputData,
      });
    });
  });
};
