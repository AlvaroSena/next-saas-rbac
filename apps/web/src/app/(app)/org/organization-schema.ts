import { z } from "zod";

export const organizationSchema = z
  .object({
    name: z
      .string()
      .min(4, { message: "Please, include at least 4 characteres" }),
    domain: z
      .string()
      .nullable()
      .refine(
        (value) => {
          if (value) {
            const domainRegex = /^(?:[a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}$/;

            return domainRegex.test(value);
          }

          return true;
        },
        {
          message: "Please, enter a valid domain",
        }
      ),
    shouldAttachUsersByDomain: z
      .union([z.literal("on"), z.literal("off"), z.boolean()])
      .transform((value) => value === true || value === "on")
      .default(false),
  })
  .refine(
    (data) => {
      if (data.shouldAttachUsersByDomain === true && !data.domain) {
        return false;
      }

      return true;
    },
    {
      message: "Domain is required when auto-join is enabled.",
      path: ["domain"],
    }
  );

export type OrganizationSchema = z.infer<typeof organizationSchema>;
