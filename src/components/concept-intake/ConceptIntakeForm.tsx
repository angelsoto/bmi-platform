"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Lightbulb, Rocket, Store, Globe, ChevronRight } from "lucide-react";

const QUICK_IDEAS = [
  {
    icon: Rocket,
    title: "SaaS Product",
    description: "A software-as-a-service platform solving a specific business or consumer need.",
    prompt: "I want to build a SaaS platform that helps [target customer] solve [problem] by providing [key solution]. The target customers are [describe persona]. The key problem is [main pain point]. I plan to charge [pricing model].",
  },
  {
    icon: Store,
    title: "Service Business",
    description: "A service-based business offering expertise, coaching, or consulting to clients.",
    prompt: "I want to build a service business that provides [service offering] to [target customer]. My expertise is in [area of expertise]. Clients are struggling with [main problem]. I plan to charge [pricing model] for [deliverable].",
  },
  {
    icon: Globe,
    title: "Marketplace",
    description: "A platform connecting buyers and sellers, producers and consumers in a niche market.",
    prompt: "I want to build a marketplace that connects [supply side] with [demand side]. The key pain point is that [describe matching problem]. I plan to monetize through [revenue model]. The target market is [describe market size and focus].",
  },
  {
    icon: Lightbulb,
    title: "Content Platform",
    description: "A media, education, or community platform built around valuable content.",
    prompt: "I want to build a content platform focused on [topic/niche]. The audience is [describe target audience]. They currently struggle with [content/pain gap]. I plan to create [content format] and monetize through [revenue model: subscriptions, ads, courses, etc.].",
  },
];

interface ConceptIntakeFormProps {
  projectId?: string;
  onComplete: (result: any) => void;
}

