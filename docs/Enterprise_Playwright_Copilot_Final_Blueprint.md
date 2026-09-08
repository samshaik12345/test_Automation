# Enterprise Playwright + GitHub Copilot Automation Framework

## Final Architecture Blueprint

**Architecture style:** Multi-application Playwright + TypeScript automation platform  
**Primary authoring environment:** Visual Studio Code  
**Primary AI assistant:** GitHub Copilot Chat  
**Browser-flow capture:** Human-controlled Playwright VS Code Recorder  
**Execution model:** Deterministic Playwright Test  
**AI runtime dependency:** None  
**Playwright MCP:** Prohibited  
**Playwright Agent CLI:** Development assistance only, governed  
**Native Playwright Planner / Generator / Healer agents:** Excluded  
**Framework philosophy:** Playwright-native first, composition-first, reuse-before-create, enforceable architecture

---

## 1. Executive Architecture Decision

Treat the automation ecosystem as:

> **One internal engineering product with multiple application consumers.**

It is not a collection of independent Playwright projects. It is not a Page Object repository. It is not an AI-generated testing platform. It is an internal **Quality Engineering Platform** built on Playwright.

The fundamental architecture is:

```text
                     ENTERPRISE AUTOMATION PLATFORM

                              Shared Governance
                                     |
                     +---------------+---------------+
                     |               |               |
                 Standards      Copilot Rules    CI Controls
                     |               |               |
                     +---------------+---------------+
                                     |
                                     v
                              Shared Core
                                     ^
                     +---------------+---------------+
                     |               |               |
                   App A           App B           App C
                     |               |               |
                  Tests           Tests           Tests
```

The dependency rule is absolute:

```text
Applications -> Shared Core
```

Never:

```text
Shared Core -> Application
```

And never:

```text
App A -> App B private implementation
```

---

## 2. Non-Negotiable Engineering Principles

1. **Official Playwright guidance is the primary authority.**
2. Use current Playwright-native functionality before creating framework wrappers.
3. Test user-visible behavior instead of implementation details.
4. Test isolation is the default.
5. Human users define and record business workflows.
6. Recorder output is raw source material, not production test code.
7. GitHub Copilot assists engineering after recording.
8. Copilot searches for reuse before generating new abstractions.
9. Composition is preferred over inheritance.
10. Tests express scenario intent.
11. Pages model application surfaces.
12. Components model reusable UI elements.
13. Workflows model reusable multi-step activities.
14. APIs are first-class automation capabilities.
15. Fixtures provide controlled dependency injection and lifecycle management.
16. Test data has a formal lifecycle.
17. Cross-application dependencies go through public contracts.
18. Hard waits are prohibited by default.
19. Web-first assertions are the standard.
20. AI assists development but never becomes a regression-runtime dependency.
21. AI never silently heals or changes running tests.
22. CI and deterministic tooling enforce architecture.
23. External community Skills are references, not automatically trusted dependencies.
24. Reuse must reduce maintenance, not merely move code into a shared folder.
25. Every abstraction must justify its existence.

---

## 3. Authoring vs Runtime Trust Boundary

This is one of the most important architectural controls.

### Development side

```text
Requirement
    |
Human understands workflow
    |
Human controls browser
    |
Playwright VS Code Recorder
    |
Raw recording
    |
GitHub Copilot Chat
    |
Best-practice analysis
    |
Reuse analysis
    |
Normalization / refactoring
    |
Optional controlled Playwright CLI assistance
    |
Human review
    |
Static validation
    |
Targeted developer validation
    |
PR
```

Then:

```text
==================== AI TRUST BOUNDARY ====================
```

Below this line:

```text
Git
 |
CI
 |
Playwright Test
 |
Deterministic execution
 |
Evidence / reports
```

No LLM determines the next browser action during regression execution. No AI changes source code during execution. No runtime locator healing. No autonomous AI recovery loop.

---

## 4. Playwright Tooling Policy

There are three different Playwright concepts that must not be confused.

### 4.1 Playwright Test Runner

Examples:

```text
npx playwright test
npx playwright show-report
npx playwright show-trace
```

This is normal deterministic Playwright tooling. **Allowed locally and in CI.** It is not considered AI execution.

### 4.2 Playwright Agent CLI

`playwright-cli` is designed for coding agents and provides browser-control capabilities. It may be used as **development assistance only**, and this framework goes further than "governed": it is not used to drive the browser during recording or execution at all.

Two distinct reasons back this restriction, and they should not be conflated when explaining the decision:

- **Governance / determinism (primary, permanent).** Recording and execution must produce the same result regardless of which model, if any, is involved that day. An agent making live decisions about selectors or navigation during recording or execution undermines that guarantee from the first step. This reason holds even if agent inference becomes free.
- **Token / cost efficiency (secondary, practical).** Driving a live browser through an agent loop is materially more expensive than a human recording once and Copilot reviewing the static output afterward. This is a real operational benefit but it is not the reason the restriction exists, and it should not be the argument used to justify relaxing it later (cheaper inference does not change the governance reason above).

Permitted examples (development assistance only, after a human has already produced the artifact in question):

- Analyze an already-created test.
- Analyze an existing failure.
- Inspect an existing trace.
- Inspect console/network evidence.
- Evaluate locator quality.
- Validate an existing test after a developer-requested change.
- Assist diagnosis of an already-recorded flow.
- Suggest or implement a source-code correction after human initiation.

It may participate in:

```text
Existing Test
     |
Failure
     |
Developer asks Copilot for help
     |
Controlled Playwright tooling
     |
Evidence inspection
     |
Proposed fix
     |
Human review
```

It must **not** autonomously:

- Explore the application to discover functionality.
- Decide what business scenarios should exist.
- Start recording new business workflows.
- Invent coverage through exploration.
- Generate business flows from browser discovery.
- Run continuously during regression.
- Repair source code during CI.
- Silently change locators while a test runs.

This list is the framework's single canonical statement of prohibited autonomous AI behavior. Section 5 (Playwright MCP) and section 6 (native Test Agents) reference it rather than restating their own versions, so the three policies cannot drift apart as the document is edited.

#### Critical governance consideration

The Playwright Agent CLI exposes broad browser capabilities. Therefore agents should not receive unrestricted Agent CLI access merely because an instruction says "don't explore."

Prefer framework-controlled developer commands such as:

```text
pnpm pw:validate <spec>
pnpm pw:trace <artifact>
pnpm pw:diagnose <result>
pnpm pw:review <spec>
```

