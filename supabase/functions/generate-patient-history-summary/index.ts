// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

// Setup type definitions for built-in Supabase Runtime APIs
import "jsr:@supabase/functions-js/edge-runtime.d.ts"


// import { serve } from "std/server";
import { createClient } from "@supabase/supabase-js";
import { GoogleGenerativeAI } from '@google/generative-ai'; // Replace with the actual library

async function callGeminiAPI(prompt: any) {
  const genAI = new GoogleGenerativeAI('AIzaSyANtcZhAge7w2eX1pU-7nkF-w6fBj5W5ZU');
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

  // const prompt = "Write a story about a magic backpack."

  const result = await model.generateContent(prompt);
  const response = await result.response;
  const text = response.text();
  return text
}

Deno.serve(async (req) => {
  const supabase = createClient(
    Deno.env.get("DATABASE_URL")!,
    Deno.env.get("SUPABASE_ACCESS_TOKEN")!
  );

  const { patient_id } = await req.json();

  // Fetch patient data
  const { data, error } = await supabase
    .from("patient_historical_record")
    .select("*")
    .eq("patient_id", patient_id);

  if (error) return new Response(JSON.stringify({ error }), { status: 500 });

  // Call Gemini API to summarize
  const summary = await callGeminiAPI(data);

  // // Store summary in Supabase
  await supabase
    .from("patient_summaries")
    .upsert({ patient_id, summary });


  return new Response(JSON.stringify({ success: true, summary }), {
    headers: { "Content-Type": "application/json" },
  });
});


/* To invoke locally:

  1. Run `supabase start` (see: https://supabase.com/docs/reference/cli/supabase-start)
  2. Make an HTTP request:

  curl -i --location --request POST 'http://127.0.0.1:54321/functions/v1/generate-patient-history-summary' \
    --header 'Authorization: Bearer ' \
    --header 'Content-Type: application/json' \
    --data '{"name":"Functions"}'

*/
