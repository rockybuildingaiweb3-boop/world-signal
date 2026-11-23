# Frontend Source (Deferred)

The new frontend will be implemented here in a later phase with AI Studio.

No UI components, styles, framework configuration, or rendering code are included in the architecture phase.

Planned boundaries:

~~~text
src/
├── app/                 # application shell and route composition
├── components/          # reusable presentation components
├── features/
│   ├── briefing/
│   ├── expanded/
│   ├── synthesis/
│   └── audit/
├── lib/
│   ├── content/         # index and edition loading
│   ├── markdown/        # Markdown/YAML parsing and validation
│   └── filtering/       # domain, confidence, importance, date filters
├── styles/              # new design system
└── types/               # edition and signal data contracts
~~~

This is a proposed boundary, not a requirement to scaffold empty modules. Read `AI_STUDIO_BRIEF.md` and `docs/FRONTEND_CONTRACT.md` before creating the frontend.
