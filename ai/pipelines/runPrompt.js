require("dotenv").config({
  path: require("path").resolve(__dirname, "../../apps/backend/.env"),
});

const fs = require("fs");
const path = require("path");
const OpenAI = require("openai");

const MOCK_AI_ENABLED = String(process.env.MOCK_AI || "").toLowerCase() === "true";
const FALLBACK_TO_MOCK_ON_429 =
  String(process.env.FALLBACK_TO_MOCK_ON_429 || "true").toLowerCase() !== "false";

const createMockResponse = (promptFile, input) => {
  const language = input?.language === "en" ? "en" : "ua";

  switch (promptFile) {
    case "requirements_analyzer.md":
      return language === "en"
        ? [
            "# Functional Requirements",
            "- Submit tender application",
            "- Review supplier proposal",
            "",
            "# Non-Functional Requirements",
            "- Support 10000 concurrent users",
            "- Maintain complete audit logging",
            "",
            "# External Integrations",
            "- Government registry lookup",
            "- SSO identity provider",
            "",
            "# Security Requirements",
            "- Role-based access control",
            "- Encryption at rest and in transit",
          ].join("\n")
        : [
            "# Функціональні вимоги",
            "- Подання тендерної заявки",
            "- Перевірка пропозиції постачальника",
            "",
            "# Нефункціональні вимоги",
            "- Підтримка 10000 одночасних користувачів",
            "- Повне аудитне журналювання",
            "",
            "# Зовнішні інтеграції",
            "- Інтеграція з державним реєстром",
            "- Підключення до SSO-провайдера",
            "",
            "# Вимоги безпеки",
            "- Рольова модель доступу",
            "- Шифрування даних під час передавання та зберігання",
          ].join("\n");
    case "actor_detector.md":
      return language === "en"
        ? "Actors: Procurement Officer, Evaluator, Supplier"
        : "Учасники: фахівець із закупівель, оцінювач, постачальник";
    case "architecture_pattern_detector.md":
      return language === "en"
        ? "Patterns: CQRS, layered architecture, service orchestration"
        : "Патерни: CQRS, шарова архітектура, оркестрація сервісів";
    case "pbs_generator.md":
      return language === "en"
        ? "PBS: Tender Portal, Evaluation Workflow, Reporting, Integration Layer"
        : "PBS: тендерний портал, процес оцінювання, звітність, інтеграційний шар";
    case "domain_model_generator.md":
      return language === "en"
        ? "Domain Model: Tender, Submission, Evaluation, Contract, AuditEvent"
        : "Модель домену: тендер, заявка, оцінювання, контракт, подія аудиту";
    case "architecture_designer.md":
      return language === "en"
        ? "Architecture: React frontend, backend services, integration layer, read models, audit services"
        : "Архітектура: фронтенд React, бекенд-сервіси, інтеграційний шар, read-моделі, сервіси аудиту";
    case "database_designer.md":
      return language === "en"
        ? "Database: PostgreSQL operational store, read-model projections, audit storage"
        : "База даних: операційне сховище PostgreSQL, проєкції read-моделей, сховище аудиту";
    case "api_designer.md":
      return language === "en"
        ? "API: REST endpoints for tenders, submissions, evaluations, reporting, integrations"
        : "API: REST-ендпоїнти для тендерів, заявок, оцінювання, звітності та інтеграцій";
    case "traceability_mapper.md":
      return language === "en"
        ? "Traceability: Requirements mapped to PBS, architecture, API, and database"
        : "Трасування: вимоги зіставлено з PBS, архітектурою, API та базою даних";
    case "architecture_reviewer.md":
      return language === "en"
        ? "Review: Architecture is feasible and aligned with enterprise delivery practices"
        : "Рецензія: архітектура є реалістичною та узгодженою з практиками корпоративної розробки";
    case "estimator.md":
      return language === "en"
        ? [
            "## Team Structure",
            "",
            "- Solution Architect",
            "- Backend Developers",
            "- Frontend Developer",
            "- QA Engineer",
            "",
            "## Project Timeline",
            "",
            "- 6 months estimated duration",
            "",
            "## Summary",
            "",
            "- Indicative implementation cost requires commercial confirmation",
          ].join("\n")
        : [
            "## Структура команди",
            "",
            "- Архітектор рішення",
            "- Backend-розробники",
            "- Frontend-розробник",
            "- QA-інженер",
            "",
            "## Графік проєкту",
            "",
            "- Орієнтовна тривалість 6 місяців",
            "",
            "## Підсумок",
            "",
            "- Орієнтовна вартість потребує комерційного підтвердження",
          ].join("\n");
    case "project_manager.md":
      return language === "en"
        ? [
            "## Project Phases",
            "",
            "- Discovery and architecture",
            "- Iterative implementation",
            "- Testing and deployment",
            "",
            "## Risks",
            "",
            "- Integration dependency delays",
            "",
            "## Dependencies",
            "",
            "- Approved architecture baseline",
            "",
            "## Milestones",
            "",
            "- Architecture sign-off",
            "- MVP release",
          ].join("\n")
        : [
            "## Етапи проєкту",
            "",
            "- Уточнення вимог та архітектура",
            "- Ітеративна реалізація",
            "- Тестування та впровадження",
            "",
            "## Ризики",
            "",
            "- Затримки залежностей інтеграції",
            "",
            "## Залежності",
            "",
            "- Затверджена архітектурна база",
            "",
            "## Контрольні точки",
            "",
            "- Погодження архітектури",
            "- Випуск MVP",
          ].join("\n");
    case "proposal_writer.md":
      return language === "en"
        ? "Technical proposal: enterprise tender solution delivery plan."
        : "Технічна пропозиція: план реалізації корпоративного тендерного рішення.";
    case "proposal/sections/general_information.md":
      return [
        language === "en"
          ? "The project covers implementation of an information system aligned with the tender objectives and operational context."
          : "Проєкт охоплює створення інформаційної системи відповідно до цілей тендера та операційного контексту замовника.",
        language === "en"
          ? "The solution targets customer stakeholders, administrators, operators, and related organizations."
          : "Рішення орієнтоване на замовника, адміністраторів, операторів та пов’язані організації.",
      ].join("\n\n");
    case "proposal/sections/business_processes.md":
      return [
        language === "en"
          ? "The target solution supports the key business workflows, participant roles, approvals, and operational handoffs."
          : "Запропоноване рішення охоплює основні робочі процеси, ролі учасників, маршрути погодження та операційні передачі.",
        language === "en"
          ? "Automation points and control checkpoints are derived from the tender processes and architecture outputs."
          : "Точки автоматизації та контрольні етапи визначаються на основі тендерних процесів і архітектурних артефактів.",
      ].join("\n\n");
    case "proposal/sections/system_requirements.md":
      return [
        language === "en"
          ? "Functional requirements cover the core user journeys, roles, integrations, and operational capabilities."
          : "Функціональні вимоги охоплюють ключові користувацькі сценарії, ролі, інтеграції та операційні можливості.",
        language === "en"
          ? "Non-functional requirements include security, auditability, performance, reliability, scalability, and supportability."
          : "Нефункціональні вимоги включають безпеку, аудитованість, продуктивність, надійність, масштабованість і супровідність.",
      ].join("\n\n");
    case "proposal/sections/architecture_solution.md":
      return [
        language === "en"
          ? "The architecture separates presentation, application, integration, and data responsibilities across distinct service boundaries."
          : "Архітектурне рішення розділяє відповідальності між рівнем представлення, прикладною логікою, інтеграційним шаром та даними.",
        language === "en"
          ? "Dedicated services support domain logic, integrations, audit, API exposure, and persistence."
          : "Окремі сервіси покривають доменну логіку, інтеграції, аудит, API та зберігання даних.",
      ].join("\n\n");
    case "proposal/sections/implementation_plan.md":
      return [
        language === "en"
          ? "The implementation plan includes clarification, design, development, integration, testing, deployment, and support phases."
          : "План реалізації включає етапи уточнення вимог, проєктування, розробки, інтеграції, тестування, впровадження та супроводу.",
        language === "en"
          ? "Each phase defines milestones, responsible roles, dependencies, and expected outcomes."
          : "Для кожного етапу визначаються контрольні точки, відповідальні ролі, залежності та очікувані результати.",
      ].join("\n\n");
    case "proposal/sections/acceptance_process.md":
      return [
        language === "en"
          ? "Acceptance is performed through formal verification, testing evidence, and documented approval procedures."
          : "Контроль і приймання виконуються через формалізовану перевірку, результати тестування та процедури погодження.",
        language === "en"
          ? "Acceptance criteria are derived from traced requirements and validation scenarios."
          : "Критерії приймання формуються на основі трасування вимог і сценаріїв валідації.",
      ].join("\n\n");
    case "proposal/sections/deployment_requirements.md":
      return [
        language === "en"
          ? "Deployment requires prepared environments, secured access, infrastructure readiness, migration planning, and user enablement."
          : "Впровадження потребує підготовки середовищ, налаштування доступів, готовності інфраструктури, плану міграції та підготовки користувачів.",
        language === "en"
          ? "The section also defines infrastructure, administration, and production rollout prerequisites."
          : "Окремо визначаються вимоги до інфраструктури, адміністрування та запуску в промислову експлуатацію.",
      ].join("\n\n");
    case "proposal/sections/documentation_requirements.md":
      return [
        language === "en"
          ? "The documentation package includes technical, user, administrator, operator, testing, and support materials."
          : "Комплект документації має включати технічний опис, настанови користувача, адміністратора, оператора, матеріали з тестування та документи супроводу.",
        language === "en"
          ? "Documentation must support deployment, operations, training, and system acceptance."
          : "Документація повинна бути достатньою для впровадження, експлуатації, навчання та приймання системи.",
      ].join("\n\n");
    default:
      return language === "en"
        ? `Mock output for ${promptFile}`
        : `Тестовий результат для ${promptFile}`;
  }
};

