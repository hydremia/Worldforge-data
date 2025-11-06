import { execSync } from "child_process";

console.log("🚀  Running HUB QGate cycle...");
execSync("curl -s http://localhost:8080/dashboard/manifest > NUL", { stdio: "inherit" });
execSync("node tools/validate_manifest.js", { stdio: "inherit" });
console.log("✅  HUB QGate cycle complete.");
