import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { Resend } from 'resend';

// const resend = new Resend(process.env.RESEND_API_KEY);

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}


// export async function sendEmail({
//   to,
//   subject,
//   text,
//   html,
// }: {
//   to: string;
//   subject: string;
//   text?: string;
//   html?: string;
// }) {
//   try {
//     const { data, error } = await resend.emails.send({
//       from: 'Acme <onboarding@resend.dev>',
//       to,
//       subject
//     });

//     if (error) {
//       return Response.json({ error }, { status: 500 });
//     }

//     return Response.json(data);
//   } catch (error) {
//     return Response.json({ error }, { status: 500 });
//   }
// }
