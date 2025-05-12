import { fetchCustomers } from "@/app/lib/data";
import { lusitana } from "@/app/ui/fonts";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Customers",
};

export default async function Page() {
  const customers = await fetchCustomers();

  return (
    <div className="w-full">
      <div className="flex w-full items-center justify-between">
        <h1 className={`${lusitana.className} text-2xl`}>Customers</h1>
      </div>
      <div className="mt-4 flex items-center justify-between gap-2 md:mt-8">
        <ul>
          {customers.map((customer, index) => (
            <li key={index}>{customer.name}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}
