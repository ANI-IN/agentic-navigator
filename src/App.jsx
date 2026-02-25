import { useState, useEffect, useCallback, useRef, useMemo, createContext, useContext, memo } from "react";

/* ═══════════════════════════════════════════════════════════════════════════
   DATA — 15 STEPS ACROSS 5 PHASES
   ═══════════════════════════════════════════════════════════════════════════ */

const phases = [
  { id: "A", name: "Agent Foundations", color: "#14b8a6", icon: "⚡", range: [1, 6] },
  { id: "B", name: "RAG Deep Dive", color: "#3b82f6", icon: "🧠", range: [7, 10] },
  { id: "C", name: "Evaluation & Security", color: "#a855f7", icon: "🛡️", range: [11, 12] },
  { id: "D", name: "Multi-Agent Systems", color: "#f59e0b", icon: "🔗", range: [13, 14] },
  { id: "E", name: "Production Systems", color: "#ec4899", icon: "🚀", range: [15, 15] },
];

const steps = [
  {
    id: 1, phase: "A", title: "The Agentic Core", conceptName: "The ReAct Loop", icon: "⚡",
    markdownContent: `### Moving Beyond Chatbots\nTraditional Large Language Models (LLMs) are reactive: you ask a question, and they generate a response based on static training data. An **Agent**, however, is proactive. It uses the LLM as a reasoning engine to determine which actions to take and in what order.\n\nThe foundation of this autonomy is the **ReAct (Reason + Act)** framework.\n\n1. **Thought:** The agent analyzes the user's request and plans the next step.\n2. **Action:** The agent selects a tool (e.g., Web Search, Calculator, API call) and formats a structured request to use it.\n3. **Observation:** The agent receives the output from the tool and feeds it back into its context window.\n4. **Repeat:** The loop continues until the agent determines the final answer is ready.`,
    keyTakeaways: ["Agents are proactive, not just reactive", "ReAct = Reason + Act in a continuous loop", "Tools extend the agent beyond text generation", "The observation step enables self-correction"],
    diagram: {
      nodes: [
        { id: "user", label: "User", type: "terminal", x: 0, y: 0.5 },
        { id: "thought", label: "Thought", type: "process", x: 0.22, y: 0.25 },
        { id: "action", label: "Action", type: "process", x: 0.44, y: 0.25 },
        { id: "tool", label: "Tool", type: "external", x: 0.66, y: 0.25 },
        { id: "observation", label: "Observation", type: "process", x: 0.44, y: 0.75 },
        { id: "response", label: "Final\nResponse", type: "terminal", x: 0.88, y: 0.5 },
      ],
      edges: [
        { from: "user", to: "thought", label: "Request" },
        { from: "thought", to: "action", label: "Plan" },
        { from: "action", to: "tool", label: "Execute" },
        { from: "tool", to: "observation", label: "Result" },
        { from: "observation", to: "thought", label: "Adjust", curved: true },
        { from: "observation", to: "response", label: "Done" },
      ]
    },
    activity: {
      question: "In the ReAct framework, what does the agent do immediately after executing a Tool?",
      options: ["Returns the raw tool output directly to the user.", "Observes the output and reasons about what to do next.", "Erases its memory to save context window space.", "Halts execution and waits for a human prompt."],
      correctIndex: 1,
      explanation: "After an action, the agent MUST observe the result and feed it back into its reasoning process to determine if the goal is met or if further actions are required."
    }
  },
  {
    id: 2, phase: "A", title: "Contextual Intelligence", conceptName: "Advanced RAG", icon: "🧠",
    markdownContent: `### Retrieval-Augmented Generation\nEven the most advanced reasoning engine is useless without accurate data. **RAG** solves the LLM knowledge cutoff problem by grounding the model in your specific, private data.\n\nAdvanced RAG goes beyond simple keyword matching:\n\n- **Chunking:** Splitting massive documents into smaller, semantically meaningful pieces.\n- **Embeddings:** Converting these chunks into high-dimensional numerical vectors that capture the *meaning* of the text, not just the specific words.\n- **Vector Database:** Storing these embeddings for ultra-fast similarity searches.\n- **Generation:** Retrieving the top-K most relevant chunks and injecting them into the LLM's system prompt before it answers the user.`,
    keyTakeaways: ["RAG grounds LLMs in real, private data", "Embeddings capture meaning, not just keywords", "Vector databases enable semantic similarity search", "Top-K retrieval injects context before generation"],
    diagram: {
      nodes: [
        { id: "query", label: "User Query", type: "input", x: 0.05, y: 0.15 },
        { id: "embed", label: "Embedding\nModel", type: "process", x: 0.3, y: 0.15 },
        { id: "vectordb", label: "Vector DB", type: "database", x: 0.55, y: 0.15 },
        { id: "docs", label: "Company\nDocs", type: "input", x: 0.55, y: 0.65 },
        { id: "prompt", label: "Prompt\nTemplate", type: "process", x: 0.3, y: 0.65 },
        { id: "llm", label: "LLM", type: "process", x: 0.55, y: 0.4 },
        { id: "response", label: "Grounded\nResponse", type: "output", x: 0.82, y: 0.4 },
      ],
      edges: [
        { from: "query", to: "embed" },
        { from: "embed", to: "vectordb" },
        { from: "docs", to: "vectordb", label: "Chunk & Embed" },
        { from: "vectordb", to: "llm", label: "Top-K" },
        { from: "query", to: "prompt" },
        { from: "prompt", to: "llm" },
        { from: "llm", to: "response" },
      ]
    },
    activity: {
      question: "Why do we use Embeddings in a RAG system instead of standard database keyword searches?",
      options: ["Embeddings are smaller in file size than raw text.", "Embeddings capture semantic meaning, allowing searches to find related concepts even if exact keywords don't match.", "Embeddings automatically correct hallucinations in the LLM.", "Embeddings are required to connect an LLM to the internet."],
      correctIndex: 1,
      explanation: "Embeddings map text to a multi-dimensional space based on meaning. A search for 'revenue drop' will accurately retrieve documents mentioning 'financial losses' or 'sales decline'."
    }
  },
  {
    id: 3, phase: "A", title: "Multi-Agent Systems", conceptName: "LangGraph Architectures", icon: "🔗",
    markdownContent: `### Orchestrating Complexity\nWhen building automated workflows that require robust decision-making, a single agent often fails. It gets confused by too many tools or loses focus. **LangGraph** introduces a way to orchestrate multiple agents as nodes in a cyclical graph.\n\nInstead of one monolithic prompt, you divide the work:\n\n- **Nodes:** Represent individual, specialized agents (e.g., a 'Researcher' agent, a 'Coder' agent, a 'Reviewer' agent) or specific Python/Node automated functions.\n- **Edges:** Determine the flow of control.\n- **Conditional Edges:** Act as routers. For example, a Supervisor agent evaluates the input and routes the task to either the Researcher or the Coder.\n- **State:** A shared memory object passed between nodes. Every node reads from and updates this state, ensuring total continuity.`,
    keyTakeaways: ["Multi-agent systems divide work among specialists", "LangGraph models workflows as cyclical graphs", "Conditional edges enable intelligent routing", "Shared state ensures continuity between agents"],
    diagram: {
      nodes: [
        { id: "start", label: "Start", type: "terminal", x: 0.5, y: 0.05 },
        { id: "supervisor", label: "Supervisor", type: "supervisor", x: 0.5, y: 0.28 },
        { id: "researcher", label: "Researcher", type: "agent", x: 0.15, y: 0.55 },
        { id: "coder", label: "Coder", type: "agent", x: 0.5, y: 0.55 },
        { id: "reviewer", label: "Reviewer", type: "agent", x: 0.85, y: 0.55 },
        { id: "end", label: "End", type: "terminal", x: 0.85, y: 0.9 },
      ],
      edges: [
        { from: "start", to: "supervisor" },
        { from: "supervisor", to: "researcher", label: "Data" },
        { from: "supervisor", to: "coder", label: "Code" },
        { from: "researcher", to: "supervisor", label: "State", curved: true },
        { from: "coder", to: "reviewer" },
        { from: "reviewer", to: "coder", label: "Fail", curved: true },
        { from: "reviewer", to: "end", label: "Pass" },
      ]
    },
    activity: {
      question: "In a LangGraph architecture, how do individual specialist agents communicate with each other?",
      options: ["They send emails to each other using an API.", "They read from and update a shared 'State' object that is passed along the graph's edges.", "They merge their context windows together into one massive prompt.", "They don't communicate; the user must manually copy-paste the outputs."],
      correctIndex: 1,
      explanation: "LangGraph relies on a shared State (often a typed dictionary or schema). As execution moves along the edges, each node receives the current State, performs its task, and returns an updated State for the next node."
    }
  },
  {
    id: 4, phase: "A", title: "Agent Basics", conceptName: "Chatbot vs Agent vs Workflow", icon: "🤖",
    markdownContent: `### Three Mental Models\nTo design agentic systems, you must separate three concepts that are often mixed together:\n\n**1) Chatbot** — does Input → LLM → Output. It can be useful, but it has two major limitations: it can only "pretend" to know things it does not know, and it cannot reliably perform multi-step tasks without external structure.\n\n**2) Workflow Automation** — hard-coded steps executed in a fixed order. Workflows are reliable and cheap, but brittle: if user intent changes, the workflow breaks.\n\n**3) Agent** — reasoning + tools + memory + loop. It decides which action to take based on the goal, the current state, and tool outputs.\n\n### Key Idea\nA production system often combines them:\n- Workflow for repetitive parts\n- Agent for flexible decision-making\n- Guardrails for safety and cost control`,
    keyTakeaways: ["Chatbots are reactive, agents are proactive", "Workflows are reliable but brittle", "Agents adapt dynamically via tool observations", "Production systems combine all three patterns"],
    diagram: {
      nodes: [
        { id: "user", label: "User\nRequest", type: "input", x: 0.08, y: 0.45 },
        { id: "chatbot", label: "Chatbot", type: "process", x: 0.38, y: 0.12 },
        { id: "workflow", label: "Workflow", type: "process", x: 0.38, y: 0.45 },
        { id: "agent", label: "Agent", type: "agent", x: 0.38, y: 0.78 },
        { id: "tools", label: "Tools", type: "external", x: 0.68, y: 0.78 },
        { id: "result", label: "Result", type: "output", x: 0.88, y: 0.45 },
      ],
      edges: [
        { from: "user", to: "chatbot" },
        { from: "user", to: "workflow" },
        { from: "user", to: "agent" },
        { from: "chatbot", to: "result" },
        { from: "workflow", to: "result" },
        { from: "agent", to: "tools" },
        { from: "tools", to: "agent", label: "Observe", curved: true },
        { from: "agent", to: "result" },
      ]
    },
    activity: {
      question: "Which statement best describes why agents are useful compared to workflows?",
      options: ["Agents are always cheaper than workflows.", "Agents can decide actions dynamically based on tool observations and changing goals.", "Agents eliminate the need for tools by using bigger models.", "Agents only work when the user writes perfect prompts."],
      correctIndex: 1,
      explanation: "Workflows are fixed. Agents adapt. The agent's loop uses observations from tools to decide the next step, making it effective for ambiguous, multi-step tasks."
    }
  },
  {
    id: 5, phase: "A", title: "Tool Use", conceptName: "Reliable Tool Calling", icon: "🔧",
    markdownContent: `### What "Tool Calling" Really Means\nTool calling is not magic. It is **structured I/O** between the model and external functions.\n\nA reliable tool call requires:\n1. **Clear tool contract:** name, input schema, output schema\n2. **Validation:** reject malformed tool inputs\n3. **Error handling:** timeouts, retries, fallbacks\n4. **Observation discipline:** tool output must be summarized and fed back into the agent loop\n\n### Common Failure Modes\n- The agent calls the wrong tool because tool descriptions are vague\n- The agent passes invalid parameters\n- The agent gets a tool error and panics (or loops)\n- The agent leaks tool output directly without checking correctness\n\n### Best Practice: Tool Routing Layer\nImplement a strict schema, parameter constraints, safe defaults, and explicit tool budgets (max calls).`,
    keyTakeaways: ["Tool calling = structured I/O with validation", "Vague tool descriptions cause wrong tool selection", "Always validate inputs before execution", "Tool budgets prevent runaway costs"],
    diagram: {
      nodes: [
        { id: "agent", label: "Agent\nDecision", type: "process", x: 0.1, y: 0.4 },
        { id: "validate", label: "Validate\nInput", type: "process", x: 0.38, y: 0.4 },
        { id: "tool", label: "Execute\nTool", type: "external", x: 0.65, y: 0.2 },
        { id: "fix", label: "Fix / Ask\nClarify", type: "agent", x: 0.65, y: 0.65 },
        { id: "observe", label: "Observation", type: "process", x: 0.88, y: 0.4 },
      ],
      edges: [
        { from: "agent", to: "validate" },
        { from: "validate", to: "tool", label: "Valid" },
        { from: "validate", to: "fix", label: "Invalid" },
        { from: "tool", to: "observe" },
        { from: "observe", to: "agent", label: "Loop", curved: true },
        { from: "fix", to: "agent", curved: true },
      ]
    },
    activity: {
      question: "What is the safest default behavior when the tool input is invalid?",
      options: ["Execute anyway and hope the tool succeeds.", "Ask the user to rewrite the entire request from scratch.", "Validate and either auto-fix minor issues or ask a targeted clarification question.", "Stop the agent permanently."],
      correctIndex: 2,
      explanation: "Validation prevents unpredictable tool behavior. If the input cannot be safely corrected, ask a precise clarification rather than guessing."
    }
  },
  {
    id: 6, phase: "A", title: "Planning", conceptName: "Plan First, Execute Second", icon: "📋",
    markdownContent: `### Planning is a Control Mechanism\nFor multi-step tasks, you want the agent to:\n- form a plan\n- execute step-by-step\n- update the plan when observations change the situation\n\nPlanning prevents random tool calls, missed steps, contradictory actions, and infinite loops.\n\n### Practical Planning Pattern\n1. **Goal:** restate what success looks like\n2. **Constraints:** time, cost, safety, allowed tools\n3. **Subtasks:** ordered list\n4. **Stop condition:** when to return the final answer\n\n### Key Production Idea: "Plan as State"\nStore the plan in the shared state so it can be inspected, logged, evaluated, and updated deterministically.`,
    keyTakeaways: ["Planning prevents random tool calls and loops", "Plans should define goals, constraints, and stop conditions", "Store plans in state for observability", "Update plans based on observations"],
    diagram: {
      nodes: [
        { id: "goal", label: "Define\nGoal", type: "input", x: 0.05, y: 0.4 },
        { id: "plan", label: "Make\nPlan", type: "process", x: 0.25, y: 0.4 },
        { id: "exec", label: "Execute\nStep", type: "agent", x: 0.48, y: 0.25 },
        { id: "observe", label: "Observe", type: "process", x: 0.7, y: 0.25 },
        { id: "update", label: "Update\nPlan", type: "process", x: 0.7, y: 0.65 },
        { id: "done", label: "Done", type: "terminal", x: 0.48, y: 0.75 },
      ],
      edges: [
        { from: "goal", to: "plan" },
        { from: "plan", to: "exec" },
        { from: "exec", to: "observe" },
        { from: "observe", to: "update" },
        { from: "update", to: "exec", label: "Continue", curved: true },
        { from: "update", to: "done", label: "Goal Met" },
      ]
    },
    activity: {
      question: "Why store the plan in state instead of keeping it hidden inside the prompt?",
      options: ["It increases token usage, which improves reasoning.", "It makes the system observable and debuggable, and allows updates based on tool outputs.", "It prevents users from ever seeing system behavior.", "It makes tools run faster."],
      correctIndex: 1,
      explanation: "Plans in state are inspectable. They support debugging, evaluation, and controlled updates when observations change the situation."
    }
  },
  {
    id: 7, phase: "B", title: "Chunking", conceptName: "How to Split Documents Correctly", icon: "✂️",
    markdownContent: `### Chunking is the #1 Quality Lever\nBad chunking produces bad retrieval, even with perfect embeddings.\n\n**Goals of chunking:**\n- Each chunk should represent a coherent unit of meaning\n- A chunk should be understandable without too much missing context\n- Chunks should be small enough to retrieve precisely, but large enough to carry meaning\n\n### Practical Rules\n- Prefer **semantic chunking** (by headings/sections) over fixed-size splits\n- Keep "atomic concepts" together (do not split definitions mid-way)\n- Add overlap only when necessary (for continuity at boundaries)\n- Attach metadata: source, section, date, doc type, access level\n\n### Advanced: "Hybrid Chunking"\nSplit by section boundaries first, then split long sections by semantic separators. Keep structured data (tables) in dedicated chunks.`,
    keyTakeaways: ["Bad chunking = bad retrieval regardless of model", "Prefer semantic over fixed-size splitting", "Overlap preserves boundary context", "Always attach metadata to chunks"],
    diagram: {
      nodes: [
        { id: "doc", label: "Document", type: "input", x: 0.08, y: 0.4 },
        { id: "sections", label: "Split by\nSections", type: "process", x: 0.3, y: 0.4 },
        { id: "subsplit", label: "Split Long\nSections", type: "process", x: 0.52, y: 0.4 },
        { id: "meta", label: "Attach\nMetadata", type: "process", x: 0.74, y: 0.4 },
        { id: "chunks", label: "Final\nChunks", type: "output", x: 0.92, y: 0.4 },
      ],
      edges: [
        { from: "doc", to: "sections" },
        { from: "sections", to: "subsplit" },
        { from: "subsplit", to: "meta" },
        { from: "meta", to: "chunks" },
      ]
    },
    activity: {
      question: "What is the main purpose of overlap in chunking?",
      options: ["To make the vector database store fewer chunks.", "To ensure boundary content is not lost when concepts span across chunk edges.", "To remove the need for metadata filters.", "To guarantee the LLM never hallucinates."],
      correctIndex: 1,
      explanation: "Overlap helps preserve continuity when important context sits at the boundary between two chunks. It should be used carefully to avoid duplicates."
    }
  },
  {
    id: 8, phase: "B", title: "Embeddings", conceptName: "Meaning as Vectors", icon: "📐",
    markdownContent: `### What Embeddings Actually Do\nAn embedding model converts text into a vector so that similar meanings end up near each other, and search becomes distance-based rather than keyword-based.\n\n### Key Intuition\nIf two phrases mean the same thing, they should be close:\n- "revenue decline"\n- "sales dropped"\n- "financial losses"\n\n### Distance Metrics\n- **Cosine similarity** is the most common for text embeddings\n- The embedding space geometry matters less than consistency: always use the same embedding model for indexing and querying\n\n### Common Mistakes\n- Embedding entire documents (too broad)\n- Embedding tiny fragments (too vague)\n- Changing embedding models without re-indexing`,
    keyTakeaways: ["Embeddings map meaning to vector space", "Similar meanings = nearby vectors", "Use cosine similarity for distance", "Same model for indexing AND querying"],
    diagram: {
      nodes: [
        { id: "query", label: "Query Text", type: "input", x: 0.05, y: 0.25 },
        { id: "chunk", label: "Chunk Text", type: "input", x: 0.05, y: 0.7 },
        { id: "e1", label: "Embed", type: "process", x: 0.35, y: 0.25 },
        { id: "e2", label: "Embed", type: "process", x: 0.35, y: 0.7 },
        { id: "sim", label: "Cosine\nSimilarity", type: "database", x: 0.62, y: 0.47 },
        { id: "results", label: "Top\nMatches", type: "output", x: 0.88, y: 0.47 },
      ],
      edges: [
        { from: "query", to: "e1" },
        { from: "chunk", to: "e2" },
        { from: "e1", to: "sim" },
        { from: "e2", to: "sim" },
        { from: "sim", to: "results" },
      ]
    },
    activity: {
      question: "Why must you re-embed and re-index when you change the embedding model?",
      options: ["Because vector databases only support one model at a time.", "Because distances in embedding space are not comparable across different embedding models.", "Because LLMs refuse to work with old embeddings.", "Because chunking automatically changes."],
      correctIndex: 1,
      explanation: "Embedding spaces differ by model. Similarity scores are only meaningful within the same embedding space used for both query and indexed chunks."
    }
  },
  {
    id: 9, phase: "B", title: "Retrieval", conceptName: "Top-K, Filters, MMR, Hybrid", icon: "🔍",
    markdownContent: `### Retrieval is Not "Just Top-K"\nA strong retriever typically combines:\n- Semantic similarity (embeddings)\n- Keyword scoring (BM25 or similar)\n- Metadata filtering (source, date, category, access)\n- Diversity selection (MMR)\n\n### Top-K Choice\n- Small K: higher precision, risk missing context\n- Large K: higher recall, risk adding noise\n\n### MMR (Max Marginal Relevance)\nMMR reduces duplicates and increases coverage by penalizing near-identical results.\n\n### Hybrid Retrieval\nCombines semantic + keyword to handle exact identifiers, semantic paraphrases, and rare terms.\n\n### Production Approach\n1. Apply metadata filters first\n2. Run hybrid retrieval\n3. Apply MMR\n4. Pass final context to prompt assembler`,
    keyTakeaways: ["Combine semantic, keyword, and metadata retrieval", "MMR reduces duplicates and increases diversity", "Hybrid search handles both exact and semantic matches", "Filter → Retrieve → Diversify → Generate"],
    diagram: {
      nodes: [
        { id: "query", label: "Query", type: "input", x: 0.05, y: 0.4 },
        { id: "filter", label: "Metadata\nFilters", type: "process", x: 0.27, y: 0.4 },
        { id: "hybrid", label: "Hybrid\nRetrieval", type: "agent", x: 0.5, y: 0.4 },
        { id: "mmr", label: "MMR\nDiversify", type: "process", x: 0.72, y: 0.4 },
        { id: "topk", label: "Top-K\nContext", type: "output", x: 0.92, y: 0.4 },
      ],
      edges: [
        { from: "query", to: "filter" },
        { from: "filter", to: "hybrid" },
        { from: "hybrid", to: "mmr" },
        { from: "mmr", to: "topk" },
      ]
    },
    activity: {
      question: "What is the core purpose of MMR in retrieval?",
      options: ["To make embeddings smaller.", "To remove near-duplicate chunks and increase coverage across different aspects.", "To increase hallucinations by adding variety.", "To replace the vector database."],
      correctIndex: 1,
      explanation: "MMR promotes diversity by reducing redundancy. This improves the chance that context covers multiple relevant facets of the question."
    }
  },
  {
    id: 10, phase: "B", title: "Prompt Assembly", conceptName: "Grounded Generation", icon: "🧩",
    markdownContent: `### Prompt Assembly is Where RAG Becomes Reliable\nRAG fails when retrieved text is not inserted correctly.\n\n**A good grounded prompt includes:**\n- Clear role and constraints\n- Instruction to only use provided context\n- Formatting expectations (bullets, steps, citations)\n- "Refuse if missing data" behavior\n\n### Context Packing Rules\n- Keep chunks separated with boundaries\n- Include metadata headers (source, section)\n- Prefer fewer high-quality chunks over many noisy chunks\n- If context conflicts, instruct the model to highlight uncertainty\n\n### Core Reliability Pattern\n- "If the answer is not in the context, say you don't have enough info."\n- "Never invent names, numbers, or policies."`,
    keyTakeaways: ["Prompt assembly makes or breaks RAG quality", "Include role, constraints, and refusal instructions", "Separate chunks with clear boundaries", "Fewer quality chunks > many noisy chunks"],
    diagram: {
      nodes: [
        { id: "chunks", label: "Retrieved\nChunks", type: "input", x: 0.05, y: 0.25 },
        { id: "question", label: "User\nQuestion", type: "input", x: 0.05, y: 0.7 },
        { id: "prompt", label: "Prompt\nTemplate", type: "process", x: 0.38, y: 0.47 },
        { id: "llm", label: "LLM", type: "agent", x: 0.65, y: 0.47 },
        { id: "answer", label: "Answer +\nCitations", type: "output", x: 0.88, y: 0.47 },
      ],
      edges: [
        { from: "chunks", to: "prompt" },
        { from: "question", to: "prompt" },
        { from: "prompt", to: "llm" },
        { from: "llm", to: "answer" },
      ]
    },
    activity: {
      question: "What is the safest instruction when context is insufficient?",
      options: ["Guess based on common sense to keep the user happy.", "Ask for more context or say you don't have enough information in the provided documents.", "Use web browsing even if not allowed.", "Answer with maximum confidence anyway."],
      correctIndex: 1,
      explanation: "Grounded systems must prefer honesty over guessing. When context is insufficient, ask for missing info or clearly state limitations."
    }
  },
  {
    id: 11, phase: "C", title: "RAG Evaluation", conceptName: "Groundedness and Relevance", icon: "📊",
    markdownContent: `### Without Evaluation, You're Guessing\nEvaluation tells you whether changes improved the system or silently broke it.\n\n### Key Metrics\n- **Groundedness (Faithfulness):** every claim supported by retrieved context\n- **Answer Relevance:** does it answer the question asked\n- **Context Precision:** how much retrieved context is actually useful\n- **Context Recall:** did retrieval include all required evidence\n\n### Offline Evaluation\n- Create a small "golden set" of questions with expected evidence\n- Run automated scoring + spot-check manually\n- Compare chunking, retrievers, prompts, and models\n\n### Online Evaluation\nTrack failure categories: missing retrieval, wrong retrieval, good retrieval but bad synthesis, refusal when it should answer.`,
    keyTakeaways: ["Evaluation separates improvement from guessing", "Groundedness = claims supported by context", "Golden sets enable systematic comparison", "Track failure categories for targeted fixes"],
    diagram: {
      nodes: [
        { id: "questions", label: "Eval\nQuestions", type: "input", x: 0.05, y: 0.4 },
        { id: "retriever", label: "Retriever", type: "process", x: 0.25, y: 0.4 },
        { id: "context", label: "Context", type: "process", x: 0.45, y: 0.4 },
        { id: "generator", label: "Generator", type: "agent", x: 0.65, y: 0.4 },
        { id: "scoring", label: "Scoring", type: "database", x: 0.85, y: 0.25 },
        { id: "dashboard", label: "Iterate", type: "output", x: 0.85, y: 0.6 },
      ],
      edges: [
        { from: "questions", to: "retriever" },
        { from: "retriever", to: "context" },
        { from: "context", to: "generator" },
        { from: "generator", to: "scoring" },
        { from: "scoring", to: "dashboard" },
      ]
    },
    activity: {
      question: "Which metric checks whether claims are supported by the retrieved context?",
      options: ["Latency", "Groundedness (Faithfulness)", "Token count", "UI responsiveness"],
      correctIndex: 1,
      explanation: "Groundedness verifies that the answer's claims are supported by retrieved evidence and flags hallucination risk."
    }
  },
  {
    id: 12, phase: "C", title: "Threats", conceptName: "Prompt Injection in RAG", icon: "🛡️",
    markdownContent: `### Prompt Injection is a RAG-Specific Risk\nIf your retriever pulls untrusted text, it may contain instructions like "Ignore previous instructions" or "Reveal system prompt."\n\nThe model can treat retrieved text as authoritative unless you design defenses.\n\n### Defenses\n1. **Instruction hierarchy** — system > developer > user > retrieved content\n2. **Content isolation** — wrap retrieved context in a "quoted data" boundary\n3. **Policy** — never execute instructions found inside retrieved documents\n4. **Filtering** — scan retrieved chunks for injection patterns\n5. **Tool sandboxing** — tools must enforce permissions independent of the model`,
    keyTakeaways: ["Retrieved text can contain malicious instructions", "Instruction hierarchy: system > developer > user > data", "Isolate retrieved content as quoted data", "Never execute instructions from documents"],
    diagram: {
      nodes: [
        { id: "retrieved", label: "Retrieved\nText", type: "input", x: 0.05, y: 0.4 },
        { id: "isolate", label: "Isolate\nas Data", type: "process", x: 0.3, y: 0.4 },
        { id: "policy", label: "Policy:\nIgnore Inst.", type: "agent", x: 0.55, y: 0.4 },
        { id: "llm", label: "LLM", type: "process", x: 0.75, y: 0.4 },
        { id: "safe", label: "Safe\nAnswer", type: "output", x: 0.92, y: 0.4 },
      ],
      edges: [
        { from: "retrieved", to: "isolate" },
        { from: "isolate", to: "policy" },
        { from: "policy", to: "llm" },
        { from: "llm", to: "safe" },
      ]
    },
    activity: {
      question: "What is the safest rule regarding instructions found inside retrieved documents?",
      options: ["Treat them as higher priority than system instructions.", "Treat them as suggestions and execute if they sound reasonable.", "Treat them strictly as untrusted data and never follow them as instructions.", "Only follow them if they contain numbers."],
      correctIndex: 2,
      explanation: "Retrieved text is data, not authority. A secure RAG system must never execute instructions embedded inside documents."
    }
  },
  {
    id: 13, phase: "D", title: "LangGraph Execution", conceptName: "Nodes, Edges, and Control Flow", icon: "⚙️",
    markdownContent: `### Why Graphs Beat Linear Chains\nA chain is fine for predictable tasks. Real work is not predictable.\n\nLangGraph-style graphs give you:\n- **Loops** (retry until success)\n- **Routers** (choose the right specialist)\n- **Checkpoints** (save state)\n- **Partial failure handling** (recover without restarting everything)\n\n### Graph Concepts\n- **Node:** agent or function\n- **Edge:** control transition\n- **Conditional edge:** routing decision based on state\n- **State:** shared memory that all nodes read/write\n\n### Reliability Tip\nKeep state structured and typed: question, plan, retrieved_docs, tool_outputs, draft_answer, evaluation_scores, final_answer.`,
    keyTakeaways: ["Graphs support loops, routing, and checkpoints", "Conditional edges enable dynamic routing", "State should be structured and typed", "Partial failure recovery is a key advantage"],
    diagram: {
      nodes: [
        { id: "start", label: "Start", type: "terminal", x: 0.5, y: 0.05 },
        { id: "sup", label: "Supervisor", type: "supervisor", x: 0.5, y: 0.3 },
        { id: "research", label: "Research", type: "agent", x: 0.15, y: 0.55 },
        { id: "build", label: "Build", type: "agent", x: 0.5, y: 0.55 },
        { id: "eval", label: "Eval", type: "process", x: 0.85, y: 0.55 },
        { id: "end", label: "End", type: "terminal", x: 0.85, y: 0.88 },
      ],
      edges: [
        { from: "start", to: "sup" },
        { from: "sup", to: "research", label: "Research" },
        { from: "sup", to: "build", label: "Build" },
        { from: "research", to: "sup", curved: true },
        { from: "build", to: "eval" },
        { from: "eval", to: "build", label: "Fail", curved: true },
        { from: "eval", to: "end", label: "Pass" },
      ]
    },
    activity: {
      question: "What is the main advantage of conditional edges in a multi-agent graph?",
      options: ["They make the UI darker.", "They allow routing to different nodes based on the current state and needs.", "They increase token usage automatically.", "They remove the need for state."],
      correctIndex: 1,
      explanation: "Conditional edges act as routers. They let the system choose the correct specialist node dynamically based on the task and state."
    }
  },
  {
    id: 14, phase: "D", title: "Agent Reliability", conceptName: "Budgets, Retries, and Stop Conditions", icon: "🔒",
    markdownContent: `### Agents Need Hard Limits\nA powerful agent without limits becomes expensive and unpredictable.\n\n### Must-Have Controls\n- **Tool-call budget:** maximum tool calls per request\n- **Token budget:** cap context growth\n- **Time budget:** timeouts for tools and total run\n- **Retry policy:** limited retries with backoff\n- **Stop conditions:** explicit "done" criteria\n\n### Loop Prevention\nAgents can loop when they never reach "done," tool outputs are ambiguous, or the prompt does not define stop conditions.\n\n### Practical Pattern\nSupervisor node checks: have we satisfied the question, do we have enough evidence, are we within budget. If not, route to the next action.`,
    keyTakeaways: ["Hard limits prevent runaway cost and time", "Budget: tool calls, tokens, and time", "Explicit stop conditions prevent loops", "Supervisor pattern enforces constraints"],
    diagram: {
      nodes: [
        { id: "start", label: "Start", type: "terminal", x: 0.05, y: 0.4 },
        { id: "sup", label: "Supervisor", type: "supervisor", x: 0.28, y: 0.4 },
        { id: "act", label: "Act", type: "agent", x: 0.52, y: 0.2 },
        { id: "observe", label: "Observe", type: "process", x: 0.75, y: 0.2 },
        { id: "done", label: "Done", type: "terminal", x: 0.52, y: 0.7 },
        { id: "exit", label: "Safe\nExit", type: "output", x: 0.75, y: 0.7 },
      ],
      edges: [
        { from: "start", to: "sup" },
        { from: "sup", to: "act", label: "Budget OK" },
        { from: "act", to: "observe" },
        { from: "observe", to: "sup", curved: true },
        { from: "sup", to: "done", label: "Goal Met" },
        { from: "sup", to: "exit", label: "Over Budget" },
      ]
    },
    activity: {
      question: "What is the best first defense against infinite tool loops?",
      options: ["Use a bigger model.", "Remove all tools.", "Define a tool-call budget and explicit stop conditions.", "Hide the sidebar."],
      correctIndex: 2,
      explanation: "Budgets and stop conditions are the simplest and strongest controls. Bigger models do not guarantee non-looping behavior."
    }
  },
  {
    id: 15, phase: "E", title: "Productionization", conceptName: "Observability and Testing", icon: "🚀",
    markdownContent: `### Production Agentic Systems Need Observability\nIf you cannot inspect behavior, you cannot improve it.\n\n### What to Log\n- Tool calls (inputs, outputs, latency)\n- Retrieved chunk IDs and scores\n- State snapshots per node\n- Budget usage\n- Refusal reasons and fallback paths\n\n### Testing Layers\n1. **Unit tests** for tools and parsers\n2. **Retrieval tests** for known queries\n3. **RAG eval tests** for groundedness and relevance\n4. **End-to-end tests** for common user journeys\n\n### Practical Outcome\nWhen a user reports "wrong answer," you can pinpoint: retrieval failure vs generation failure, prompt assembly failure, or tool failure.`,
    keyTakeaways: ["Log everything: tools, retrieval, state, budgets", "4 testing layers: unit, retrieval, RAG eval, E2E", "Observability enables root-cause diagnosis", "Distinguish retrieval vs generation failures"],
    diagram: {
      nodes: [
        { id: "req", label: "Request", type: "input", x: 0.05, y: 0.3 },
        { id: "trace", label: "Trace +\nLogs", type: "process", x: 0.28, y: 0.3 },
        { id: "tools", label: "Tool\nLogs", type: "external", x: 0.52, y: 0.12 },
        { id: "ret", label: "Retrieval\nLogs", type: "database", x: 0.52, y: 0.45 },
        { id: "state", label: "State\nSnapshots", type: "process", x: 0.52, y: 0.78 },
        { id: "debug", label: "Debug", type: "agent", x: 0.78, y: 0.45 },
        { id: "better", label: "Better\nSystem", type: "output", x: 0.92, y: 0.45 },
      ],
      edges: [
        { from: "req", to: "trace" },
        { from: "trace", to: "tools" },
        { from: "trace", to: "ret" },
        { from: "trace", to: "state" },
        { from: "tools", to: "debug" },
        { from: "ret", to: "debug" },
        { from: "state", to: "debug" },
        { from: "debug", to: "better" },
      ]
    },
    activity: {
      question: "If a user gets a wrong answer, what is the first question a production team should ask?",
      options: ["Did the UI animation feel smooth?", "Was the answer grounded in the retrieved context, or was retrieval missing/wrong?", "Was the background color correct?", "Did the user type too fast?"],
      correctIndex: 1,
      explanation: "Diagnose first: retrieval vs generation. If retrieval is wrong or missing, fix retrieval/chunking. If retrieval is correct, fix prompt and synthesis."
    }
  },
];

