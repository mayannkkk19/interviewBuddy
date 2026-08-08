import { retrieveCurriculum } from "../services/ai/retrieval.service.js";
import { closeDB } from "../config/mongodb.js";

async function testRetrieval() {
  try {
    const query =
      "What is retrieval augmented generation and why is it useful?";

    console.log("Searching curriculum...");
    console.log(`Query: ${query}\n`);

    const results = await retrieveCurriculum(query, 5);

    console.log(`Found ${results.length} results:\n`);

    results.forEach((result, index) => {
      console.log(`----- Result ${index + 1} -----`);

      console.log(`Day: ${result.day}`);
      console.log(`Title: ${result.title}`);
      console.log(`Topic: ${result.topic}`);
      console.log(`Score: ${result.score}`);

      console.log(
        `Objectives:`,
        result.objectives
      );

      console.log();
    });

  } catch (error) {
    console.error("Retrieval test failed:");
    console.error(error);

  } finally {
    await closeDB();
  }
}

testRetrieval();