let openai = null;

if (!MOCK_AI_ENABLED) {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error(
      "OPENAI_API_KEY is not defined. Check apps/backend/.env or enable MOCK_AI=true",
    );
  }

  openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });
}

async function runPrompt(promptFile, input) {
  if (MOCK_AI_ENABLED) {
    return createMockResponse(promptFile, input);
  }

  const promptPath = path.join(__dirname, "../prompts", promptFile);
  const prompt = fs.readFileSync(promptPath, "utf8");
  const languageInstruction = input?.language
    ? `Respond only in ${input.language === "ua" ? "Ukrainian" : "English"}.`
    : "";

  const fullPrompt = `

You are a senior enterprise architect.
${languageInstruction}

========================
TASK
========================

${prompt}

========================
INPUT
========================

${JSON.stringify(input, null, 2)}

`;

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      temperature: 0.2,
      messages: [{ role: "user", content: fullPrompt }],
    });

    return completion.choices[0].message.content;
  } catch (error) {
    if (error?.status === 429) {
      if (FALLBACK_TO_MOCK_ON_429) {
        console.warn(
          `OpenAI quota/rate-limit hit for ${promptFile}. Falling back to mock output.`,
        );
        return createMockResponse(promptFile, input);
      }

      throw new Error(
        "OpenAI quota exceeded. Update billing or enable MOCK_AI=true in apps/backend/.env.",
      );
    }

    throw error;
  }
}

module.exports = runPrompt;
