export default function SpecTable({ specs }) {
  const entries = Object.entries(specs || {});
  if (entries.length === 0) return null;

  return (
    <div className="rounded-xl border border-neutral-200 overflow-hidden">
      <table className="w-full text-sm">
        <tbody>
          {entries.map(([key, value], i) => (
            <tr key={key} className={i % 2 === 0 ? "bg-white" : "bg-neutral-50"}>
              <td className="w-1/3 px-4 py-2 font-medium text-neutral-600">{key}</td>
              <td className="px-4 py-2 text-neutral-800">{value}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
