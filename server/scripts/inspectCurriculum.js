import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const curriculumPath = path.join(
  __dirname,
  "../data/curriculum.json"
);

async function inspectCurriculum() {
  try {
    const file = await fs.readFile(curriculumPath, "utf-8");

    const curriculum = JSON.parse(file);

    console.log("\n===== CURRICULUM INSPECTION =====\n");

    console.log("Data type:");

    if (Array.isArray(curriculum)) {
      console.log("Array");
    } else {
      console.log("Object");
    }

    console.log("\nTop-level keys:");

    if (
      typeof curriculum === "object" &&
      !Array.isArray(curriculum)
    ) {
      console.log(Object.keys(curriculum));
    } else {
      console.log("Curriculum itself is an array.");
    }

    console.log("\nNumber of top-level items:");

    if (Array.isArray(curriculum)) {
      console.log(curriculum.length);
    } else {
      console.log(Object.keys(curriculum).length);
    }

    console.log("\nFirst item/sample:");

    if (Array.isArray(curriculum)) {
      console.log(
        JSON.stringify(curriculum[0], null, 2)
      );
    } else {
      console.log(
        JSON.stringify(curriculum, null, 2)
      );
    }

    console.log("\n===== END =====\n");

  } catch (error) {
    console.error("\nCould not read curriculum.json\n");
    console.error(error.message);
  }
}

inspectCurriculum();