/* ═══════════════════════════════════════════════════════════════════════════
   STATE PERSISTENCE — FIX: removed localStorage, use React state only
   ═══════════════════════════════════════════════════════════════════════════ */
const defaultState = { step: 0, completed: [], xp: 0, answers: {}, streak: 0, maxStreak: 0, started: Date.now() };

/* ═══════════════════════════════════════════════════════════════════════════
   STORAGE HELPERS — using window.storage API
   ═══════════════════════════════════════════════════════════════════════════ */
const STORE_KEY = "agentic-ai-nav-v3";

async function loadFromStorage() {
  try {
    const result = await window.storage.get(STORE_KEY);
    if (result && result.value) {
      return { ...defaultState, ...JSON.parse(result.value) };
    }
  } catch {
    // key doesn't exist yet
  }
  return { ...defaultState };
}

async function saveToStorage(s) {
  try {
    await window.storage.set(STORE_KEY, JSON.stringify(s));
  } catch {
    // storage unavailable
  }
}

/* ═══════════════════════════════════════════════════════════════════════════
   TOAST SYSTEM
   ═══════════════════════════════════════════════════════════════════════════ */
const ToastCtx = createContext({ show: () => {} });

function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const show = useCallback((msg, type = "info") => {
    const id = Date.now() + Math.random();
    setToasts(p => [...p, { id, msg, type }]);
    setTimeout(() => setToasts(p => p.filter(t => t.id !== id)), 3200);
  }, []);
  const colors = { info: "#0891b2", success: "#16a34a", warn: "#d97706", error: "#dc2626" };
  return (
    <ToastCtx.Provider value={{ show }}>
      {children}
      <div style={{ position: "fixed", bottom: "max(20px, env(safe-area-inset-bottom, 20px))", right: 20, zIndex: 200, display: "flex", flexDirection: "column", gap: 8 }}>
        {toasts.map(t => (
          <div key={t.id} role="alert" aria-live="polite" style={{
            padding: "10px 18px", borderRadius: 10, fontSize: 13, fontWeight: 500, color: "#f0fdfa",
            background: `linear-gradient(135deg, ${colors[t.type]}dd, ${colors[t.type]}88)`,
            backdropFilter: "blur(12px)", WebkitBackdropFilter: "blur(12px)",
            border: `1px solid ${colors[t.type]}55`,
            animation: "toast-in 0.35s ease forwards", maxWidth: 320,
            fontFamily: "'Instrument Sans', -apple-system, BlinkMacSystemFont, sans-serif"
          }}>{t.msg}</div>
        ))}
      </div>
    </ToastCtx.Provider>
  );
}

