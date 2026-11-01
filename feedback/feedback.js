// Sends bug reports and feature requests to the Cedar feedback service, which posts them in the Cedar
// Discord's public forums. Staff-only details stay private. Nothing is stored in the browser.
const ENDPOINT = "https://cedar-feedback.cedar-feedback.workers.dev/v1/feedback";

const form = document.querySelector("[data-feedback-form]");
const statusLine = document.querySelector("[data-feedback-status]");
const done = document.querySelector("[data-feedback-done]");
const submitButton = form.querySelector('button[type="submit"]');
const openedAt = Date.now();

const errorMessages = {
  invalid_title: "Add a short summary (at least 3 characters).",
  invalid_details: "Add a few more details (at least 10 characters).",
  invalid_platform: "Choose which app this is about.",
  invalid_app_version: "The app version should look like 1.0.0 (80).",
  invalid_staff_only: "Shorten the staff-only details to 1,000 characters.",
  rate_limited: "That was quick. Wait a minute, then try again.",
  daily_limit_reached: "You’ve sent a lot today. Please try again tomorrow.",
};

const syncKind = () => {
  const kind = form.elements.kind.value;
  form.elements.title.placeholder = form.elements.title.dataset[kind === "bug" ? "kindPlaceholderBug" : "kindPlaceholderFeature"];
  const label = form.querySelector("[data-kind-label-bug]");
  label.textContent = label.dataset[kind === "bug" ? "kindLabelBug" : "kindLabelFeature"];
};

const localProblem = () => {
  const { platform, title, details } = form.elements;
  if (!platform.value) return [platform, errorMessages.invalid_platform];
  if (title.value.trim().length < 3) return [title, errorMessages.invalid_title];
  if (details.value.trim().length < 10) return [details, errorMessages.invalid_details];
  return null;
};

// Links such as feedback/?kind=feature open the form on that choice.
const requestedKind = new URLSearchParams(location.search).get("kind");
if (requestedKind === "bug" || requestedKind === "feature") {
  form.elements.kind.value = requestedKind;
  syncKind();
}

form.addEventListener("change", (event) => {
  if (event.target.name === "kind") syncKind();
});

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  const problem = localProblem();
  if (problem) {
    statusLine.textContent = problem[1];
    problem[0].focus();
    return;
  }
  const value = (name) => form.elements[name].value.trim();
  const payload = {
    schemaVersion: 1,
    kind: form.elements.kind.value,
    platform: value("platform"),
    title: value("title"),
    details: value("details"),
    elapsedMs: Date.now() - openedAt,
    publicPost: true,
  };
  if (value("staffOnly")) payload.staffOnly = value("staffOnly");
  if (value("appVersion")) payload.appVersion = value("appVersion");
  if (form.elements.website.value) payload.website = form.elements.website.value;

  submitButton.disabled = true;
  statusLine.textContent = "Sending…";
  try {
    const response = await fetch(ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      credentials: "omit",
      referrerPolicy: "no-referrer",
    });
    const result = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(errorMessages[result.error] ?? "That didn’t send. Please try again, or post it on Discord.");
    form.reset();
    syncKind();
    statusLine.textContent = "";
    form.hidden = true;
    done.querySelector("[data-feedback-reference]").textContent = result.reference ?? "";
    // Only a Discord link from the service is offered as the post.
    const post = typeof result.postURL === "string" && result.postURL.startsWith("https://discord.com/channels/") ? result.postURL : null;
    done.querySelector("[data-feedback-post]").hidden = !post;
    if (post) done.querySelector("[data-feedback-post-link]").href = post;
    done.hidden = false;
    done.focus();
  } catch (error) {
    statusLine.textContent = error instanceof TypeError
      ? "Couldn’t reach the feedback service. Check your connection and try again."
      : error.message;
  } finally {
    submitButton.disabled = false;
  }
});

document.querySelector("[data-feedback-again]").addEventListener("click", () => {
  done.hidden = true;
  form.hidden = false;
  form.elements.title.focus();
});

syncKind();
form.hidden = false;
