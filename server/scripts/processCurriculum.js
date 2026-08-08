import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const curriculumPath = path.join(
  __dirname,
  "../data/curriculum.json"
);

const outputPath = path.join(
  __dirname,
  "../data/processed/curriculumDocuments.json"
);

async function processCurriculum() {
  try {
    // Read curriculum.json
    const file = await fs.readFile(
      curriculumPath,
      "utf-8"
    );

    const curriculum = JSON.parse(file);

    // Make sure the days array exists
    if (!Array.isArray(curriculum.days)) {
      throw new Error(
        "curriculum.days is not an array."
      );
    }

    const documents = [];

    // Convert every day into a RAG document
    for (const day of curriculum.days) {
      const document = {
        id: `day-${day.day}`,
        day: day.day,
        title: day.title,
        module: day.module,
        topic: day.topic,
        objectives: day.objectives || [],
        tools: day.tools || [],
        text: `
Day ${day.day}

Title: ${day.title}

Module: ${day.module}

Topic:
${day.topic}

Learning Objectives:
${(day.objectives || []).join("\n")}

Tools:
${(day.tools || []).join(", ")}
        `.trim()
      };

      documents.push(document);
    }

    // Save processed documents
    await fs.writeFile(
      outputPath,
      JSON.stringify(documents, null, 2),
      "utf-8"
    );

    console.log(
      `Successfully processed ${documents.length} curriculum days.`
    );

    console.log(
      `Saved to: ${outputPath}`
    );

  } catch (error) {
    console.error(
      "Error processing curriculum:"
    );

    console.error(error.message);
  }
}

processCurriculum();