const useToast = () => useContext(ToastCtx);

/* ═══════════════════════════════════════════════════════════════════════════
   CSS VARIABLES & RESPONSIVE BREAKPOINTS
   ═══════════════════════════════════════════════════════════════════════════ */
const CSS_VARS = `
  :root {
    --bg-primary: #020617;
    --bg-card: #0f172a;
    --bg-elevated: rgba(30,41,59,0.5);
    --border-subtle: rgba(51,65,85,0.25);
    --border-accent: rgba(94,234,212,0.2);
    --text-primary: #e2e8f0;
    --text-secondary: #94a3b8;
    --text-muted: #475569;
    --text-accent: #5eead4;
    --accent: #14b8a6;
    --font-body: 'Instrument Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
    --font-mono: 'JetBrains Mono', 'SF Mono', 'Cascadia Code', monospace;
    --safe-top: env(safe-area-inset-top, 0px);
    --safe-bottom: env(safe-area-inset-bottom, 0px);
    --safe-left: env(safe-area-inset-left, 0px);
    --safe-right: env(safe-area-inset-right, 0px);
    --sidebar-w: 295px;
    --header-h: 68px;
    --content-max: 760px;
  }
`;

/* ═══════════════════════════════════════════════════════════════════════════
   SVG DIAGRAM — FIX: Pure SVG, no d3 dependency, memoized, responsive
   ═══════════════════════════════════════════════════════════════════════════ */
