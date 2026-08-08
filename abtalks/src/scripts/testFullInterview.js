import {
  startInterview,
  processAnswer
} from "../services/ai/interviewEngine.service.js";


async function testFullInterview() {

  try {

    console.log("Starting full interview...\n");


    // ========================================
    // CANDIDATE PROFILE
    // ========================================

    const candidateProfile = {

      name: "Test Candidate",

      completedDays: [
        8,
        9,
        10,
        11,
        12,
        13,
        14,
        17,
        18,
        19,
        20,
        21,
        22,
        23,
        24,
        25,
        26,
        27,
        28,
        29,
        30,
        31
      ],

      skippedDays: [
        15,
        16
      ],

      learningSignals: {

        rag: "strong",

        vectorDatabases: "strong",

        agents: "beginner"
      }
    };


    // ========================================
    // START INTERVIEW
    // ========================================

    const interview =
      await startInterview(candidateProfile);


    let state =
      interview.state;


    console.log("========================================");
    console.log("QUESTION 1");
    console.log("========================================");

    console.log(
      interview.question
    );

    console.log("\nCURRICULUM DAY:");

    console.log(
      interview.day
    );


    // ========================================
    // ANSWERS
    // ========================================

    const answers = [

      "I would use vector embeddings to represent documents and queries, then use cosine similarity to retrieve the most relevant documents.",

      "I would evaluate retrieval separately using relevance judgments and metrics such as precision at k and recall at k.",

      "I would instruct the LLM to answer only from the retrieved context and say that it does not know when the information is missing.",

      "I would use metadata filtering, hybrid search and reranking when vector search alone does not retrieve the most relevant documents.",

      "I would use an agent when the system needs to reason about which tool or action should be executed for a particular request.",

      "I would expose functions as tools and allow the agent to select the appropriate tool based on the user's intent.",

      "For production I would monitor latency, errors, retrieval quality and the quality of generated responses.",

      "I would evaluate the complete system using a test dataset, retrieval metrics, answer quality evaluation and human feedback."
    ];


    // ========================================
    // PROCESS ANSWERS
    // ========================================

    for (
      let i = 0;
      i < answers.length;
      i++
    ) {

      console.log("\n========================================");

      console.log(
        `CANDIDATE ANSWER ${i + 1}`
      );

      console.log("========================================");

      console.log(
        answers[i]
      );


      const result =
        await processAnswer(
          state,
          answers[i]
        );


      state =
        result.state;


      console.log("\nEVALUATION:");

      console.log(
        JSON.stringify(
          result.evaluation,
          null,
          2
        )
      );


      if (result.isComplete) {

        console.log(
          "\n========================================"
        );

        console.log(
          "INTERVIEW COMPLETE"
        );

        console.log(
          "========================================"
        );

        break;
      }


      console.log("\n========================================");

      console.log(
        `QUESTION ${state.questionsAsked}`
      );

      console.log("========================================");

      console.log(
        result.question
      );

      console.log("\nCURRICULUM DAY(S):");

      console.log(
        state.daysCovered
      );
    }


    // ========================================
    // FINAL RESULT
    // ========================================

    console.log("\n========================================");

    console.log(
      "FINAL INTERVIEW RESULT"
    );

    console.log("========================================");


    console.log(
      "\nQuestions asked:",
      state.questionsAsked
    );


    console.log(
      "Curriculum days covered:",
      state.daysCovered
    );


    console.log(
      "Different curriculum days:",
      state.daysCovered.length
    );


    console.log(
      "Evaluations:",
      state.evaluations.length
    );


    console.log(
      "Interview complete:",
      state.isComplete
    );


    // ========================================
    // REQUIREMENT CHECK
    // ========================================

    console.log("\n========================================");

    console.log(
      "REQUIREMENT CHECK"
    );

    console.log("========================================");


    const eightQuestions =
      state.questionsAsked >= 8;

    const fourDays =
      state.daysCovered.length >= 4;


    console.log(
      "8+ questions:",
      eightQuestions
        ? "PASS"
        : "FAIL"
    );


    console.log(
      "4+ curriculum days:",
      fourDays
        ? "PASS"
        : "FAIL"
    );


    if (
      eightQuestions &&
      fourDays
    ) {

      console.log(
        "\nFULL INTERVIEW REQUIREMENTS: PASS"
      );

    } else {

      console.log(
        "\nFULL INTERVIEW REQUIREMENTS: NOT YET PASSED"
      );
    }


  } catch (error) {

    console.error(
      "\nFULL INTERVIEW TEST FAILED:"
    );

    console.error(error);
  }
}


testFullInterview();