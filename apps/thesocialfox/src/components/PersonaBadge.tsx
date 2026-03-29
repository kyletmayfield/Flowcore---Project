import type { Persona } from "@flowcore/engine";

interface Props {
  persona: Persona;
}

export default function PersonaBadge({ persona }: Props) {
  return (
    <div className="bg-white rounded-lg border border-fox-200 p-4">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-fox-100 flex items-center justify-center text-fox-600 font-bold text-lg">
          {persona.name.charAt(0)}
        </div>
        <div>
          <h3 className="font-semibold text-gray-800">{persona.name}</h3>
          <p className="text-xs text-gray-500">{persona.voice}</p>
        </div>
      </div>
      <div className="flex flex-wrap gap-1.5 mt-3">
        {persona.values.map((v) => (
          <span key={v} className="text-[10px] bg-fox-50 text-fox-600 px-2 py-0.5 rounded-full border border-fox-200">
            {v}
          </span>
        ))}
      </div>
    </div>
  );
}