const Diagram = memo(function Diagram({ data, stepId }) {
  const boxRef = useRef(null);
  const [dims, setDims] = useState({ w: 680, h: 280 });

  useEffect(() => {
    if (!boxRef.current) return;
    const update = () => {
      if (!boxRef.current) return;
      const w = boxRef.current.clientWidth - 12; // minus padding
      // Taller ratio on narrow screens so nodes have vertical room
      const ratio = w < 400 ? 0.62 : w < 550 ? 0.52 : 0.47;
      const h = Math.max(220, Math.min(360, w * ratio));
      setDims({ w, h });
    };
    update();
    const ro = new ResizeObserver(update);
    ro.observe(boxRef.current);
    return () => ro.disconnect();
  }, []);

  const { w: W, h: H } = dims;
  const pad = W < 400 ? 10 : 16;
  // Scale nodes based on available width
  const NW = W < 400 ? Math.max(62, W * 0.15) : Math.min(100, W * 0.14);
  const NH = W < 400 ? Math.max(36, H * 0.13) : Math.min(46, H * 0.16);
  const fontSize = W < 400 ? Math.max(7, NW * 0.11) : Math.max(8, NW * 0.1);
  const labelSize = W < 400 ? 7 : Math.max(8, NW * 0.09);

  const nodeColors = {
    terminal: { bg: "#0f172a", border: "#475569", text: "#cbd5e1" },
    process: { bg: "#042f2e", border: "#14b8a6", text: "#5eead4" },
    external: { bg: "#1e1b4b", border: "#818cf8", text: "#a5b4fc" },
    input: { bg: "#172554", border: "#3b82f6", text: "#93c5fd" },
    output: { bg: "#052e16", border: "#22c55e", text: "#86efac" },
    database: { bg: "#3b0764", border: "#a855f7", text: "#d8b4fe" },
    supervisor: { bg: "#431407", border: "#f97316", text: "#fdba74" },
    agent: { bg: "#042f2e", border: "#0d9488", text: "#5eead4" },
  };

  const nm = useMemo(() => {
    const map = {};
    data.nodes.forEach(n => {
      map[n.id] = {
        ...n,
        px: pad + n.x * (W - 2 * pad - NW),
        py: pad + n.y * (H - 2 * pad - NH),
      };
    });
    return map;
  }, [data.nodes, W, H, NW, NH, pad]);

  const edgePaths = useMemo(() => {
    return data.edges.map((e) => {
      const f = nm[e.from], t = nm[e.to];
      if (!f || !t) return null;
      const fx = f.px + NW / 2, fy = f.py + NH / 2;
      const tx = t.px + NW / 2, ty = t.py + NH / 2;
      const a = Math.atan2(ty - fy, tx - fx);
      const sx = fx + Math.cos(a) * NW * 0.52;
      const sy = fy + Math.sin(a) * NH * 0.55;
      const ex = tx - Math.cos(a) * NW * 0.55;
      const ey = ty - Math.sin(a) * NH * 0.6;
      let d, lx, ly;
      if (e.curved) {
        const mx = (sx + ex) / 2 - (ey - sy) * 0.3;
        const my = (sy + ey) / 2 + (ex - sx) * 0.3;
        d = `M${sx},${sy} Q${mx},${my} ${ex},${ey}`;
        lx = (sx + ex) / 2 - (ey - sy) * 0.15;
        ly = (sy + ey) / 2 + (ex - sx) * 0.15 - 6;
      } else {
        d = `M${sx},${sy} L${ex},${ey}`;
        lx = (sx + ex) / 2;
        ly = (sy + ey) / 2 - 8;
      }
      return { ...e, d, lx, ly, color: e.curved ? "#f59e0b" : "#5eead4" };
    }).filter(Boolean);
  }, [data.edges, nm, NW, NH]);

  return (
    <div ref={boxRef} role="img" aria-label={`Architecture diagram for module ${stepId}`} style={{
      borderRadius: 12, overflow: "hidden", padding: 6,
      border: "1px solid var(--border-accent)",
      background: "linear-gradient(145deg, rgba(2,6,23,0.95), rgba(15,23,42,0.9))",
      position: "relative", width: "100%"
    }}>
      <svg viewBox={`0 0 ${W} ${H}`} width="100%" style={{ display: "block", maxHeight: H }}
        preserveAspectRatio="xMidYMid meet">
        <defs>
          <filter id={`glow-${stepId}`} x="-40%" y="-40%" width="180%" height="180%">
            <feGaussianBlur stdDeviation="4" result="b" />
            <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
          <marker id={`arrow-${stepId}`} viewBox="0 0 10 10" refX="9" refY="5"
            markerWidth="7" markerHeight="7" orient="auto-start-reverse">
            <path d="M0 0L10 5L0 10z" fill="#5eead4" />
          </marker>
          <marker id={`arrow-curved-${stepId}`} viewBox="0 0 10 10" refX="9" refY="5"
            markerWidth="7" markerHeight="7" orient="auto-start-reverse">
            <path d="M0 0L10 5L0 10z" fill="#f59e0b" />
          </marker>
        </defs>

        {/* Edges */}
        {edgePaths.map((ep, i) => (
          <g key={`edge-${i}`}>
            <path d={ep.d} fill="none" stroke={ep.color} strokeWidth={1.5} opacity={0.6}
              markerEnd={`url(#${ep.curved ? `arrow-curved-${stepId}` : `arrow-${stepId}`})`}
              style={{ animation: `dash-in 0.5s ease ${0.2 + i * 0.08}s both` }}
            />
            {ep.label && (
              <text x={ep.lx} y={ep.ly} textAnchor="middle" fill="#64748b"
                fontSize={labelSize} fontFamily="var(--font-mono)"
                style={{ animation: `fade-in 0.3s ease ${0.4 + i * 0.08}s both` }}>
                {ep.label}
              </text>
            )}
          </g>
        ))}

        {/* Nodes */}
        {Object.values(nm).map((n, i) => {
          const c = nodeColors[n.type] || nodeColors.process;
          const lines = n.label.split("\n");
          const lineH = W < 400 ? 11 : 13;
          const startY = NH / 2 - (lines.length - 1) * (lineH / 2);
          return (
            <g key={n.id} transform={`translate(${n.px},${n.py})`}
              style={{ animation: `fade-in 0.35s ease ${i * 0.06}s both` }}>
              {n.type === "terminal" ? (
                <ellipse cx={NW / 2} cy={NH / 2} rx={NW / 2} ry={NH / 2}
                  fill={c.bg} stroke={c.border} strokeWidth={1.5} />
              ) : (
                <rect width={NW} height={NH} rx={8}
                  fill={c.bg} stroke={c.border} strokeWidth={1.5}
                  filter={`url(#glow-${stepId})`} />
              )}
              {lines.map((l, li) => (
                <text key={li} x={NW / 2} y={startY + li * (W < 400 ? 11 : 13)}
                  textAnchor="middle" dominantBaseline="middle"
                  fill={c.text} fontSize={fontSize}
                  fontFamily="var(--font-mono)" fontWeight={600}>
                  {l}
                </text>
              ))}
            </g>
          );
        })}
      </svg>
    </div>
  );
});

