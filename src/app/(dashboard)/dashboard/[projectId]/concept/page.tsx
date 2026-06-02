"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { ConceptIntakeForm } from "@/components/concept-intake/ConceptIntakeForm";
import { DeconstructionResults } from "@/components/concept-intake/DeconstructionResults";

export default function ProjectConceptPage() {
  const params = useParams<{ projectId: string }>();
  const [result, setResult] = useState<any>(null);

  return (
    <div className="space-y-6">
      {result ? (
        <DeconstructionResults result={result} projectId={params.projectId} onReset={() => setResult(null)} />
      ) : (
        <ConceptIntakeForm projectId={params.projectId} onComplete={setResult} />
      )}
    </div>
  );
}