These repository-controlled commands should expose only approved activities. **This is a convenience and audit layer, not the enforcement layer.** A wrapper command only constrains an agent that chooses to use it; it does not prevent an agent with general shell or terminal access from calling the underlying tool directly. The actual control has to sit at the permission/sandbox boundary of whatever executes the agent — for example, the tool/permission allowlist configured for Copilot Chat's agent mode in VS Code, and the absence of any Agent CLI, browser binary, or general shell access from CI runners and any hosted coding-agent environment. Treat the wrapper commands as the developer-facing interface, and treat the execution-environment permission configuration as the thing that actually makes the prohibition real. Where available and approved, deterministic Copilot hooks may additionally reject prohibited agent commands, but Preview functionality must never be the only enforcement layer.

---

## 5. Playwright MCP Policy

Playwright MCP is:

```text
PROHIBITED
```

Do not use it for recording, browser automation, exploration, generation, testing, healing, debugging, normalization, or CI. It should not appear as an optional or future architecture recommendation. Its absence is an intentional governance decision, applying at every stage of the framework without exception.

This prohibition holds regardless of how Playwright MCP is packaged or distributed. As of Playwright 1.62, the MCP server ships inside Playwright's core package itself (`npx playwright mcp`, no separate install), which removes the friction that used to make MCP feel like an optional add-on. That packaging change does not change this decision: the objection was never installation cost, it is that MCP hands an LLM live, autonomous control over a real browser, which conflicts with the AI Trust Boundary in section 3 and the canonical prohibited-behavior list in section 4.2. "It now ships in core" is not a reason to reconsider this policy, and should not be treated as one if raised in review.

---

## 6. Native Playwright Test Agents

Playwright currently supplies:

```text
Planner
Generator
Healer
```

These agents are intentionally excluded from this framework.

Reason:

```text
Planner   -> autonomous application exploration
Generator -> live scenario generation
Healer    -> runtime execution and test repair
```

Their generated definitions also rely on MCP tooling. Those behaviors conflict with the same prohibited-behavior list in section 4.2 and with this framework's no-MCP, human-controlled business-flow discovery, and no-autonomous-runtime-healing decisions.

Classify them as:

```text
EXCLUDED BY ARCHITECTURAL DECISION
```

This is not considered a missing framework capability.

**Trade-off accepted:** Planner/Generator/Healer are actively maintained, officially supported Playwright capabilities, and excluding them means the framework will not automatically benefit from Microsoft's ongoing investment in automated exploration, generation, or self-repair. That is a deliberate exchange of some engineering leverage for a hard guarantee that no test's definition of "pass" can change without a human reviewing the diff. Revisit this trade-off only through the model/tooling-change process in section 62, not ad hoc.

---

## 7. Final Repository Architecture

```text
enterprise-playwright/

├── .github/
│   ├── copilot-instructions.md
│   ├── instructions/
│   │   ├── tests.instructions.md
│   │   ├── pages.instructions.md
│   │   ├── components.instructions.md
│   │   ├── workflows.instructions.md
│   │   ├── api.instructions.md
│   │   ├── fixtures.instructions.md
│   │   ├── test-data.instructions.md
│   │   └── core.instructions.md
│   ├── skills/
│   │   ├── playwright-best-practices/
│   │   │   ├── SKILL.md
│   │   │   ├── references/
│   │   │   └── examples/
│   │   ├── normalize-recording/
│   │   ├── reuse-analysis/
│   │   ├── review-playwright-test/
│   │   └── analyze-failure/
│   ├── agents/
│   │   ├── recording-normalizer.agent.md
│   │   ├── framework-reviewer.agent.md
│   │   └── failure-analyst.agent.md
│   ├── prompts/
│   │   └── convenience prompts only
│   ├── hooks/
│   │   └── optional deterministic Copilot hooks
│   └── workflows/
│       ├── pr-validation.yml
│       ├── smoke.yml
│       ├── regression.yml
│       └── scheduled-quality.yml
│
├── apps/
│   ├── app-one/
│   │   ├── flows.json
│   │   ├── tests/
│   │   │   ├── ui/
│   │   │   ├── api/
│   │   │   └── e2e/
│   │   ├── pages/
│   │   ├── components/
│   │   ├── workflows/
│   │   ├── api/
│   │   │   ├── clients/
│   │   │   ├── models/
│   │   │   ├── schemas/
│   │   │   ├── builders/
│   │   │   └── validators/
│   │   ├── fixtures/
│   │   ├── test-data/
│   │   │   ├── builders/
│   │   │   ├── factories/
│   │   │   ├── reference/
│   │   │   └── providers/
│   │   ├── services/
│   │   ├── _recordings/
│   │   ├── public.ts
│   │   └── playwright.config.ts
│   └── app-two/
│       └── ...
│
├── journeys/
│   └── cross-app/
├── packages/
│   └── core/
│       ├── config/
│       ├── fixtures/
│       ├── api/
│       ├── data/
│       ├── diagnostics/
│       ├── logging/
│       ├── reporting/
│       ├── types/
│       └── utilities/
├── scripts/
│   ├── validate-flows.ts
│   ├── validate-architecture.ts
│   ├── generate-flow-catalog.ts
│   ├── pw-review.ts
│   ├── pw-diagnose.ts
│   └── pw-validate.ts
├── docs/
│   ├── architecture/
│   ├── standards/
│   ├── playbooks/
│   ├── examples/
│   ├── adr/
│   └── generated/
├── .vscode/
│   ├── extensions.json
│   └── settings.json
├── eslint.config.js
├── tsconfig.base.json
├── package.json
├── workspace configuration
└── CODEOWNERS
```

Folders should be created only when required. An application with no meaningful API automation does not need five empty API directories. An application with no reusable workflows does not need a workflow layer merely for architectural symmetry.

**This diagram is the ceiling, not the day-one floor.** It shows what a mature application in this repository may grow into, not the skeleton every new application should be scaffolded with. A brand-new application starts with only what its first flow needs — typically `tests/`, `pages/`, `fixtures/`, `flows.json`, and `playwright.config.ts` — and earns `components/`, `workflows/`, `api/`, `test-data/`, and `services/` as real reuse or real complexity shows up (see section 16's decision rule and section 69's overengineering guardrail). `validate-architecture.ts` should check that existing folders are used correctly; it should not require an application to pre-create folders it does not yet need.

---

## 8. Critical Change From the Original Architecture

Do **not** require:

```text
tests/<flow>
pages/<flow>
```

to mirror one another. This rule reduces Page Object reuse over time.

Instead:

```text
Tests      -> business-flow/scenario oriented
Pages      -> application-surface oriented
Components -> reusable UI-element oriented
Workflows  -> reusable activity oriented
```

Example:

```text
Checkout Test ------------------+
                                |
Account Update Test -------+    |
                           v    v
                     AccountPage
                          |
                          +-- NavigationComponent
                          +-- AddressFormComponent
```

The same Page or Component may participate in many flows. This is expected and desirable.

---

## 9. Flow Registry

