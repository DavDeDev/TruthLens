import {
  getYouTubeVideoId,
  TranscriptError,
  transcriptFromYouTubeId,
  transcriptToTextFile,
} from "./youtube";

import { Buffer } from "node:buffer";

import { createOpenAI as createGroq } from '@ai-sdk/openai';
import { generateObject, generateText } from 'ai';
import { z } from 'zod';

const groq = createGroq({
  baseURL: 'https://api.groq.com/openai/v1',
  apiKey: process.env.GROQ_API_KEY,
});

export async function GET(request: Request): Promise<Response> {
  try {
    const url = new URL(request.url);
    const { searchParams } = url;
    const videoParams = searchParams.getAll("v");
    const includeTimestamps = searchParams.get("timestamps") === "true";
    const filterOutMusic = searchParams.get("filterOutMusic") === "true";

    // Get unique, valid video IDs
    const videoIds = [
      ...new Set(
        videoParams
          .map((param) => getYouTubeVideoId(param))
          .filter((id) => id !== null)
      ),
    ];

    if (!videoIds.length) {
      const ending = url.toString().split(url.host)[1];
      console.log("[ending]", ending);
      const id = getYouTubeVideoId(ending);
      if (id) {
        videoIds.push(id);
      } else {
        return new Response("No valid video IDs provided", { status: 400 });
      }
    }

    // Fetch all transcripts in parallel
    const transcripts = await Promise.all(
      videoIds.map(async (id) => {
        const result = await transcriptFromYouTubeId(id);

        return { ...result, id };
      })
    );

    // Filter out failed transcripts and format them
    const formattedTranscripts = transcripts
      .filter((t): t is NonNullable<typeof t> => t !== null)
      .map((t) =>
        transcriptToTextFile({
          transcript: t,
          includeTimestamps,
          filterOutMusic,
        })
      );

    if (!formattedTranscripts.length) {
      return new Response("Failed to fetch any transcripts", { status: 404 });
    }

    // Combine all transcripts with separator
    const combinedText = formattedTranscripts.join(
      "\n\n====video ended====\n\n"
    );

    const headers = new Headers();
    headers.set("Content-Type", "text/plain; charset=utf-8");
    transcripts.forEach(({ transcript, ...t }) => {
      if (t) {
        headers.set(
          "title",
          Buffer.from(t.videoTitle.toString()).toString("base64")
        );
        if (t.imageUrl) {
          headers.set(
            "img-url",
            Buffer.from(t.imageUrl.toString()).toString("base64")
          );
        }
        headers.set("id", Buffer.from(t.id.toString()).toString("base64"));
      }
    });

    // Test the same prompt and console log it
    // console.log("SHOULD BE THE SAME", await generateText({
    //   model: groq('llama-3.1-70b-versatile'),
    //   prompt: `Analyze the following transcript and provide a political orientation score on a scale of 0 (left) to 100 (right). Include a short explanation for the score:
    //   Transcript: ${combinedText}`,
    // })
    // )

    // Analyze political orientation using AI
    let politicalAnalysis;
    // try {
    politicalAnalysis = await generateObject({
      model: groq('llama-3.1-70b-versatile'),
      schema: z.object({
        orientation: z.union([z.number().min(0).max(100), z.string()]),
                explanation: z.string(),
      }),
      prompt: `Analyze the following transcript and provide a political orientation score, only send the number from 0, meaning left most, to 100, most right. Include a short explanation for the score:
      Transcript: ${combinedText}`,
    });
    // } catch (error) {
    //   console.error("Political analysis failed, retrying...", error);
    //   politicalAnalysis = await generateText({
    //   model: groq('llama-3.1-70b-versatile'),
    //   // schema: z.object({
    //   //   orientation: z.number().min(0).max(100),
    //   //   explanation: z.string(),
    //   // }),
    //   prompt: `Analyze the following transcript and provide a political orientation score on a scale of 0 (left) to 100 (right). Include a short explanation for the score:
    //   Transcript: ${combinedText}`,
    //   });
    // }
    console.log(politicalAnalysis)

    const { orientation, explanation } = politicalAnalysis.object;


    // Include orientation and explanation in the headers
    headers.set("orientation", orientation.toString());
    headers.set("explanation", Buffer.from(explanation).toString("base64"));

    console.log("Political orientation:", orientation);
    console.log("Explanation:", explanation);

    // Return plain text response
    return new Response(combinedText, { headers });
  } catch (error) {
    if (error instanceof TranscriptError) {
      console.error("Transcript processing error:", error.message);
      return new Response(error.message, { status: 500 });
    }
    console.error("Transcript processing error:", error);
    return new Response("Failed to process transcripts", { status: 500 });
  }
}