export function ConceptIntakeForm({ projectId, onComplete }: ConceptIntakeFormProps) {
  const router = useRouter();
  const [rawInput, setRawInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeProjectId, setActiveProjectId] = useState<string | null>(projectId || null);
  const [creatingProject, setCreatingProject] = useState(false);
  const [selectedIdea, setSelectedIdea] = useState(-1);

  const handleIdeaSelect = (i: number) => {
    setSelectedIdea(i);
    setRawInput(QUICK_IDEAS[i].prompt);
    setError(null);
  };

  const handleCreateDraft = async () => {
    setCreatingProject(true);
    setError(null);
    try {
      const res = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: "New Project Idea",
          description: "Draft project created from concept intake",
          businessType: "startup",
          currentStage: "idea",
          primaryGoal: "Validate business concept",
        }),
      });
      if (!res.ok) throw new Error("Failed to create draft project");
      const project = await res.json();
      setActiveProjectId(project.id);
      router.push(`/dashboard/${project.id}/concept`);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setCreatingProject(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeProjectId) {
      setError("Please create a draft project first, or navigate to an existing project.");
      return;
    }
    setLoading(true);
    setError(null);

    const input = rawInput;
    if (!input.trim()) {
      setError("Please enter your business idea");
      setLoading(false);
      return;
    }

    try {
      const intakeRes = await fetch(`/api/projects/${activeProjectId}/concept-intakes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rawInput: input }),
      });
      if (!intakeRes.ok) throw new Error("Failed to create intake");
      const intake = await intakeRes.json();

      const deconstructRes = await fetch(`/api/concept-intakes/${intake.id}/deconstruct`, { method: "POST" });
      if (!deconstructRes.ok) throw new Error("AI deconstruction failed");
      const result = await deconstructRes.json();

      onComplete(result);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      {/* Mode B — Engine/Explanation UI */}
      <div className="relative overflow-hidden rounded-lg bg-navy-900 p-6 text-white">
        <div className="bg-blueprint-grid pointer-events-none absolute inset-0 opacity-10" />
        <div className="relative">
          <div className="mb-2 inline-block rounded-full bg-cyan-400/20 px-3 py-1 text-xs font-medium text-cyan-400">
            Time-to-value: under 10 minutes
          </div>
          <h2 className="text-xl font-bold">Concept Intake</h2>
          <p className="mt-1 text-sm text-gray-300">
            Describe your business idea in plain language. Our AI will deconstruct it into structured assumptions, testable hypotheses, and a draft persona and offer.
          </p>
        </div>
      </div>

      {/* AI disclosure banner (§47.3) */}
      <div className="rounded-md border border-amber-200 bg-amber-50 p-3 text-xs text-amber-700">
        AI-generated suggestions require human review. Demo mode — suggestions are templates, not real analysis. Configure an inference provider for production use.
      </div>

      {/* Project state indicator */}
      <div className="flex items-center gap-2 text-xs text-gray-500">
        <span className={`flex items-center gap-1.5 rounded-full px-3 py-1 font-medium ${activeProjectId ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>
          <span className={`h-1.5 w-1.5 rounded-full ${activeProjectId ? "bg-green-500" : "bg-gray-400"}`} />
          {activeProjectId ? "Project selected" : "No project"}
        </span>
        <ChevronRight className="h-3 w-3 text-gray-300" />
        <span className="rounded-full bg-blueprint-100 px-3 py-1 font-medium text-navy-700">Idea stage</span>
        <ChevronRight className="h-3 w-3 text-gray-300" />
        <span className="rounded-full bg-gray-100 px-3 py-1 font-medium text-gray-400">Validating</span>
      </div>

      {!activeProjectId && (
        <div className="rounded-lg border-2 border-dashed border-indigo-200 bg-indigo-50 p-5 text-center">
          <Lightbulb className="mx-auto mb-2 h-6 w-6 text-indigo-400" />
          <h3 className="text-sm font-semibold text-indigo-700">Start with a draft project</h3>
          <p className="mt-1 text-sm text-indigo-600">
            Create a draft project to begin. You can name it and set details later.
          </p>
          <button onClick={handleCreateDraft} disabled={creatingProject}
            className="mt-3 inline-flex items-center gap-2 rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50">
            {creatingProject ? "Creating..." : "Create Draft Project"}
          </button>
        </div>
      )}

      {/* Quick-select idea cards */}
      <div>
        <h3 className="text-sm font-semibold text-navy-900 mb-3">Quick-start with a template</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {QUICK_IDEAS.map((idea, i) => {
            const Icon = idea.icon;
            return (
              <button key={i} onClick={() => handleIdeaSelect(i)}
                className={`text-left rounded-lg border p-4 transition-all hover:shadow-md ${
                  selectedIdea === i ? "border-navy-900 bg-navy-50 ring-1 ring-navy-900" : "border-gray-200 bg-white hover:border-gray-300"
                }`}>
                <Icon className={`h-5 w-5 mb-2 ${selectedIdea === i ? "text-navy-900" : "text-gray-400"}`} />
                <h4 className="text-sm font-medium text-navy-900">{idea.title}</h4>
                <p className="mt-0.5 text-xs text-gray-500">{idea.description}</p>
              </button>
            );
          })}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="relative">
          <textarea
            value={rawInput}
            onChange={(e) => setRawInput(e.target.value)}
            rows={8}
            className="block w-full rounded-md border border-gray-300 bg-white px-4 py-3 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            placeholder="Describe your business idea. What problem do you solve? Who is it for? How will you make money?"
          />
          <div className="mt-1 flex items-center justify-between text-xs text-gray-400">
            {selectedIdea >= 0 && (
              <button type="button" onClick={() => { setRawInput(""); setSelectedIdea(-1); }}
                className="text-indigo-500 hover:text-indigo-700">Clear template</button>
            )}
            <span className={selectedIdea >= 0 ? "" : "ml-auto"}>{rawInput.length} characters</span>
          </div>
        </div>

        {error && (
          <div className="rounded-md bg-red-50 p-3 text-sm text-red-600">{error}</div>
        )}

        <button type="submit" disabled={loading || !rawInput.trim() || !activeProjectId}
          className="flex w-full items-center justify-center gap-2 rounded-md bg-indigo-600 px-4 py-3 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50">
          {loading ? (
            <><span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" /> Deconstructing...</>
          ) : (
            "Deconstruct My Idea"
          )}
        </button>
      </form>
    </div>
  );
}