Keep `flows.json`. It remains an excellent governance mechanism. However, it governs **business-flow coverage**, not Page Object topology.

Example:

```json
{
  "app": "app-one",
  "flows": [
    {
      "id": "app-one.checkout",
      "name": "checkout",
      "tag": "@flow:checkout",
      "owner": "<owning-team>",
      "status": "active",
      "criticality": "tier-1",
      "entryPoint": "/cart",
      "coveragePolicy": ["smoke", "regression"]
    }
  ]
}
```

`validate-flows.ts` should verify:

- Every flow ID is unique.
- Every active flow has appropriate tests.
- Every flow test carries the correct `@flow` tag.
- Every test carries an `@app` tag.
- Tier-1 flows satisfy required coverage.
- Deprecated flows do not accumulate new active tests.
- Owners are valid.
- Critical flows are represented in the required CI lanes.

It should **not** verify that `pages/<flow>` exists, because Pages are no longer flow-owned.

Generate a portfolio view such as `docs/generated/flow-catalog.json` to answer which business flows exist, which application owns them, who owns automation, which are critical, what coverage exists, and which flows are quarantined or missing coverage.

---

## 10. Test Identity and Tagging

Every scenario should have two mandatory identity dimensions:

```text
@app:<application>
@flow:<business-flow>
```

Then optional execution/policy tags:

```text
@smoke
@regression
@api
@e2e
@visual
@contract
@critical
@quarantine
```

Use Playwright-native tags/annotations. Do not embed machine-readable tags into test-title strings. Avoid uncontrolled tag proliferation.

Tags should answer either:

```text
WHO/WHAT IS THIS TEST?
```

or:

```text
HOW SHOULD THIS TEST BE EXECUTED?
```

---

## 11. Tests

Tests own:

- Scenario intent.
- Scenario-specific setup.
- Scenario-specific expectations.
- Business outcome assertions.
- Identity tags.

A test should generally answer:

> What behavior is being verified?

rather than:

> Which 37 buttons are being clicked?

Example:

```typescript
test('registered user completes checkout', async ({
  checkoutWorkflow,
  testData,
}) => {
  const order = testData.order();

  await checkoutWorkflow.complete(order);

  await expect(checkoutWorkflow.confirmationNumber()).toBeVisible();
});
```

Avoid over-abstraction that makes the scenario impossible to understand. Each **test** represents one independently understandable scenario. A spec file may contain multiple related tests. Do not enforce "one test per spec."

---

## 12. Page Objects

Pages represent application surfaces, for example:

```text
LoginPage
SearchPage
AccountPage
CartPage
CheckoutPage
```

Page Objects should contain locators, UI interactions, and small application-surface behaviors. They should not become test-data factories, API clients, database clients, or business-flow god objects.

Scenario-specific business assertions normally remain in tests. A small reusable page invariant such as `expectLoaded()` may be acceptable when it represents the stable state of that page rather than a scenario's business expectation.

No blanket inheritance requirement should exist.

---

## 13. BasePage Policy

A mandatory `BasePage` is **not** required. Use one only if there is genuinely stable cross-application behavior that almost every Page Object needs.

A BasePage should never accumulate generic click, wait, locator, retry, scroll, or DOM helpers merely because those operations are common. Playwright already implements most of these correctly.

Prefer direct Playwright APIs. If a BasePage exists, keep it extremely small.

---

## 14. Components

Components represent reusable UI elements, for example:

```text
NavigationComponent
SearchPanel
DataTable
DatePicker
AddressForm
ModalDialog
Pagination
ToastNotification
```

Pages compose Components.

```text
OrdersPage
    |
    +-- NavigationComponent
    +-- SearchPanel
    +-- OrdersTable
    +-- PaginationComponent
```

Application-specific components stay inside the application. Do not move a component into shared core merely because two applications both contain a "table." Only promote it when semantics and behavior are genuinely identical.

---

## 15. Workflow / Task Layer

Use workflows only when repeated Page/Component interactions represent a meaningful reusable activity.

```text
CheckoutWorkflow
      |
      +-- CartPage
      +-- CheckoutPage
      +-- PaymentComponent
      +-- ConfirmationPage
```

Possible methods:

```text
completeGuestCheckout()
completeRegisteredCheckout()
submitApplication()
approveRequest()
```

Workflows should not become enormous automation service classes.

Create a Workflow when it eliminates meaningful repeated activity, raises the abstraction to business intent, is reused, and makes tests easier to read. Do not create a Workflow when it merely wraps one Page method.

---

## 16. Decision Rule: Test vs Page vs Component vs Workflow vs Utility

| Requirement | Location |
|---|---|
| Scenario-specific behavior | Test |
| Application screen behavior | Page |
| Reusable UI element | Component |
| Repeated multi-page business activity | Workflow |
| Lifecycle-managed dependency | Fixture |
| Backend/application integration | Service/API |
| Stateless framework-generic transformation | Utility |
| Data construction | Builder/Factory |
| Data acquisition/reservation/lifecycle | TDM |

When extraction does not improve reuse, clarity, lifecycle management, or separation of responsibility, keep the code where it is.

---

## 17. Locator Standard

Follow Playwright's principle:

> Prioritize user-facing attributes and explicit contracts.

Do **not** create a simplistic mandatory hierarchy claiming one locator type is always superior.

Use semantic judgment.

### Preferred

For accessible semantic controls:

```text
getByRole()
```

For form controls:

```text
getByLabel()
```

Where placeholder itself represents the user-visible contract:

```text
getByPlaceholder()
```

For meaningful unique visible text:

```text
getByText()
```

For an explicit organization-supported automation contract:

```text
getByTestId()
```

Use `filter()`, `has()`, `hasText`, and locator chaining to scope precisely.

For modern visible filtering, prefer Playwright's native visible-locator capability over custom `:visible` selector tricks where appropriate.

### Avoid by default

- Generated CSS classes.
- Deep CSS selectors.
- DOM positional selectors.
- Fragile XPath.
- `nth()` where position is not part of the requirement.
- `force: true` used merely to make a broken test pass.

An explicit test ID can be stronger than visible text when the application intentionally exposes that test ID as a stable automation contract.

---

## 18. Waiting Standard

The framework should trust Playwright's actionability and auto-waiting.

Prohibit routine use of:

```typescript
await page.waitForTimeout(5000);
```

Prefer observable conditions:

```text
toBeVisible()
toBeEnabled()
toHaveText()
toHaveValue()
toHaveURL()
toHaveCount()
waitForResponse()
waitForURL()
expect.poll()
```

Do not use arbitrary timeout increases as the primary response to flakiness. Do not use network-idle state as a generic substitute for verifying that the application is ready when a user-visible condition can be asserted instead.

---

## 19. Assertion Standard

Prefer web-first assertions.

Good:

```typescript
await expect(saveButton).toBeEnabled();
```

