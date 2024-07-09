import { defineAction, z } from "astro:actions";

export async function mutateData(method: string, path: string, payload?: any) {
  const baseUrl = import.meta.env.PUBLIC_STRAPI_URL || "http://localhost:1337";
  const url = new URL(path, baseUrl);

  const authToken = false;

  const headers: any = {
    "Content-Type": "application/json",
  };

  if (authToken) {
    headers["Authorization"] = `Bearer ${authToken}`;
  }

  try {
    const response = await fetch(url.href, {
      method: method,
      headers,
      body: JSON.stringify({ ...payload }),
    });
    const data = await response.json();
    return data;
  } catch (error) {
    console.log("error", error);
    throw error;
  }
}

interface Payload {
  data: {
    email: string;
  };
}

export const server = {
  email: defineAction({
    accept: "form",
    input: z.object({
      email: z
        .string({ message: "This field has to be filled." })
        .email("This is not a valid email."),
    }),

    handler: async (formData) => {
      // insert comments in db
      console.log(formData);

      const payload: Payload = {
        data: {
          email: formData.email,
        },
      };

      const responseData = await mutateData("POST", "api/email-signups", payload);

      if (!responseData) {
        return {
          strapiErrors: null,
          message: "Ops! Something went wrong. Please try again.",
        };
      }

      if (responseData.error) {
        return {
          strapiErrors: responseData.error,
          message: "Failed to Register.",
        };
      }

      return {
        message: "Form submitted, thank you.",
        data: responseData,
        strapiErrors: null,
      };
    },
  }),
};
