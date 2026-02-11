import EngineerLogForm from "./ui/EngineerLogForm";

export default async function BoxLogPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;

  return (
    <main className="min-h-screen flex items-center justify-center p-4 sm:p-6 bg-gradient-to-br from-slate-50 via-indigo-50/30 to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      <EngineerLogForm token={token} />
    </main>
  );
}