Avoid:

```typescript
expect(await saveButton.isEnabled()).toBe(true);
```

Assertions should verify observable outcomes. Keep scenario-specific expectations visible from the test. Use soft assertions only where several independent checkpoints genuinely need to be collected before the test ends.

---

## 20. Recorder -> Production Automation Pipeline

The recorder is intentionally part of the process. But:

> Recorder output is raw automation material.

Standard lifecycle:

```text
1. Identify business flow
          |
2. Check flows.json
          |
3. Human records in VS Code
          |
4. Save under _recordings/
          |
5. Copilot normalization
          |
6. Best-practice review
          |
7. Search repository for reuse
          |
8. Refactor into Pages / Components / Workflows
          |
9. Move setup to API/TDM where appropriate
          |
10. Keep scenario assertions in test
          |
11. Lint / type check / architecture validation
          |
12. Optional targeted Playwright validation
          |
13. Human review
          |
14. Commit
```

Raw recordings should never be merged.

---

## 21. Search-Before-Create Rule

This is a mandatory AI and human authoring principle.

Before creating a Page, Component, Workflow, Fixture, API client, Builder, or Utility, search the existing repository.

Decision order:

```text
Can existing code be reused unchanged?
        |
Can existing code safely be extended?
        |
Is the semantic behavior actually the same?
        |
Would reuse increase coupling?
        |
Only then create a new abstraction.
```

Copilot's normalization Skill must perform this analysis before writing files.

---

## 22. Fixtures

Fixtures are the framework's dependency-injection mechanism.

Prefer:

```text
test.extend()
```

instead of global mutable objects, singleton Page Objects, deep `BaseTest` inheritance, or manual `beforeEach` dependency construction everywhere.

Fixtures can expose Pages, Workflows, API clients, authenticated contexts, test-data managers, and diagnostics context.

### Test-scoped

Default for mutable test data, Pages, most Workflows, and test-specific API state.

### Worker-scoped

Use only where creation cost is high, state can safely be isolated per worker, and reuse cannot leak state between tests.

Avoid one enormous fixture exposing the entire application. Compose focused fixtures.

---

## 23. Authentication Architecture

Authentication is application-specific.

Shared core must not know login endpoints, SSO flows, identity providers, token names, cookie structure, or localStorage keys.

Prefer native Playwright mechanisms:

```text
storageState
setup projects
API authentication
```

Support multiple roles, such as:

```text
standard | admin | approver | readOnly
```

Where accounts are mutable, prefer one account per worker or data-managed account leasing rather than parallel tests sharing a single mutable account.

Test locks are a fallback for genuinely unavoidable shared state.

---

## 24. Enterprise Test Data Architecture

This requires more than Faker.

Separate four concerns:

```text
DATA DEFINITION
      |
DATA GENERATION
      |
DATA PROVISIONING / ACQUISITION
      |
DATA LIFECYCLE
```

Application test-data structure:

```text
test-data/
  builders/
  factories/
  reference/
  providers/
```

Shared core may provide unique identifiers, generic faker provider, resource lifecycle interfaces, lease metadata, cleanup helpers, and environment context.

Application code provides application-specific data semantics, reference datasets, API provisioning, and entity cleanup behavior.

---

## 25. TDM Lifecycle

Preferred lifecycle:

```text
Test requests data
       |
TDM determines strategy
       |
       +-- Generate new
       +-- Create via API
       +-- Acquire seeded resource
       +-- Lease scarce resource
       |
Track identifiers
       |
Run test
       |
Cleanup / Release
       |
Attach relevant IDs to diagnostics
```

The TDM capability should answer:

- What data does this test need?
- Where does it come from?
- Who owns it?
- Is it currently leased?
- Is it safe to reuse?
- Does it require cleanup?
- Did cleanup succeed?

---

## 26. Playwright Test Locks

Playwright-native test locks are valuable when tests share scarce external resources.

Use them for shared account configuration, a scarce device, an exclusive integration resource, or an environment-wide setting.

They solve execution serialization. They do **not** replace TDM.

```text
Test Lock
=
Who may use Resource X right now?
```

TDM answers the broader questions:

```text
Which resource should I use?
How do I acquire it?
Who owns it?
When does the lease expire?
What must be cleaned up?
```

Use both where appropriate. Do not use locks to hide badly isolated test design.

### Lock/lease conflict arbitration

Locks and leases are two independent mechanisms and can disagree — for example, a TDM lease expires while a test lock on the same resource is still held by a hung or crashed worker, or a worker holds a lock past its lease window. Define this explicitly rather than leaving it implicit:

- Every test lock must have a maximum hold duration (a timeout), enforced by the lock mechanism itself, not by the test's own cleanup running successfully.
- Every TDM lease must be revocable: if a lease expires while a lock is still held, the lock's timeout — not the lease expiry — is what releases the resource; the lease should not be silently extended just because a lock exists.
- TDM, not the test lock mechanism, is the source of truth for "who is allowed to use this resource" (ownership); the lock mechanism is the source of truth for "who is using it right now" (execution serialization). A lock held by a worker whose lease has expired is a defect to surface (e.g., flag in diagnostics/metrics), not a state to silently resolve by extending either side.
- Name an owner (the shared-core/TDM maintainer, per section 33) responsible for this arbitration behavior and for tuning lock timeouts as real hung-worker incidents are observed.

---

## 27. Test Data Literal Policy

Do not create a rule saying no literal strings may appear in tests. That creates unnecessary abstraction.

This can be acceptable:

```typescript
await searchPage.search('Laptop');
```

when `Laptop` is intentional scenario data.

Dynamic identifiers should generally not be hardcoded, including emails, unique usernames, IDs, mutable account numbers, and temporary references.

The goal is controlled data, not abstraction ceremony.

---

## 28. API Architecture

API automation is a first-class framework capability. Do not reduce it to `utils/api-client.ts`.

Application-level structure can grow to:

```text
api/
  clients/
  models/
  schemas/
  builders/
  validators/
```

Core provides only generic infrastructure. Application code owns endpoint knowledge.

Example:

```text
packages/core/api/
    request-context helpers
    common error handling
    generic telemetry

apps/app-one/api/
    OrdersApi
    AccountsApi
    OrderRequest
    OrderResponse
```

Prefer Playwright's native `APIRequestContext`. Do not create wrappers merely to rename native Playwright methods.

---

## 29. Typed API Support

Use current Playwright typed request capabilities where helpful.

However:

```text
TypeScript type != runtime contract validation
```

For scenarios requiring contract validation, optionally combine typed request/response handling with a runtime schema validator.

Use API calls for test setup, test cleanup, backend verification, API-only testing, and hybrid UI/API validation.

---

## 30. Hybrid UI/API Testing

First-class patterns:

```text
API create
   |
UI verify
```

```text
API setup
   |
UI business operation
   |
API verification
```

```text
UI operation
   |
API/backend verification
```

This is often more reliable and faster than performing every prerequisite through UI. Do not use API setup when the UI setup behavior itself is the scenario under test.

---

## 31. External Dependency Policy

Follow Playwright's testing philosophy:

> Test what you control.

Third-party dependencies should generally be controlled through network mocking, sandbox/stub environments, or recorded deterministic fixtures where appropriate.

Maintain a small explicit `@contract` lane for scenarios where validating the real integration is required.

Do not make the main regression suite depend unnecessarily on unstable third-party services.

---

## 32. Cross-Application Architecture

Every application exposes a controlled public automation contract, for example:

```text
apps/app-one/public.ts
```

Cross-app journeys may import only from `public.ts`, not private Pages, private fixtures, or internal test-data modules.

Dependency:

```text
Journey
   |
App A public automation contract

Journey
   |
App B public automation contract
```

Prefer exporting stable Workflows, service facades, fixture contracts, and types rather than raw internals. Enforce this through module-boundary rules.

---

## 33. Shared Core Philosophy

Shared core exists for infrastructure with genuinely shared semantics.

Good candidates:

- Configuration infrastructure.
- Generic fixtures.
- Generic data lifecycle.
- Generic API infrastructure.
- Diagnostics.
- Logging.
- Reporting.
- Artifact management.
- Shared types.

Bad candidates:

- Application Pages.
- Application Workflows.
- Application APIs.
- Application data semantics.
- Application login behavior.

---

## 34. Rule of Semantic Reuse

Use this decision model:

```text
Used once
-> Keep local

Repeated meaningfully within one application
-> Application abstraction candidate

Similar in two applications
-> Evaluate semantics carefully

Identical semantics across several applications
-> Shared-core candidate
```

The key word is **SEMANTICS**. Two pieces of code looking similar does not mean they belong in core.

---

## 35. GitHub Copilot Architecture

GitHub Copilot Chat inside VS Code is the primary AI development surface. The Copilot-specific customization layer below (`copilot-instructions.md`, `instructions/`, `skills/`, `agents/`, `prompts/`, `hooks/`) is written specifically against GitHub Copilot's current extension points. If a second AI development surface is ever adopted alongside or instead of Copilot, sections 35-43 will need to be re-derived for that surface's own customization model rather than assumed portable — this is an accepted coupling to Copilot, not an oversight, given Copilot is the stated primary AI assistant.

Use each customization mechanism for a specific responsibility:

```text
copilot-instructions.md
-> repository-wide non-negotiables

instructions/*.instructions.md
-> path-specific architecture rules

skills/
-> durable reusable engineering procedures

agents/
-> specialized roles + scoped tool access

prompts/
-> user-invoked convenience commands

hooks/
-> optional deterministic agent lifecycle controls
```

Do not use all mechanisms simply because they exist.

---

## 36. Copilot Repository Instructions

`.github/copilot-instructions.md` should stay concise. It should describe architecture, the trust boundary, reuse-before-create, Playwright standards, prohibited patterns, and required validation.

Do not place hundreds of detailed examples inside it. Large procedural knowledge belongs in Skills.

---

## 37. Path-Specific Instructions

Examples:

```text
tests/**
-> scenario intent and assertions

pages/**
-> UI surface modeling

components/**
-> reusable UI elements

workflows/**
-> reusable activity composition

api/**
-> application API behavior

test-data/**
-> application data semantics

packages/core/**
-> zero application-specific semantics
```

This gives Copilot context only where relevant.

---

## 38. Internal Playwright Best-Practices Skill

Create:

```text
.github/skills/playwright-best-practices/
```

It becomes the organization's approved Playwright engineering standard.

Sources:

```text
Official Playwright Best Practices
+
Current official Playwright documentation
+
Reviewed useful guidance from currents-dev/playwright-best-practices-skill
+
Reviewed useful guidance from testdino-hq/playwright-skill
+
Organization architecture decisions
```

External community repositories should **not** automatically become live organization instructions. Review useful concepts and curate them internally.

Record source revision, review date, Playwright version, and organization-specific overrides.

---

## 39. Recording Normalization Skill

Create:

```text
.github/skills/normalize-recording/
```

Its workflow should be:

1. Read raw recording.
2. Determine application + flow.
3. Read relevant framework instructions.
4. Search repository before creating anything.
5. Identify existing Pages.
6. Identify existing Components.
7. Identify existing Workflows.
8. Identify API-assisted setup opportunities.
9. Identify existing TDM capabilities.
10. Review locators.
11. Review waits.
12. Review assertions.
13. Review test isolation.
14. Review authentication.
15. Refactor only where beneficial.
16. Run deterministic static checks.
17. Explain important architectural changes.
18. Present diff for human review.

The Skill must never instruct AI to discover a new business workflow through autonomous browser exploration.

---

## 40. Other Recommended Skills

High-value initial Skills:

```text
playwright-best-practices
normalize-recording
reuse-analysis
review-playwright-test
analyze-failure
```

Add later only when repetition justifies:

```text
api-test-authoring
test-data-design
fixture-review
visual-regression
cross-app-journeys
```

Keep the Skill catalog small and high quality.

---

## 41. Custom Copilot Agents

Recommended initial roles:

### Recording Normalizer

Can read, search, and edit. Purpose: transform recorder output into framework code.

### Framework Reviewer

Prefer read-only. Purpose: architecture, reuse, Playwright standards, security, and maintainability review.

### Failure Analyst

May analyze test source, trace, report, console, network, and screenshots. May propose fixes. No runtime healing.

Avoid unnecessary agent proliferation.

---

## 42. Prompt Files

Prompt files remain useful for convenient local commands, for example:

```text
/normalize-recording
/review-test
/analyze-failure
```

But important reusable procedures should primarily live in Skills. Prompt files are convenience entry points, not the architecture's source of truth.

---

## 43. Copilot Hooks

Hooks can provide deterministic actions around agent behavior.

Potential uses:

```text
after edit
-> format

after automation-code edit
-> ESLint

before terminal command
-> security validation
```

However, Hooks are not a foundational control while their relevant capability remains Preview. Everything critical must still be enforced by CI, lint, TypeScript, architecture checks, and CODEOWNERS.

---

## 44. Model Policy

Do not pin architecture to one named AI model.

