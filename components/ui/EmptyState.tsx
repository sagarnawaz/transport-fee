export function EmptyState({ title, text }: { title: string; text: string }) {
  return (
    <div className="panel p-6 text-center">
      <h2 className="text-lg font-semibold text-slate-900">{title}</h2>
      <p className="mt-2 text-sm leading-6 text-slate-600">{text}</p>
    </div>
  );
}
