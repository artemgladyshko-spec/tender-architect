const fs = require("fs");
const path = require("path");
const { spawn } = require("child_process");

const backendDir = __dirname;
const frontendStatusPath = path.resolve(
  backendDir,
  "..",
  "frontend",
  "public",
  "backend-status.json",
);

function writeStatus(status) {
  fs.writeFileSync(frontendStatusPath, JSON.stringify(status, null, 2), "utf8");
}

writeStatus({
  status: "starting",
  message: "Backend is starting...",
  updatedAt: new Date().toISOString(),
});

const child = spawn(process.execPath, ["server.js"], {
  cwd: backendDir,
  stdio: ["inherit", "pipe", "pipe"],
});

let stderrBuffer = "";
let startupConfirmed = false;

child.stdout.on("data", (chunk) => {
  const text = chunk.toString();
  process.stdout.write(text);

  if (text.includes("Tender Architect API running on port")) {
    startupConfirmed = true;
    writeStatus({
      status: "online",
      message: "Backend is running.",
      updatedAt: new Date().toISOString(),
    });
  }
});

child.stderr.on("data", (chunk) => {
  const text = chunk.toString();
  stderrBuffer += text;
  process.stderr.write(text);
});

child.on("exit", (code, signal) => {
  writeStatus({
    status: "offline",
    message: startupConfirmed
      ? "Backend stopped."
      : "Backend failed to start.",
    details: stderrBuffer.trim() || null,
    code,
    signal,
    updatedAt: new Date().toISOString(),
  });

  process.exit(code || 0);
});

["SIGINT", "SIGTERM"].forEach((eventName) => {
  process.on(eventName, () => {
    if (!child.killed) {
      child.kill(eventName);
    }
  });
});