Instead maintain an **Organization Approved Model Policy**. As implemented today this policy is scoped to models available through GitHub Copilot specifically (Copilot's supported model list), not to AI models in general — see section 35's note on the Copilot coupling. If a second AI surface is adopted, its own approved-model list is a separate policy, evaluated with the same drift-testing discipline below.

Model changes trigger an AI drift corpus and representative normalization/review-quality checks (see section 45 for the enforcement mechanism, ownership, and pass/fail gate).

Framework quality must come from instructions, Skills, examples, static controls, and human review, not from trusting a specific model indefinitely.

---

## 45. AI Drift Testing

Maintain representative raw recordings and expected architectural outcomes.

Examples:

- Simple flow.
- Long flow.
- Bad CSS selectors.
- Duplicate Page Object.
- Reusable Component opportunity.
- Workflow extraction opportunity.
- API setup opportunity.
- Hardcoded mutable data.
- Multi-role scenario.
- iframe scenario.
- Flaky test.
- Failure trace.

Evaluate:

- Did AI reuse existing abstractions?
- Did it follow locator rules?
- Did it avoid unnecessary helpers?
- Did it preserve intent?
- Did it respect dependencies?
- Did it avoid hard waits?
- Did it keep core application-agnostic?

Do not require exact generated code equality. Measure architectural compliance.

### Ownership, cadence, and gate

This corpus is the framework's primary enforcement mechanism for the claim in section 44 that quality does not depend on trusting one model indefinitely — it should not be left as an unowned best-effort checklist. At minimum, define:

- **Owner:** a named role (e.g., the shared-core/framework maintainer group referenced in section 33) responsible for maintaining the corpus and running it.
- **Trigger:** run on every proposed change to `.github/copilot-instructions.md`, any `instructions/*.instructions.md`, any Skill, any custom agent, and on any change to the organization's approved Copilot model list (section 44) — not only on a fixed calendar cadence.
- **Threshold:** each corpus case is scored against its documented expected architectural outcome (e.g., "reused existing `AccountPage`," "no `waitForTimeout`," "correct `@app`/`@flow` tags"); define a minimum pass rate (for example, all "must never" checks pass with zero exceptions, and a documented minimum share of "should" checks pass) below which the change is blocked.
- **Consequence of failure:** a customization or model change that fails the gate does not ship — the Skill/instruction/agent change is reverted or the model change is not promoted to the approved list, until re-curation brings the corpus back to threshold. This is the same "no shipping without passing checks" discipline the document already applies to lint, TypeScript, and architecture validation (section 46); AI drift testing should not be the one exception.

---

## 46. Architecture Enforcement

Important rules must be executable.

Use:

```text
TypeScript strict mode
tsc --noEmit
ESLint
eslint-plugin-playwright
@typescript-eslint/no-floating-promises
module-boundary validation
custom architecture checks
flow-registry validation
secret scanning
CODEOWNERS
CI
```

Examples of enforceable violations:

- Core imports application.
- App A imports App B internals.
- `waitForTimeout` in automation source.
- `test.only` committed.
- Unapproved `test.skip`.
- Missing `@app` tag.
- Missing `@flow` tag.
- Unknown flow.
- Secret committed.
- Missing `await` on Playwright Promise.

Some architectural quality remains semantic and should be handled through human/Copilot review, such as whether something should be a Component, whether a locator is semantically stable, whether a Workflow is unnecessary, or whether an abstraction is overengineered.

---

## 47. Flakiness Policy

A retry is not a fix.

First classify:

```text
application defect
automation defect
data defect
environment defect
infrastructure/transient defect
```

Where retrying is appropriate, current Playwright isolated retries (`retryStrategy: 'isolated'`, which defers retries to the end of the run in a single worker) should be used so retries occur without interference from the main parallel run, and so genuinely flaky tests can be distinguished from tests that only fail under parallelism due to shared-resource or concurrency bugs.

Keep retry budgets small.

Track:

```text
first-attempt pass rate
retry-pass rate
flaky tests
quarantine age
```

A test that only succeeds because of retries is not considered healthy.

---

## 48. Quarantine Policy

Quarantine must not become a graveyard.

Every quarantined test should have:

```text
owner
reason
issue/reference
date quarantined
expiry/review date
```

Current Playwright reporter preprocessing (`Reporter.preprocess()`) can be used to apply centralized quarantine/exclusion policy where appropriate.

Maintain a separate quarantine execution lane so failures remain visible. Do not permanently silence known failures.

---

## 49. Diagnostics Architecture

The primary objective is:

> Minimize mean time to diagnose.

Use Playwright-native evidence first.

Preferred evidence:

```text
Trace
Screenshot
Console messages
Page errors
Network evidence
HTML report
Test steps
Test-data identifiers
Correlation identifiers when available
```

Current Playwright capabilities for console-message and page-error retrieval should be used instead of implementing unnecessary custom listeners everywhere.

---

## 50. Evidence Policy

Do not collect every expensive artifact for every passing test.

Recommended model:

```text
PASS
-> normal report / minimal evidence

FAILURE
-> trace + screenshot + console/page errors

RETRY / REPEATED FAILURE
-> richer trace/network evidence

CRITICAL INVESTIGATION
-> optional enhanced video/screencast
```

Choose exact retention based on storage and security policy.

---

## 51. Trace Strategy

Trace Viewer should be the primary investigation tool for CI failures.

Where appropriate use current richer trace capabilities including DOM snapshots, ARIA snapshots, and screen snapshots, especially for hard-to-diagnose UI failures.

Avoid duplicating trace information in custom logging systems.

---

## 52. Screencast

Screencast is:

```text
OPTIONAL / ADVANCED
```

not mandatory for every PR or test.

Use where visual evidence materially helps, such as critical journey demonstrations, complex UI defect evidence, review walkthroughs, or training/documentation.

Do not enable it globally without evaluating storage, runtime cost, sensitive information, and artifact retention.

---

## 53. Structured Test Steps

Use `test.step()` where it improves report readability.

Prefer meaningful activities:

```text
Authenticate
Create data
Submit request
Validate confirmation
```

Current structured step parameters can improve reports. Do not include secrets or sensitive test data in step parameters. Do not create a `test.step()` for every click.

---

## 54. Reporting

Baseline:

```text
Playwright HTML report
+
CI-native reporter where required
+
organization-specific summary reporter if justified
```

Evaluate current Playwright capabilities before building custom reporters.

Optional advanced use:

```text
Reporter.preprocess()
-> quarantine/execution-policy handling

Perfetto reporter
-> worker/concurrency investigation
```

Perfetto should not become the primary test-results interface.

---

## 55. Configuration Architecture

Each application may have its own `playwright.config.ts`, but common configuration should be generated/composed from shared core.

Conceptually:

```typescript
export default createPlaywrightConfig({
  app: 'app-one',
  testDir: './tests',
  baseURL: environment.appOneUrl,
});
```

Core may provide common timeouts, reporter defaults, artifact policy, browser configuration helpers, retry policy helper, and environment validation.

Application configuration supplies base URL, test directories, app-specific projects, and app-specific environment settings.

Do not duplicate a 150-line Playwright config across twenty applications.

---

## 56. Browser Strategy

Do not blindly run every scenario in Chromium, Firefox, and WebKit unless product requirements demand it.

Recommended model:

```text
Primary supported browser
-> broad PR/regression coverage

Other supported browsers
-> risk-based smoke/regression coverage

Full compatibility lane
-> scheduled where required
```

Browser coverage follows product compatibility commitments.

---

## 57. CI Architecture

### Pull Request

Run:

- Dependency/security checks.
- TypeScript.
- ESLint.
- Architecture validation.
- Flow validation.
- Framework/unit checks.
- Affected application smoke tests.
- Appropriate targeted tests.

### Main branch / scheduled regression

Run:

- Application regression.
- Sharding.
- Required browser projects.
- Hybrid API/UI coverage.
- Cross-app critical journeys.

### Scheduled quality lane

Run where required:

- Broader cross-browser coverage.
- Visual regression.
- Contract/integration tests.
- Quarantine lane.
- AI drift checks when customization changes.

Do not make every PR execute the entire enterprise portfolio unless the change actually requires it.

---

## 58. Parallelism and Sharding

Design tests for parallel execution from the beginning.

Use:

```text
unique data
independent browser contexts
worker-safe authentication
test-data leases
test locks only where necessary
```

Then use native Playwright workers, `fullyParallel` where appropriate, sharding, and projects.

Do not solve concurrency issues by setting `workers: 1` for the whole enterprise suite.

---

## 59. Test Isolation

A test must not require:

```text
another test to run first
another test to create its data
another test's browser context
previous global state
execution order
```

Use API setup, fixtures, unique data, TDM, `storageState`, and locks to maintain independence.

---

## 60. Security

Treat test artifacts as potentially sensitive.

Possible sensitive artifacts include:

```text
storageState
traces
screenshots
videos
network bodies
API responses
console messages
test data
```

Policies should define artifact access, retention, masking/redaction, encryption/storage, and cleanup.

Never commit passwords, tokens, credentials, production data, or `storageState` containing live credentials.

Secrets come from approved secret stores/environment injection.

---

## 61. AI Security

Community Skills and copied AI instructions are executable influence over engineering behavior.

Therefore:

```text
Review before adoption
Copy only approved guidance
Keep organization-owned versions
Record upstream source/revision
Review periodically
```

Do not automatically install external Playwright Skills and allow them to become a second policy authority.

### Enforcement mechanism

Policy without a check is a suggestion. Maintain a manifest, e.g. `docs/adr/skill-provenance.json`, recording for every file under `.github/skills/`: its upstream source (or "internal" if organization-authored), the upstream revision/commit hash it was curated from, the internal reviewer, and the review date. Add a CI check that fails when a Skill file's content hash no longer matches the manifest's recorded hash without a corresponding manifest update in the same PR — this doesn't prevent a human from approving a bad change, but it does prevent a Skill file from being silently edited (by a person or by an AI acting on a loosely-scoped edit permission) without that edit being visible as a reviewable, provenance-tracked diff.

---

## 62. Playwright Version Governance

Keep Playwright reasonably current.

Use an explicit upgrade process:

```text
Review release notes
       |
Update dependency/lockfile
       |
Review browser changes
       |
Run framework checks
       |
Run representative application suite
       |
Run critical journeys
       |
Run AI drift corpus
       |
Review internal Playwright Skill
       |
PR approval
```

New native functionality should periodically trigger the question:

> Can we delete one of our custom abstractions now?

That is healthy framework evolution.

---

## 63. Framework Metrics

Measure engineering health rather than test count.

Recommended metrics:

```text
first-attempt pass rate
flaky-test rate
retry dependency
quarantine count
quarantine age
mean time to diagnose
mean suite duration
flow coverage
critical-flow coverage
test-data setup failure rate
framework-rule violations
AI normalization acceptance/rework rate
```

Avoid using number of automated tests as the primary success metric. More tests do not necessarily mean better quality.

---

## 64. Definition of Done for a New Recorded Test

A test is not production-ready until:

- Business flow exists in `flows.json`.
- `@app` tag exists.
- `@flow` tag exists.
- Raw recording is not committed.
- Existing abstractions were searched.
- Locator strategy follows Playwright guidance.
- No arbitrary waits exist.
- Scenario is independently executable.
- Data strategy is defined.
- Authentication strategy is correct.
- Pages/Components/Workflows are appropriately separated.
- Application code did not leak into core.
- Scenario assertions remain understandable.
- Lint passes.
- TypeScript passes.
- Architecture validation passes.
- Flow validation passes.
- Targeted test passes.
- Human review is complete.

---

## 65. Pull Request Review Checklist

### Business

- Does this test actually verify the intended behavior?

### Playwright

- Are locators resilient?
- Are assertions web-first?
- Are waits condition-driven?
- Does test isolation hold?

### Architecture

- Was reuse checked?
- Is this Page correctly owned?
- Should this be a Component?
- Is this Workflow justified?
- Did app-specific code leak into core?

### Data

- Is data deterministic enough?
- Can parallel tests collide?
- Will resources be cleaned up?

### AI

- Did Copilot create unnecessary abstraction?
- Did generated code preserve intent?

---

## 66. Recommended Architecture Decision Records

Create ADRs for at least:

```text
ADR-001  One internal framework product / multi-app architecture
ADR-002  Core-to-application dependency boundary
ADR-003  Human-controlled Playwright recording
ADR-004  Playwright MCP exclusion (see section 5 — applies regardless of MCP shipping in Playwright core)
ADR-005  Playwright Agent CLI development-only policy
ADR-006  Native Planner/Generator/Healer exclusion (trade-off recorded in section 6)
ADR-007  flows.json as business-flow governance source
ADR-008  Pages do not mirror business-flow folders
ADR-009  Copilot authoring / deterministic runtime boundary
ADR-010  Community Skills curation policy (enforcement mechanism in section 61)
ADR-011  Cross-app public automation contracts
ADR-012  TDM + Playwright test-lock responsibilities (conflict arbitration in section 26)
```

These decisions are important enough that future teams should understand **why** they exist.

---

## 67. Framework Developer Experience

A new engineer should be able to answer within minutes:

- How do I add a test?
- How do I record a flow?
- What do I do with raw recorder output?
- How do I normalize it?
- Where does a Page belong?
- When do I create a Component?
- When do I create a Workflow?
- How do I provision data?
- How do I write an API test?
- How do I authenticate?
- How do I debug a failure?
- When can Copilot use Playwright assistance?
- What is prohibited?
- How do I contribute to core?

Provide:

```text
15-minute quick-start
recording tutorial
architecture decision tree
golden examples
Copilot Skill examples
TDM examples
API/UI example
cross-app example
failure-analysis playbook
```

---

## 68. Golden Example Suite

Maintain a very small set of exemplary tests.

Examples:

```text
simple UI test
multi-page Workflow test
API-only test
API setup + UI validation
multi-role test
TDM lease example
third-party mocked test
cross-app journey
visual test
failure-diagnostics example
```

These examples are valuable for developers, Copilot, code reviewers, and AI drift validation. Quality matters more than quantity.

---

## 69. Overengineering Guardrail

Before adding any framework abstraction, answer:

```text
What duplication does this eliminate?
What responsibility does this isolate?
What coupling does this reduce?
What lifecycle does this manage?
What developer experience does this improve?
Does Playwright already provide this capability?
```

If the answer is unclear:

```text
DO NOT ADD THE ABSTRACTION
```

---

## 70. Recommended Implementation Sequence

### Phase 1 - Correct the architectural foundation

Implement:

```text
decouple pages from flows
component layer
flow registry validation changes
public.ts cross-app boundary
module-boundary enforcement
Playwright coding rules
ADR set
```

### Phase 2 - Strengthen reusable engineering

Implement:

```text
optional workflows
fixture composition
multi-role authentication
API architecture
TDM lifecycle
test locks where truly needed
```

### Phase 3 - Build the Copilot authoring product

Implement:

```text
copilot-instructions
path instructions
internal Playwright Skill
recording-normalization Skill
reuse-analysis Skill
framework reviewer
failure analyst
golden examples
```

### Phase 4 - Diagnostics and scale

Implement:

```text
structured diagnostics
console/page-error capture
trace strategy
quarantine governance
isolated retry strategy
CI sharding
flow-level reporting
```

### Phase 5 - Controlled advanced developer assistance

Evaluate:

```text
Playwright Agent CLI assistance
approved wrapper commands
optional hooks
advanced Screencast
Perfetto diagnostics
```

Only introduce these after the foundational platform is stable.

---

## 71. Final Architecture

### Authoring and execution architecture

```text
                            +---------------------+
                            | BUSINESS REQUIREMENT|
                            +----------+----------+
                                       |
                                       v
                            +---------------------+
                            |       HUMAN         |
                            | understands flow    |
                            +----------+----------+
                                       |
                                       v
                         +----------------------------+
                         | Playwright VS Code Recorder|
                         +-------------+--------------+
                                       |
                                       v
                            +---------------------+
                            |   RAW RECORDING     |
                            +----------+----------+
                                       |
                                       v
                         +----------------------------+
                         |    GITHUB COPILOT CHAT     |
                         |                            |
                         | Best-Practices Skill       |
                         | Reuse Analysis             |
                         | Recording Normalization    |
                         | Framework Review           |
                         +-------------+--------------+
                                       |
                          Optional Development Assist
                                       |
                                       v
                         +----------------------------+
                         | Controlled Playwright Tools|
                         | Trace / Failure / Validation|
                         +-------------+--------------+
                                       |
                                       v
                            +---------------------+
                            |    HUMAN REVIEW     |
                            +----------+----------+
                                       |
                                       v
                         +----------------------------+
                         | DETERMINISTIC QUALITY GATES|
                         |                            |
                         | ESLint                     |
                         | TypeScript                 |
                         | Architecture               |
                         | Flow Registry              |
                         | Security                   |
                         +-------------+--------------+
                                       |
                                       v
                            +---------------------+
                            |     PR / MERGE      |
                            +----------+----------+
                                       |
                   ============= AI BOUNDARY =============
                                       |
                                       v
                            +---------------------+
                            |      PLAYWRIGHT     |
                            | deterministic tests |
                            +----------+----------+
                                       |
                                       v
                            +---------------------+
                            |      CI / CD        |
                            | parallel + sharded  |
                            +----------+----------+
                                       |
                                       v
                    +--------------------------------+
                    | REPORTS + TRACE + DIAGNOSTICS  |
                    +--------------------------------+
```

### Application architecture

```text
                         TEST
                          |
             +------------+------------+
             |            |            |
             v            v            v
         WORKFLOW        PAGE          API
             |            |            |
             |         COMPONENT       |
             |            |            |
             +------------+------------+
                          |
                       FIXTURES
                          |
                +---------+---------+
                |                   |
               TDM               SERVICES
                |                   |
                +---------+---------+
                          |
                    SHARED CORE
                          |
                       PLAYWRIGHT
```

---

## 72. Final Standard

The framework succeeds when teams no longer need to repeatedly decide:

```text
how Playwright tests should be structured
how recorded code should be cleaned
how data should be managed
how shared UI should be modeled
how API setup should work
how failures should be diagnosed
how Copilot should generate code
where common functionality belongs
```

because those decisions are encoded into:

```text
architecture
+
Playwright-native capabilities
+
repository structure
+
Copilot Skills
+
static enforcement
+
CI
+
human engineering review
```

The intended operating model is:

> **Humans define behavior.  
> Playwright records and executes.  
> Copilot accelerates engineering.  
> The framework governs reuse.  
> Deterministic tooling enforces quality.  
> CI remains authoritative.**

That is the final architectural direction.

---

# Reference Baseline

The blueprint should be periodically revalidated against the current versions of these sources:

1. **Official Playwright Best Practices**  
   https://playwright.dev/docs/best-practices

2. **Official Playwright Release Notes**  
   https://playwright.dev/docs/release-notes

3. **Official Playwright Test Agents documentation**  
   https://playwright.dev/docs/test-agents

4. **Official Playwright Agent CLI documentation**  
   https://playwright.dev/agent-cli/introduction

5. **Currents Playwright Best Practices Skill**  
   https://github.com/currents-dev/playwright-best-practices-skill

6. **TestDino Playwright Skill**  
   https://github.com/testdino-hq/playwright-skill

External community repositories remain reference material only. Organization-approved guidance should be curated into internal Skills and version-controlled with the framework.

---

## Revision Log

- **v1.1 (2026-09-07):** Closed six review gaps: (1) separated governance vs. cost rationale for restricting the Playwright Agent CLI and named the permission/sandbox layer as the actual enforcement point, not just wrapper commands (section 4.2); (2) clarified that the Playwright MCP prohibition holds even though MCP now ships inside Playwright core as of v1.62 (section 5); (3) resolved the tension between the full repository diagram and "create folders only when required" by stating the day-one minimal skeleton for a new application (section 7); (4) added lock/lease conflict arbitration rules (section 26); (5) gave the AI drift corpus an owner, trigger, threshold, and shipping gate (section 45); (6) added a provenance-manifest enforcement mechanism for community Skill curation (section 61). Also consolidated the three overlapping "AI must never do X" lists into one canonical list (section 4.2) referenced by sections 5 and 6, named the Copilot-specific coupling in sections 35 and 44, and recorded the accepted trade-off of excluding native Planner/Generator/Healer (section 6).
