const express = require("express");
const robot = require("robotjs");
const { spawn } = require("child_process");
const app = express();
const port = 3000;
let child;

require('dotenv').config();
const username = process.env.USERNAME;
const secretKey = process.env.SECRET_KEY;
console.log(username);
console.log(secretKey);
app.get("/fingerprint", (req, res) => {
  const programPath =
    '"C:\\Program Files (x86)\\BPJS Kesehatan\\Aplikasi Sidik Jari BPJS Kesehatan\\After.exe"';

  child = spawn(programPath, [], { shell: true });

  // Capture and handle standard output from the child process
  child.stdout.on("data", (data) => {
    console.log(`Program Output: ${data}`);
  });

  // Capture and handle standard error output from the child process
  child.stderr.on("data", (data) => {
    console.error(`Error Output: ${data}`);
  });

  // Handle any errors that occur during program execution
  child.on("error", (error) => {
    console.error(`Error: ${error.message}`);
  });

  // Handle the exit event when the program finishes running
  child.on("exit", (code) => {
    if (code === 0) {
      msg = `Program '${programPath}' executed successfully`;
      res.json({
        metadata: {
          code: 200,
          message: msg,
        },
      });
      console.log(msg);
    } else {
      msg = `Program '${programPath}' failed with exit code ${code}`;
      res.json({
        metadata: {
          code: 201,
          message: msg,
        },
      });
      console.error(msg);
    }
  });

  setTimeout(() => {
    robot.typeString(username);
    robot.keyTap(["tab"]);
    robot.typeString(secretKey);
    robot.keyTap(["tab"]);
    robot.keyTap(["enter"]);
    setTimeout(() => {
      if (child) {
        const processToKill = 'After.exe';
        const child2 = spawn('taskkill', ['/F', '/IM', processToKill], { shell: true });

        child2.on('error', (error) => {
          console.error(`Error: ${error.message}`);
        });
        
        child2.on('exit', (code) => {
          if (code === 0) {
            console.log(`Terminated process: ${processToKill}`);
          } else {
            console.error(`Failed to terminate process: ${processToKill}`);
          }
        });
        console.log("Child process killed.");
      } else {
        console.log("No child process to kill.");
      }
    }, 3000);
  }, 1000);
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
