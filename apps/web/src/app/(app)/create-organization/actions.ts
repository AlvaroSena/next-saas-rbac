// "use server";

// import { z } from "zod";

// import { HTTPError } from "ky";
// import { createOrganization } from "@/http/create-organization";

// const organizationSchema = z.object({
//   name: z
//     .string()
//     .min(4, { message: "Please, include at least 4 characteres" }),
//   domain: z
//     .string()
//     .nullable()
//     .refine((value) => {
//       if (value) {
//         const domainRegex = /^(?:[a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}$/;

//         return domainRegex.test(value);
//       }

//       return true;
//     }),
//   shouldAttachUsersByDomain: z.union([
//     z.literal("on"),
//     z.literal("off"),
//     z.boolean(),
//   ]),
// });

// export async function createOrganizationAction(data: FormData) {
//   const result = organizationSchema.safeParse(Object.fromEntries(data));

//   if (!result.success) {
//     const errors = result.error.flatten().fieldErrors;

//     return {
//       success: false,
//       message: null,
//       errors,
//     };
//   }

//   const { name, email, password } = result.data;

//   try {
//     await signUp({
//       name,
//       email,
//       password,
//     });
//   } catch (err) {
//     if (err instanceof HTTPError) {
//       const { message } = await err.response.json();

//       return {
//         success: false,
//         message,
//         errors: null,
//       };
//     }

//     console.error(err);

//     return {
//       success: false,
//       message: "Unexpected error, try again in a few minutes.",
//       errors: null,
//     };
//   }

//   return {
//     success: true,
//     message: null,
//     errors: null,
//   };
// }
