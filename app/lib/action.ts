"use server";
import { signIn, signOut } from "@/auth";
import { AuthError } from "next-auth";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import postgres from "postgres";
import { z } from "zod";

export type State = {
  errors?: {
    customerId?: string[];
    amount?: string[];
    status?: string[];
  };
  message?: string | null;
};

const FormSchema = z.object({
  id: z.string(),
  customerId: z.string({
    invalid_type_error: "Please select a customer",
  }),
  amount: z.coerce
    .number()
    .gt(0, { message: "Please enter an amount greater than $0." }),
  status: z.enum(["pending", "paid"], {
    invalid_type_error: "Please select an invoice status.",
  }),
  date: z.string(),
});

const sql = postgres(process.env.POSTGRES_URL!, { ssl: "require" });

const CreateInvoice = FormSchema.omit({ id: true, date: true });

export async function createInvoice(prevState: State, formData: FormData) {
  // making type safe with Zod
  const parsedData = CreateInvoice.safeParse({
    customerId: formData.get("customerId"),
    amount: formData.get("amount"),
    status: formData.get("status"),
  });
  // immediate return of defined State is there user try to submit the form without filling
  if (!parsedData.success) {
    return {
      errors: parsedData.error.flatten().fieldErrors,
      message: "Missing Fields. Failed to Create Invoice.",
    };
  }
  const amountInCents = parsedData.data?.amount * 100;
  const date = new Date().toISOString().split("T")[0];
  try {
    await sql`
        INSERT INTO invoices (customer_id, amount, status, date)
        VALUES (${parsedData.data.customerId}, ${amountInCents}, ${parsedData.data.status}, ${date})
      `;
  } catch (error) {
    console.log(error);
  }
  // refetching the page for fresh data otherwise it'll use cached one
  revalidatePath("/dashboard/invoices");
  redirect("/dashboard/invoices");
}

export async function editInvoice(
  id: string,
  prevState: State,
  formData: FormData
) {
  // making type safe with Zod
  const parsedData = CreateInvoice.safeParse({
    customerId: formData.get("customerId"),
    amount: formData.get("amount"),
    status: formData.get("status"),
  });
  if (!parsedData.success) {
    return {
      errors: parsedData.error.flatten().fieldErrors,
      message: "Missing Fields. Failed to Update Invoice.",
    };
  }
  const amountInCents = parsedData.data.amount * 100;
  const date = new Date().toISOString().split("T")[0];
  try {
    await sql`
      UPDATE invoices  
      SET customer_id = ${parsedData.data.customerId}, amount = ${amountInCents}, status = ${parsedData.data.status}, date = ${date}
      WHERE id = ${id}`;
  } catch (error) {
    console.log(error);
  }
  // refetching the page for fresh data otherwise it'll use cached one
  revalidatePath("/dashboard/invoices");
  redirect("/dashboard/invoices");
}

export async function deleteInvoice(id: string) {
  try {
    await sql`DELETE FROM invoices WHERE id = ${id}`;
  } catch (error) {
    console.log(error);
  }
  revalidatePath("/dashboard/invoices");
}

export async function authenticate(
  prevState: string | undefined,
  formData: FormData
) {
  try {
    await signIn("credentials", formData);
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case "CredentialsSignin":
          return "Invalid credentials.";
        default:
          return "Something went wrong.";
      }
    }
    throw error;
  }
}

export async function signOutUser() {
  await signOut({ redirectTo: "/" });
}
