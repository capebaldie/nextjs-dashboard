"use server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import postgres from "postgres";
import { z } from "zod";

const FormSchema = z.object({
  id: z.string(),
  customerId: z.string(),
  amount: z.coerce.number(),
  status: z.enum(["pending", "paid"]),
  date: z.string(),
});

const sql = postgres(process.env.POSTGRES_URL!, { ssl: "require" });

const CreateInvoice = FormSchema.omit({ id: true, date: true });

export async function createInvoice(formData: FormData) {
  // making type safe with Zod
  const parsedData = CreateInvoice.parse({
    customerId: formData.get("customerId"),
    amount: formData.get("amount"),
    status: formData.get("status"),
  });
  const amountInCents = parsedData.amount * 100;
  const date = new Date().toISOString().split("T")[0];
  await sql`
      INSERT INTO invoices (customer_id, amount, status, date)
      VALUES (${parsedData.customerId}, ${amountInCents}, ${parsedData.status}, ${date})
    `;
  // refetching the page for fresh data otherwise it'll use cached one
  revalidatePath("/dashboard/invoices");
  redirect("/dashboard/invoices");
}

export async function editInvoice(id: string, formData: FormData) {
  // making type safe with Zod
  const parsedData = CreateInvoice.parse({
    customerId: formData.get("customerId"),
    amount: formData.get("amount"),
    status: formData.get("status"),
  });
  const amountInCents = parsedData.amount * 100;
  const date = new Date().toISOString().split("T")[0];
  await sql`
    UPDATE invoices  
    SET customer_id = ${parsedData.customerId}, amount = ${amountInCents}, status = ${parsedData.status}, date = ${date}
    WHERE id = ${id}`;
  // refetching the page for fresh data otherwise it'll use cached one
  revalidatePath("/dashboard/invoices");
  redirect("/dashboard/invoices");
}

export async function deleteInvoice(id: string) {
  await sql`DELETE FROM invoices WHERE id = ${id}`;
  revalidatePath("/dashboard/invoices");
}
