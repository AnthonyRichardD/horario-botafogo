"use client";

import { Bus } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { BusLine } from "@/types/bus";

interface LineSelectorProps {
  lines: BusLine[];
  selectedLineId: string;
  onSelectLine: (lineId: string) => void;
}

export function LineSelector({
  lines,
  selectedLineId,
  onSelectLine,
}: LineSelectorProps) {
  return (
    <div className="flex flex-wrap justify-center gap-2">
      {lines.map((line) => (
        <Button
          key={line.id}
          variant={selectedLineId === line.id ? "default" : "outline"}
          size="sm"
          onClick={() => onSelectLine(line.id)}
          className={`transition-all ${
            selectedLineId === line.id
              ? "bg-sky-500 hover:bg-sky-600 dark:bg-sky-600 dark:hover:bg-sky-700"
              : "hover:border-sky-300 hover:text-sky-600"
          }`}
        >
          <Bus className="mr-1.5 h-3.5 w-3.5" />
          {line.nome}
        </Button>
      ))}
    </div>
  );
}