/* ═══════════════════════════════════════════════════════════════════════════
   MARKDOWN — Memoized
   ═══════════════════════════════════════════════════════════════════════════ */
const Md = memo(function Md({ text }) {
  const html = useMemo(() => {
    let s = text.trim();
    s = s.replace(/^### (.+)$/gm, '<h3 class="md-h3">$1</h3>');
    s = s.replace(/^#### (.+)$/gm, '<h4 class="md-h4">$1</h4>');
    s = s.replace(/\*\*(.+?)\*\*/g, '<strong class="md-bold">$1</strong>');
    s = s.replace(/\*(.+?)\*/g, '<em class="md-em">$1</em>');
    s = s.replace(/`(.+?)`/g, '<code class="md-code">$1</code>');
    s = s.replace(/^(\d+)\.\s+(.+)$/gm, (_, n, t) =>
      `<div class="md-ol"><span class="md-ol-num">${n}</span><span class="md-ol-text">${t}</span></div>`
    );
    s = s.replace(/^[-*]\s+(.+)$/gm,
      `<div class="md-ul"><span class="md-ul-dot"></span><span class="md-ul-text">$1</span></div>`
    );
    s = s.replace(/\n{2,}/g, '</p><p class="md-p">');
    return `<p class="md-p">${s}</p>`;
  }, [text]);
  return <div dangerouslySetInnerHTML={{ __html: html }} />;
});

/* ═══════════════════════════════════════════════════════════════════════════
   QUIZ — Memoized, accessible
   ═══════════════════════════════════════════════════════════════════════════ */
const Quiz = memo(function Quiz({ act, stepId, savedAns, onAnswer }) {
  const letters = ["A", "B", "C", "D"];

  // Deterministic shuffle based on stepId — consistent per module, varies between modules
  const { shuffledOptions, shuffledCorrectIndex, originalIndexMap } = useMemo(() => {
    // Create index array [0,1,2,3] then shuffle deterministically using stepId as seed
    const indices = act.options.map((_, i) => i);
    // Simple seeded shuffle (Fisher-Yates with seed)
    let seed = stepId * 2654435761; // hash-like multiplier
    const seededRandom = () => {
      seed = (seed * 16807 + 0) % 2147483647;
      return (seed - 1) / 2147483646;
    };
    for (let i = indices.length - 1; i > 0; i--) {
      const j = Math.floor(seededRandom() * (i + 1));
      [indices[i], indices[j]] = [indices[j], indices[i]];
    }
    // indices now maps display position → original index
    // e.g. indices = [2, 0, 3, 1] means display[0] shows original option 2
    const shuffled = indices.map(i => act.options[i]);
    const newCorrect = indices.indexOf(act.correctIndex);
    // originalIndexMap: display index → original index
    return { shuffledOptions: shuffled, shuffledCorrectIndex: newCorrect, originalIndexMap: indices };
  }, [act.options, act.correctIndex, stepId]);

  // savedAns is stored as the ORIGINAL correctIndex, convert to shuffled index for display
  const savedShuffledAns = savedAns != null ? originalIndexMap.indexOf(savedAns) : null;
  // But we only saved when correct, so savedShuffledAns should equal shuffledCorrectIndex if saved

  const [sel, setSel] = useState(savedShuffledAns);
  const [show, setShow] = useState(savedAns != null);
  const [shake, setShake] = useState(null);
  const ok = sel === shuffledCorrectIndex;

  useEffect(() => {
    setSel(savedAns != null ? originalIndexMap.indexOf(savedAns) : null);
    setShow(savedAns != null);
  }, [stepId, savedAns, originalIndexMap]);

  const pick = useCallback((displayIdx) => {
    if (show) return;
    setSel(displayIdx);
    if (displayIdx === shuffledCorrectIndex) {
      setShow(true);
      // Pass the ORIGINAL correctIndex back to parent
      onAnswer(act.correctIndex);
    } else {
      setShake(displayIdx);
      setTimeout(() => setShake(null), 500);
    }
  }, [show, shuffledCorrectIndex, onAnswer, act.correctIndex]);

  return (
    <div style={{ marginTop: 28 }} role="region" aria-label="Knowledge check quiz">
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
        <span style={{ width: 28, height: 28, borderRadius: 7, background: "linear-gradient(135deg,#0d9488,#0891b2)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14 }} aria-hidden="true">🎯</span>
        <h4 style={{ fontSize: "1rem", fontWeight: 700, color: "var(--text-primary)", margin: 0 }}>Knowledge Check</h4>
      </div>
      <p style={{ color: "#cbd5e1", fontSize: "0.9rem", lineHeight: 1.55, marginBottom: 14 }}>{act.question}</p>
      <div style={{ display: "flex", flexDirection: "column", gap: 6 }} role="radiogroup" aria-label="Answer options">
        {shuffledOptions.map((o, i) => {
          const isCorrect = show && i === shuffledCorrectIndex;
          const isWrong = show && sel === i && !ok;
          const isShaking = shake === i;
          let bg = "var(--bg-elevated)", brd = "var(--border-subtle)", tc = "var(--text-secondary)";
          if (isCorrect) { bg = "rgba(22,163,74,0.12)"; brd = "rgba(34,197,94,0.45)"; tc = "#86efac"; }
          else if (isWrong) { bg = "rgba(220,38,38,0.1)"; brd = "rgba(239,68,68,0.35)"; tc = "#fca5a5"; }
          return (
            <button key={i} onClick={() => pick(i)}
              role="radio" aria-checked={sel === i}
              aria-label={`Option ${letters[i]}: ${o}`}
              disabled={show}
              style={{
                display: "flex", alignItems: "center", gap: 10, padding: "10px 14px",
                background: bg, border: `1px solid ${brd}`, borderRadius: 9,
                cursor: show ? "default" : "pointer",
                textAlign: "left", fontFamily: "inherit", transition: "all 0.2s",
                animation: isShaking ? "shake 0.4s ease" : "none",
                WebkitTapHighlightColor: "transparent",
                touchAction: "manipulation",
                opacity: show && !isCorrect && !isWrong ? 0.5 : 1,
              }}>
              <span style={{
                minWidth: 26, height: 26, borderRadius: 6, display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 11, fontWeight: 700, color: "#f0fdfa", flexShrink: 0,
                background: isCorrect ? "linear-gradient(135deg,#16a34a,#22c55e)" : isWrong ? "#dc2626" : "rgba(51,65,85,0.5)",
                fontFamily: "var(--font-mono)"
              }}>{isCorrect ? "✓" : isWrong ? "✗" : letters[i]}</span>
              <span style={{ color: tc, fontSize: "0.87rem", lineHeight: 1.45 }}>{o}</span>
            </button>
          );
        })}
      </div>
      {show && (
        <div style={{
          marginTop: 14, padding: 14, borderRadius: 9,
          background: ok ? "rgba(22,163,74,0.08)" : "rgba(220,38,38,0.06)",
          border: ok ? "1px solid rgba(34,197,94,0.25)" : "1px solid rgba(239,68,68,0.2)"
        }} role="alert">
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 6 }}>
            <span style={{ fontSize: 16 }} aria-hidden="true">{ok ? "🎉" : "💡"}</span>
            <strong style={{ color: ok ? "#86efac" : "#fca5a5", fontSize: "0.85rem" }}>{ok ? "Correct! +50 XP" : "Review the explanation:"}</strong>
          </div>
          <p style={{ color: "var(--text-secondary)", fontSize: "0.84rem", lineHeight: 1.55, margin: 0 }}>{act.explanation}</p>
        </div>
      )}
    </div>
  );
});

/* ═══════════════════════════════════════════════════════════════════════════
   SIDEBAR ITEM — Extracted for clarity
   ═══════════════════════════════════════════════════════════════════════════ */
const SidebarItem = memo(function SidebarItem({ s, idx, active, done, unlocked, phColor, onClick }) {
  return (
    <button onClick={onClick}
      aria-label={`Module ${s.id}: ${s.title}${done ? " (completed)" : ""}${!unlocked ? " (locked)" : ""}`}
      aria-current={active ? "step" : undefined}
      disabled={!unlocked}
      style={{
        display: "flex", alignItems: "center", gap: 10, width: "100%", padding: "8px 10px",
        marginBottom: 2, borderRadius: 8, border: "none",
        cursor: unlocked ? "pointer" : "not-allowed",
        textAlign: "left", fontFamily: "inherit", opacity: unlocked ? 1 : 0.4,
        background: active ? "rgba(20,184,166,0.08)" : "transparent",
        transition: "background 0.15s", WebkitTapHighlightColor: "transparent",
    }}>
      <div style={{
        width: 30, height: 30, borderRadius: 8, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: done ? 12 : unlocked ? 13 : 11,
        background: done ? `linear-gradient(135deg, ${phColor}cc, ${phColor}88)` : active ? "rgba(20,184,166,0.15)" : "rgba(30,41,59,0.4)",
        border: active ? "1px solid rgba(20,184,166,0.4)" : "1px solid rgba(51,65,85,0.2)",
        color: "#f0fdfa"
      }}>{done ? "✓" : unlocked ? s.icon : "🔒"}</div>
      <div style={{ minWidth: 0, overflow: "hidden" }}>
        <div style={{ fontSize: 12, fontWeight: active ? 600 : 500, color: active ? "var(--text-accent)" : unlocked ? "#cbd5e1" : "var(--text-muted)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{s.title}</div>
        <div style={{ fontSize: 10, color: "var(--text-muted)", fontFamily: "var(--font-mono)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{s.conceptName}</div>
      </div>
    </button>
  );
});

/* ═══════════════════════════════════════════════════════════════════════════
   MAIN APP — FIX: useEffect dependencies, stable callbacks, responsive
   ═══════════════════════════════════════════════════════════════════════════ */
function AppCore() {
  const [prog, setProg] = useState(defaultState);
  const [loading, setLoading] = useState(true);
  const [sidebar, setSidebar] = useState(false);
  const [confetti, setConfetti] = useState(false);
  const [modal, setModal] = useState(false);
  const contentRef = useRef(null);
  const toast = useToast();
  const mountedRef = useRef(false);

  const curStep = steps[prog.step] || steps[0];
  const totalXP = steps.length * 50;
  const canNext = prog.answers[curStep.id] === curStep.activity.correctIndex;
  const phaseMeta = phases.find(p => p.id === curStep.phase);
  const completePct = (prog.completed.length / steps.length) * 100;
  const allDone = prog.completed.length === steps.length;

  // Load saved state on mount
  useEffect(() => {
    let cancelled = false;
    loadFromStorage().then(saved => {
      if (cancelled) return;
      setProg(saved);
      setLoading(false);
      if (saved.step > 0) {
        // Defer toast slightly
        setTimeout(() => {
          toast.show(`Welcome back — resuming Module ${saved.step + 1}`, "info");
        }, 300);
      }
      mountedRef.current = true;
    });
    return () => { cancelled = true; };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Save state changes (debounced)
  const saveTimerRef = useRef(null);
  useEffect(() => {
    if (!mountedRef.current) return;
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(() => {
      saveToStorage(prog);
    }, 300);
    return () => { if (saveTimerRef.current) clearTimeout(saveTimerRef.current); };
  }, [prog]);

  // Scroll to top on step change
  useEffect(() => {
    contentRef.current?.scrollTo({ top: 0, behavior: "smooth" });
  }, [prog.step]);

  // Keyboard shortcuts — stable ref-based handler
  const progRef = useRef(prog);
  progRef.current = prog;
  const canNextRef = useRef(canNext);
  canNextRef.current = canNext;

  useEffect(() => {
    const handler = (e) => {
      if (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA" || e.target.tagName === "BUTTON") return;
      const p = progRef.current;
      if ((e.key === "n" || e.key === "N") && canNextRef.current && p.step < steps.length - 1) {
        setProg(prev => ({ ...prev, step: prev.step + 1 }));
      }
      if ((e.key === "p" || e.key === "P") && p.step > 0) {
        setProg(prev => ({ ...prev, step: prev.step - 1 }));
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  const isUnlocked = useCallback((idx) => idx === 0 || prog.completed.includes(steps[idx - 1]?.id), [prog.completed]);

  const handleAnswer = useCallback((ans) => {
    setProg(prev => {
      const currentStep = steps[prev.step] || steps[0];
      const ok = ans === currentStep.activity.correctIndex;
      const already = prev.answers[currentStep.id] != null;
      const newXP = ok && !already ? prev.xp + 50 : prev.xp;
      const newCompleted = ok && !prev.completed.includes(currentStep.id) ? [...prev.completed, currentStep.id] : prev.completed;
      const newStreak = ok && !already ? prev.streak + 1 : ok ? prev.streak : 0;
      const newMax = Math.max(newStreak, prev.maxStreak);
      if (ok && !already) setConfetti(true);
      return { ...prev, answers: { ...prev.answers, [currentStep.id]: ans }, xp: newXP, completed: newCompleted, streak: newStreak, maxStreak: newMax };
    });
  }, []);

  useEffect(() => {
    if (confetti) {
      const t = setTimeout(() => setConfetti(false), 2200);
      return () => clearTimeout(t);
    }
  }, [confetti]);

  const goStep = useCallback((idx) => {
    if (idx < 0 || idx >= steps.length) return;
    const unlocked = idx === 0 || prog.completed.includes(steps[idx - 1]?.id);
    if (!unlocked) {
      toast.show("Complete the previous module to unlock.", "warn");
      return;
    }
    setProg(p => ({ ...p, step: idx }));
    setSidebar(false);
  }, [prog.completed, toast]);

  const goNext = useCallback(() => {
    setProg(p => p.step < steps.length - 1 ? { ...p, step: p.step + 1 } : p);
  }, []);

  const goPrev = useCallback(() => {
    setProg(p => p.step > 0 ? { ...p, step: p.step - 1 } : p);
  }, []);

  const resetAll = useCallback(() => {
    const fresh = { ...defaultState, started: Date.now() };
    setProg(fresh);
    setModal(false);
    saveToStorage(fresh);
    toast.show("Progress reset. Starting fresh!", "info");
  }, [toast]);

  // Loading skeleton
  if (loading) {
    return (
      <div style={{
        height: "100dvh", width: "100%", background: "var(--bg-primary)", display: "flex",
        alignItems: "center", justifyContent: "center", fontFamily: "var(--font-body)"
      }}>
        <style>{CSS_VARS}{GLOBAL_STYLES}</style>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: 32, marginBottom: 12, animation: "pulse 1.5s ease-in-out infinite" }}>⚡</div>
          <div style={{ color: "var(--text-accent)", fontFamily: "var(--font-mono)", fontSize: 13, fontWeight: 600 }}>Loading curriculum...</div>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      height: "100dvh", width: "100%",
      background: "var(--bg-primary)", color: "var(--text-primary)",
      fontFamily: "var(--font-body)", display: "flex", flexDirection: "column",
      position: "relative",
    }}>
      <style>{CSS_VARS}{GLOBAL_STYLES}</style>

      {/* Confetti */}
      {confetti && <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 200 }} aria-hidden="true">
        {Array.from({ length: 40 }).map((_, i) => <div key={i} style={{
          position: "absolute", top: -8, left: `${Math.random() * 100}%`,
          width: `${5 + Math.random() * 7}px`, height: `${5 + Math.random() * 7}px`,
          borderRadius: Math.random() > 0.5 ? "50%" : "2px",
          background: ["#5eead4", "#3b82f6", "#a855f7", "#f59e0b", "#ec4899", "#22c55e"][i % 6],
          animation: `confetti-drop ${1.2 + Math.random() * 1.5}s ease-in ${Math.random() * 0.4}s forwards`
        }} />)}
      </div>}

      {/* Ambient glow */}
      <div aria-hidden="true" style={{
        position: "fixed", top: "-15%", right: "-8%", width: "clamp(200px, 40vw, 500px)",
        height: "clamp(200px, 40vw, 500px)", borderRadius: "50%",
        background: `radial-gradient(circle, ${phaseMeta?.color || "#14b8a6"}08, transparent 70%)`,
        pointerEvents: "none", transition: "background 0.8s"
      }} />

      {/* Reset Modal */}
      {modal && (
        <div style={{ position: "fixed", inset: 0, zIndex: 150, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(0,0,0,0.6)", backdropFilter: "blur(6px)", WebkitBackdropFilter: "blur(6px)", padding: 16 }}
          role="dialog" aria-modal="true" aria-label="Reset progress confirmation"
          onClick={(e) => { if (e.target === e.currentTarget) setModal(false); }}>
          <div style={{ background: "var(--bg-card)", border: "1px solid var(--border-subtle)", borderRadius: 14, padding: 28, maxWidth: 380, width: "100%", textAlign: "center" }}>
            <div style={{ fontSize: 32, marginBottom: 12 }} aria-hidden="true">⚠️</div>
            <h3 style={{ fontSize: "1.1rem", fontWeight: 700, color: "var(--text-primary)", marginBottom: 8 }}>Reset Progress?</h3>
            <p style={{ color: "var(--text-secondary)", fontSize: "0.88rem", lineHeight: 1.5, marginBottom: 20 }}>This will clear all your progress, XP, and quiz answers. This action cannot be undone.</p>
            <div style={{ display: "flex", gap: 10, justifyContent: "center" }}>
              <button onClick={() => setModal(false)} style={{ padding: "8px 20px", borderRadius: 8, background: "var(--bg-elevated)", border: "1px solid var(--border-subtle)", color: "var(--text-secondary)", cursor: "pointer", fontSize: 13, fontFamily: "inherit", touchAction: "manipulation" }}>Cancel</button>
              <button onClick={resetAll} style={{ padding: "8px 20px", borderRadius: 8, background: "linear-gradient(135deg, #dc2626, #b91c1c)", border: "none", color: "#fef2f2", cursor: "pointer", fontSize: 13, fontWeight: 600, fontFamily: "inherit", touchAction: "manipulation" }}>Reset Everything</button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <header style={{
        position: "sticky", top: 0, zIndex: 50,
        background: "rgba(2,6,23,0.88)", backdropFilter: "blur(14px)", WebkitBackdropFilter: "blur(14px)",
        borderBottom: "1px solid var(--border-subtle)",
        paddingTop: "var(--safe-top)",
      }} role="banner">
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "10px 16px" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8, gap: 8 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 0 }}>
              <button onClick={() => setSidebar(!sidebar)}
                aria-label={sidebar ? "Close navigation" : "Open navigation"}
                aria-expanded={sidebar}
                style={{ background: "var(--bg-elevated)", border: "1px solid var(--border-subtle)", borderRadius: 7, padding: "5px 9px", cursor: "pointer", color: "var(--text-secondary)", fontSize: 16, flexShrink: 0, touchAction: "manipulation", WebkitTapHighlightColor: "transparent" }}>☰</button>
              <div style={{ minWidth: 0 }}>
                <div style={{ fontFamily: "var(--font-mono)", fontSize: "clamp(9px, 2vw, 10px)", color: "var(--text-accent)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.1em" }}>Agentic AI Navigator</div>
                <div style={{ fontSize: "clamp(10px, 2.5vw, 12px)", color: "var(--text-muted)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>Module {curStep.id} of {steps.length} · Phase {curStep.phase}</div>
              </div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
              {prog.streak >= 3 && <div className="hide-mobile" style={{ padding: "3px 10px", borderRadius: 16, background: "rgba(245,158,11,0.1)", border: "1px solid rgba(245,158,11,0.25)", fontSize: 11, fontWeight: 600, color: "#fbbf24", fontFamily: "var(--font-mono)", whiteSpace: "nowrap" }}>🔥 {prog.streak}</div>}
              <div style={{ display: "flex", alignItems: "center", gap: 6, minWidth: "clamp(80px, 20vw, 140px)" }}>
                <span style={{ fontSize: 12 }} aria-hidden="true">⚡</span>
                <div style={{ flex: 1, height: 6, borderRadius: 3, background: "rgba(30,41,59,0.7)", overflow: "hidden" }}
                  role="progressbar" aria-valuenow={prog.xp} aria-valuemin={0} aria-valuemax={totalXP} aria-label="Experience points">
                  <div style={{ height: "100%", borderRadius: 3, transition: "width 0.5s cubic-bezier(0.4,0,0.2,1)", background: "linear-gradient(90deg,#0d9488,#06b6d4,#3b82f6)", width: `${Math.min((prog.xp / totalXP) * 100, 100)}%` }} />
                </div>
                <span style={{ fontSize: "clamp(10px, 2vw, 11px)", color: "var(--text-accent)", fontFamily: "var(--font-mono)", fontWeight: 600, whiteSpace: "nowrap" }}>{prog.xp}/{totalXP}</span>
              </div>
              {allDone && <div className="hide-mobile" style={{ padding: "3px 10px", borderRadius: 16, background: "rgba(234,179,8,0.12)", border: "1px solid rgba(234,179,8,0.25)", fontSize: 11, fontWeight: 600, color: "#fbbf24", fontFamily: "var(--font-mono)", whiteSpace: "nowrap" }}>🏆</div>}
            </div>
          </div>
          <div style={{ height: 3, borderRadius: 2, background: "rgba(30,41,59,0.5)" }}
            role="progressbar" aria-valuenow={prog.completed.length} aria-valuemin={0} aria-valuemax={steps.length} aria-label="Course progress">
            <div style={{ height: "100%", borderRadius: 2, transition: "width 0.4s ease", background: `linear-gradient(90deg, ${phaseMeta?.color || "#14b8a6"}, #06b6d4)`, width: `${completePct}%` }} />
          </div>
        </div>
      </header>

      <div style={{ display: "flex", flex: 1, overflow: "hidden", minHeight: 0 }}>
        {/* Sidebar overlay */}
        {sidebar && <div onClick={() => setSidebar(false)} aria-hidden="true" style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)", zIndex: 40 }} />}

        {/* Sidebar */}
        <aside style={{
          position: "fixed", left: sidebar ? 0 : "calc(-1 * var(--sidebar-w) - 16px)",
          top: 0, bottom: 0, width: "min(var(--sidebar-w), 85vw)", zIndex: 45,
          paddingTop: "calc(var(--safe-top) + 60px)", paddingBottom: "calc(16px + var(--safe-bottom))",
          background: "rgba(2,6,23,0.97)", backdropFilter: "blur(16px)", WebkitBackdropFilter: "blur(16px)",
          borderRight: "1px solid var(--border-subtle)",
          transition: "left 0.3s cubic-bezier(0.4,0,0.2,1)",
          overflowY: "auto", WebkitOverflowScrolling: "touch",
        }} role="navigation" aria-label="Module navigation">
          <div style={{ padding: "0 12px" }}>
            {phases.map(ph => {
              const phSteps = steps.filter(s => s.phase === ph.id);
              const phComplete = phSteps.filter(s => prog.completed.includes(s.id)).length;
              return (
                <div key={ph.id} style={{ marginBottom: 16 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "0 6px", marginBottom: 6 }}>
                    <span style={{ fontSize: 13 }} aria-hidden="true">{ph.icon}</span>
                    <span style={{ fontFamily: "var(--font-mono)", fontSize: 10, fontWeight: 700, color: ph.color, textTransform: "uppercase", letterSpacing: "0.08em" }}>{ph.name}</span>
                    <span style={{ marginLeft: "auto", fontSize: 10, color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>{phComplete}/{phSteps.length}</span>
                  </div>
                  {phSteps.map(s => {
                    const idx = steps.indexOf(s);
                    return (
                      <SidebarItem
                        key={s.id}
                        s={s} idx={idx}
                        active={idx === prog.step}
                        done={prog.completed.includes(s.id)}
                        unlocked={isUnlocked(idx)}
                        phColor={ph.color}
                        onClick={() => goStep(idx)}
                      />
                    );
                  })}
                </div>
              );
            })}
            <div style={{ padding: "12px 6px", borderTop: "1px solid var(--border-subtle)", marginTop: 8 }}>
              <button onClick={() => { setModal(true); setSidebar(false); }} style={{ fontSize: 11, color: "#64748b", background: "none", border: "none", cursor: "pointer", fontFamily: "var(--font-mono)", padding: "4px 0", touchAction: "manipulation" }}>↻ Reset Progress</button>
              <div className="hide-mobile" style={{ marginTop: 8, fontSize: 10, color: "#334155", fontFamily: "var(--font-mono)" }}>Shortcuts: N = next, P = prev</div>
            </div>
          </div>
        </aside>

        {/* Main */}
        <main ref={contentRef} style={{
          flex: 1, overflowY: "auto", minHeight: 0,
          WebkitOverflowScrolling: "touch",
          padding: "28px 16px calc(80px + var(--safe-bottom))",
          paddingLeft: "calc(16px + var(--safe-left))",
          paddingRight: "calc(16px + var(--safe-right))",
        }} role="main" aria-label="Module content">
          <div style={{ maxWidth: "var(--content-max)", margin: "0 auto" }}>
            {/* Phase badge + Header */}
            <div className="fade-up" key={`h-${curStep.id}`}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10, flexWrap: "wrap" }}>
                <span style={{ padding: "3px 10px", borderRadius: 6, fontSize: 10, fontWeight: 600, fontFamily: "var(--font-mono)", textTransform: "uppercase", letterSpacing: "0.08em", color: phaseMeta?.color || "var(--text-accent)", background: `${phaseMeta?.color || "#14b8a6"}15`, border: `1px solid ${phaseMeta?.color || "#14b8a6"}30` }}>
                  Phase {curStep.phase} · Module {curStep.id}
                </span>
                {prog.completed.includes(curStep.id) && <span style={{ padding: "3px 10px", borderRadius: 6, fontSize: 10, fontWeight: 600, color: "#86efac", background: "rgba(22,163,74,0.1)", border: "1px solid rgba(34,197,94,0.2)", fontFamily: "var(--font-mono)" }}>✓ Completed</span>}
              </div>
              <h1 style={{ fontSize: "clamp(1.4rem, 5vw, 1.8rem)", fontWeight: 700, letterSpacing: "-0.025em", background: "linear-gradient(135deg, #e2e8f0, #94a3b8)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", lineHeight: 1.2, marginBottom: 3 }}>{curStep.title}</h1>
              <p style={{ fontFamily: "var(--font-mono)", fontSize: "clamp(11px, 3vw, 13px)", color: phaseMeta?.color || "var(--text-accent)", fontWeight: 500 }}>{curStep.conceptName}</p>
            </div>

            {/* Content */}
            <div className="fade-up" key={`c-${curStep.id}`} style={{ marginTop: 20, animationDelay: "0.08s" }}>
              <Md text={curStep.markdownContent} />
            </div>

            {/* Diagram */}
            <div className="fade-up" key={`d-${curStep.id}`} style={{ marginTop: 26, animationDelay: "0.16s" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 10 }}>
                <span style={{ fontSize: 13 }} aria-hidden="true">📐</span>
                <h4 style={{ fontFamily: "var(--font-mono)", fontSize: 10, fontWeight: 700, color: "var(--text-accent)", textTransform: "uppercase", letterSpacing: "0.1em", margin: 0 }}>Architecture Diagram</h4>
              </div>
              <Diagram data={curStep.diagram} stepId={curStep.id} />
            </div>

            {/* Key Takeaways */}
            <div className="fade-up" key={`k-${curStep.id}`} style={{ marginTop: 22, animationDelay: "0.24s" }}>
              <div style={{ padding: 16, borderRadius: 10, background: `linear-gradient(135deg, ${phaseMeta?.color || "#14b8a6"}06, ${phaseMeta?.color || "#14b8a6"}03)`, border: `1px solid ${phaseMeta?.color || "#14b8a6"}18` }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 10 }}>
                  <span style={{ fontSize: 13 }} aria-hidden="true">💎</span>
                  <h4 style={{ fontFamily: "var(--font-mono)", fontSize: 10, fontWeight: 700, color: phaseMeta?.color || "var(--text-accent)", textTransform: "uppercase", letterSpacing: "0.08em", margin: 0 }}>Key Takeaways</h4>
                </div>
                {curStep.keyTakeaways.map((t, i) => (
                  <div key={i} style={{ display: "flex", gap: 8, marginBottom: 4, alignItems: "center" }}>
                    <span style={{ color: phaseMeta?.color || "#14b8a6", fontSize: 12, flexShrink: 0 }} aria-hidden="true">→</span>
                    <span style={{ color: "#cbd5e1", fontSize: "0.84rem", lineHeight: 1.45 }}>{t}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Quiz */}
            <div className="fade-up" key={`q-${curStep.id}`} style={{ animationDelay: "0.32s" }}>
              <Quiz act={curStep.activity} stepId={curStep.id} savedAns={prog.answers[curStep.id]} onAnswer={handleAnswer} />
            </div>

            {/* Navigation */}
            <nav style={{ marginTop: 32, display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: 20, borderTop: "1px solid var(--border-subtle)", gap: 8 }} aria-label="Module navigation">
              <button onClick={goPrev} disabled={prog.step === 0}
                aria-label="Previous module"
                style={{
                  padding: "8px 14px", borderRadius: 8, background: "var(--bg-elevated)", border: "1px solid var(--border-subtle)",
                  color: prog.step === 0 ? "#1e293b" : "var(--text-secondary)",
                  cursor: prog.step === 0 ? "not-allowed" : "pointer",
                  fontSize: 13, fontWeight: 500, fontFamily: "inherit", touchAction: "manipulation",
                  WebkitTapHighlightColor: "transparent",
                }}>← <span className="hide-small">Prev</span> <span className="hide-mobile" style={{ fontSize: 10, opacity: 0.5 }}>(P)</span></button>

              {prog.step < steps.length - 1 ? (
                <button onClick={goNext} disabled={!canNext}
                  aria-label="Next module"
                  style={{
                    padding: "8px 18px", borderRadius: 8,
                    background: canNext ? `linear-gradient(135deg, ${phaseMeta?.color || "#0d9488"}, #0891b2)` : "rgba(30,41,59,0.3)",
                    border: canNext ? `1px solid ${phaseMeta?.color || "#14b8a6"}55` : "1px solid rgba(51,65,85,0.15)",
                    color: canNext ? "#f0fdfa" : "#334155", cursor: canNext ? "pointer" : "not-allowed",
                    fontSize: 13, fontWeight: 600, fontFamily: "inherit",
                    animation: canNext ? "pulse-border 2s ease-in-out infinite" : "none",
                    touchAction: "manipulation", WebkitTapHighlightColor: "transparent",
                  }}><span className="hide-small">Next</span> → <span className="hide-mobile" style={{ fontSize: 10, opacity: 0.6 }}>(N)</span></button>
              ) : canNext ? (
                <div style={{ padding: "8px 18px", borderRadius: 8, background: "rgba(234,179,8,0.1)", border: "1px solid rgba(234,179,8,0.25)", color: "#fbbf24", fontSize: 13, fontWeight: 600, fontFamily: "var(--font-mono)" }}>🏆 Complete!</div>
              ) : (
                <span style={{ color: "#334155", fontSize: 12 }}>Answer correctly to finish</span>
              )}
            </nav>

            {/* Completion */}
            {allDone && prog.step === steps.length - 1 && (
              <div style={{ marginTop: 28, padding: "clamp(18px, 4vw, 28px)", borderRadius: 14, textAlign: "center", background: "linear-gradient(135deg, rgba(20,184,166,0.06), rgba(59,130,246,0.04))", border: "1px solid rgba(20,184,166,0.15)" }}>
                <div style={{ fontSize: 44, marginBottom: 10 }} aria-hidden="true">🎓</div>
                <h2 style={{ fontSize: "clamp(1.1rem, 4vw, 1.35rem)", fontWeight: 700, color: "var(--text-primary)", marginBottom: 6 }}>Congratulations!</h2>
                <p style={{ color: "var(--text-secondary)", fontSize: "0.88rem", lineHeight: 1.55, maxWidth: 480, margin: "0 auto 16px" }}>
                  You've mastered the basics of Agentic AI.
                </p>
                <div style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "8px 18px", borderRadius: 8, background: "linear-gradient(135deg, #0d9488, #0891b2)", fontSize: 13, fontWeight: 600, color: "#f0fdfa", flexWrap: "wrap", justifyContent: "center" }}>
                  ⚡ {prog.xp} / {totalXP} XP · 🔥 Best Streak: {prog.maxStreak}
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   GLOBAL STYLES
   ═══════════════════════════════════════════════════════════════════════════ */
const GLOBAL_STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Instrument+Sans:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;600;700&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  html { -webkit-text-size-adjust: 100%; width: 100%; height: 100%; }

  body {
    background: var(--bg-primary);
    width: 100%;
    height: 100vh;
    height: 100dvh;
    overflow: hidden;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }

  #root { width: 100%; height: 100vh; height: 100dvh; overflow: hidden; }

  ::-webkit-scrollbar { width: 5px; }
  ::-webkit-scrollbar-track { background: transparent; }
  ::-webkit-scrollbar-thumb { background: #334155; border-radius: 3px; }

  /* Animations */
  @keyframes confetti-drop {
    0% { transform: translateY(-10vh) rotate(0deg); opacity: 1; }
    100% { transform: translateY(105vh) rotate(720deg); opacity: 0; }
  }
  @keyframes shake {
    0%,100% { transform: translateX(0); }
    20% { transform: translateX(-6px); }
    40% { transform: translateX(6px); }
    60% { transform: translateX(-4px); }
    80% { transform: translateX(4px); }
  }
  @keyframes toast-in {
    from { transform: translateX(40px); opacity: 0; }
    to { transform: translateX(0); opacity: 1; }
  }
  @keyframes pulse-border {
    0%,100% { box-shadow: 0 0 16px rgba(20,184,166,0.15); }
    50% { box-shadow: 0 0 32px rgba(20,184,166,0.3); }
  }
  @keyframes fade-up {
    from { opacity: 0; transform: translateY(18px); }
    to { opacity: 1; transform: translateY(0); }
  }
  @keyframes fade-in {
    from { opacity: 0; }
    to { opacity: 1; }
  }
  @keyframes dash-in {
    from { stroke-dasharray: 1000; stroke-dashoffset: 1000; }
    to { stroke-dasharray: 1000; stroke-dashoffset: 0; }
  }
  @keyframes pulse {
    0%,100% { opacity: 1; }
    50% { opacity: 0.4; }
  }

  .fade-up { animation: fade-up 0.45s ease-out forwards; }

  /* Markdown classes */
  .md-h3 { font-size: clamp(1.1rem, 3.5vw, 1.3rem); font-weight: 700; margin: 1.1rem 0 0.5rem; color: #e2e8f0; letter-spacing: -0.01em; }
  .md-h4 { font-size: clamp(0.95rem, 3vw, 1.05rem); font-weight: 600; margin: 0.9rem 0 0.4rem; color: #cbd5e1; }
  .md-bold { color: #5eead4; font-weight: 600; }
  .md-em { color: #94a3b8; }
  .md-code { background: #1e293b; color: #a5b4fc; padding: 1px 5px; border-radius: 4px; font-family: var(--font-mono); font-size: 0.85em; word-break: break-word; }
  .md-p { color: #94a3b8; line-height: 1.7; margin: 0.6rem 0; font-size: clamp(0.85rem, 2.5vw, 0.93rem); }
  .md-ol { display: flex; gap: 10px; margin: 6px 0 6px 2px; align-items: flex-start; }
  .md-ol-num { min-width: 22px; height: 22px; border-radius: 50%; background: linear-gradient(135deg, #0d9488, #0891b2); display: flex; align-items: center; justify-content: center; font-size: 11px; font-weight: 700; color: #f0fdfa; flex-shrink: 0; }
  .md-ol-text { color: #cbd5e1; line-height: 1.55; font-size: clamp(0.84rem, 2.5vw, 0.92rem); }
  .md-ul { display: flex; gap: 8px; margin: 5px 0 5px 2px; align-items: flex-start; }
  .md-ul-dot { margin-top: 8px; width: 5px; height: 5px; border-radius: 50%; background: #14b8a6; flex-shrink: 0; }
  .md-ul-text { color: #cbd5e1; line-height: 1.55; font-size: clamp(0.84rem, 2.5vw, 0.92rem); }

  /* Responsive helpers */
  @media (max-width: 480px) {
    .hide-mobile { display: none !important; }
  }
  @media (max-width: 360px) {
    .hide-small { display: none !important; }
  }

  /* Focus styles for accessibility */
  button:focus-visible {
    outline: 2px solid #5eead4;
    outline-offset: 2px;
  }

  /* Touch improvements */
  button {
    -webkit-tap-highlight-color: transparent;
  }

  /* Prevent overscroll bounce on iOS */
  html, body {
    overscroll-behavior: none;
  }

  /* Safe area support */
  @supports (padding: env(safe-area-inset-top)) {
    :root {
      --safe-top: env(safe-area-inset-top);
      --safe-bottom: env(safe-area-inset-bottom);
      --safe-left: env(safe-area-inset-left);
      --safe-right: env(safe-area-inset-right);
    }
  }
`;

export default function App() {
  return <ToastProvider><AppCore /></ToastProvider>;
}