// Leonida Platinum — hand the GTA 6 trophy guide in.
//
// Copies app/ and screenshots/ from this repository into the output
// directory and writes output/dossier.json with buildDossier from the
// kit's vendor/makefun-frontend.ts. Outside the grader, the environment
// variable MAKEFUN_OUTPUT_DIR stands in for /output.
import { cpSync, mkdirSync, rmSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { buildDossier } from "./vendor/makefun-frontend.ts";

const repoRoot = dirname(fileURLToPath(import.meta.url));
const outputDir = process.env.MAKEFUN_OUTPUT_DIR || "/output";

const dossierCaps = {
  text_max_bytes: 163840,
  screenshots: { max: 4, max_bytes: 262144 },
  app_max_files: 993,
  app_max_bytes: 48 * 1024 * 1024,
  app_path_max_bytes: 1000,
};

function handInGuide() {
  mkdirSync(outputDir, { recursive: true });
  rmSync(join(outputDir, "app"), { recursive: true, force: true });
  rmSync(join(outputDir, "screenshots"), { recursive: true, force: true });
  rmSync(join(outputDir, "dossier.json"), { force: true });

  cpSync(join(repoRoot, "app"), join(outputDir, "app"), { recursive: true });
  cpSync(join(repoRoot, "screenshots"), join(outputDir, "screenshots"), { recursive: true });

  const dossier = buildDossier(outputDir, dossierCaps);
  writeFileSync(join(outputDir, "dossier.json"), dossier);
  console.log(`wrote ${join(outputDir, "dossier.json")} (${dossier.length} bytes)`);
}

handInGuide();
