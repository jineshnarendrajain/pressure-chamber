if (new URLSearchParams(window.location.search).get('pi') === '1') {
  document.documentElement.classList.add('pi-mode');
}

const appState = {
  userName: "",
  language: "en",
  translations: {},
  tasks: [],
  completedTasks: [],
  scores: {},
  currentTask: null,
  currentBiasGame: null,
  biasGames: [],
  biasModeActive: false,
  total: 0,
};

const screens = {
  start: document.getElementById("screen-start"),
  introVideo: document.getElementById("screen-intro-video"),
  instructionChoice: document.getElementById("screen-instruction-choice"),
  instructionVideo: document.getElementById("screen-instruction-video"),
  language: document.getElementById("screen-language"),
  hub: document.getElementById("screen-hub"),
  biasGames: document.getElementById("screen-bias-games"),
  biasPlay: document.getElementById("screen-bias-play"),
  prompt: document.getElementById("screen-prompt"),
  result: document.getElementById("screen-result"),
  final: document.getElementById("screen-final"),
  leaderboard: document.getElementById("screen-leaderboard"),
};

const els = {
  username: document.getElementById("username"),
  startBtn: document.getElementById("start-btn"),

  skipIntroBtn: document.getElementById("skip-intro-btn"),
  replayIntroBtn: document.getElementById("replay-intro-btn"),
  continueFromIntroBtn: document.getElementById("continue-from-intro-btn"),
  introVideo: document.getElementById("intro-video"),

  playInstructionBtn: document.getElementById("play-instruction-btn"),
  skipToSetupBtn: document.getElementById("skip-to-setup-btn"),

  backInstructionChoiceBtn: document.getElementById("back-instruction-choice-btn"),
  replayInstructionBtn: document.getElementById("replay-instruction-btn"),
  continueToLanguageBtn: document.getElementById("continue-to-language-btn"),
  instructionVideo: document.getElementById("instruction-video"),

  taskGrid: document.getElementById("task-grid"),
  promptTitle: document.getElementById("prompt-title"),
  promptTaskId: document.getElementById("prompt-task-id"),
  promptInstruction: document.getElementById("prompt-instruction"),
  promptInput: document.getElementById("prompt-input"),
  charCounter: document.getElementById("char-counter"),
  generateBtn: document.getElementById("generate-btn"),

  generatedImage: document.getElementById("generated-image"),
  targetImage: document.getElementById("target-image"),
  targetLabel: document.querySelector('.result-left h3'),
  scoreLine: document.getElementById("score-line"),
  resultTaskId: document.getElementById("result-task-id"),
  resultScore: document.getElementById("result-score"),
  biasLine: document.getElementById("bias-line"),
  explanationLine: document.getElementById("explanation-line"),
  promptLine: document.getElementById("prompt-line"),
  backHubBtn: document.getElementById("back-hub-btn"),

  finalUser: document.getElementById("final-user"),
  finalList: document.getElementById("final-list"),
  finalTotal: document.getElementById("final-total"),
  viewLeaderboardBtn: document.getElementById("view-leaderboard-btn"),
  leaderboardList: document.getElementById("leaderboard-list"),
  resetBtn: document.getElementById("reset-btn"),

  backLanguage: document.getElementById("back-language"),
  backHub: document.getElementById("back-hub"),
  backPrompt: document.getElementById("back-prompt"),
  backResult: document.getElementById("back-result"),
  backFinal: document.getElementById("back-final"),
  backLeaderboard: document.getElementById("back-leaderboard"),
  openBiasPlaygroundBtn: document.getElementById("open-bias-playground-btn"),
  backBiasGamesBtn: document.getElementById("back-bias-games-btn"),
  biasGamesGrid: document.getElementById("bias-games-grid"),

  loadingOverlay: document.getElementById("loading-overlay"),
};

let currentGenerateController = null;
let biasGameTransitionTimer = null;
let biasExplanationData = {};

async function loadBiasExplanations() {
  try {
    const res = await fetch("/data/bias_explanations.json");
    biasExplanationData = await res.json();
  } catch {
    biasExplanationData = {};
  }
}

// === BIAS PLAYGROUND ADDITION START ===
const PLACEHOLDER_IMAGE = "/images/placeholder.png";
const BIAS_DATA_PATH = "/data/tasks_2.json";

async function loadBiasGames() {
  try {
    const res = await fetch(BIAS_DATA_PATH);
    const payload = await res.json();
    const loadedGames = Array.isArray(payload)
      ? payload.map((game) => ({
          ...game,
          instruction: game.instruction || game.prompt || "Write a prompt for this bias scenario.",
          bias: game.bias || "Bias Playground",
          category: game.category || "Bias Playground",
        }))
      : [];

    appState.biasGames = loadedGames
      .sort(() => Math.random() - 0.5)
      .slice(0, 3);
  } catch {
    appState.biasGames = [];
  }
  renderBiasGames();
}

function renderBiasGames() {
  els.biasGamesGrid.innerHTML = "";
  if (!appState.biasGames.length) {
    const message = document.createElement("p");
    message.className = "helper-text";
    message.textContent = t("biasGamesUnavailable");
    els.biasGamesGrid.appendChild(message);
    return;
  }

  appState.biasGames.forEach((game) => {
    const card = document.createElement("article");
    card.className = "card bias-card";
    card.innerHTML = `
      <div class="task-card-top">
        <div class="task-meta">
          <h3>${gameText(game, "title")}</h3>
          <p class="task-category">${game.instruction}</p>
          <p class="task-bias">${t("biasPrefix")} ${game.bias}</p>
        </div>
      </div>
      <button class="button btn primary-btn" type="button">${t("playBtn")}</button>
    `;

    card.querySelector("button").addEventListener("click", () => openBiasGame(game));
    els.biasGamesGrid.appendChild(card);
  });
}

const BIAS_TASK_ID_MAP = {
  bias_1: "bias_1",
  bias_2: "bias_2",
  bias_3: "bias_3",
  bias_4: "bias_4",
  bias_5: "bias_5",
  bias_6: "bias_6",
};

function getBiasTaskId(game) {
  return game.mappedTaskId || BIAS_TASK_ID_MAP[game.id] || game.id;
}

function openBiasGame(game) {
  appState.currentBiasGame = game;
  const biasTaskId = getBiasTaskId(game);
  appState.currentTask = {
    ...game,
    id: biasTaskId,
    instruction: game.instruction || game.prompt || "Write a prompt for this bias game.",
    category: game.category || "Bias Playground",
    bias: game.bias || "Bias Playground",
  };

  els.promptTitle.textContent = game.title;
  els.promptTaskId.textContent = `Bias Task: ${biasTaskId}`;
  els.promptInstruction.textContent = appState.currentTask.instruction;
  els.promptInput.value = "";
  els.charCounter.textContent = "0/200";
  showScreen("prompt");
}


function initializeBiasPlayground() {
  els.openBiasPlaygroundBtn?.addEventListener("click", () => {
    loadBiasGames();
    showScreen("biasGames");
  });

  // NOTE: showScreen("hub") here is intentional for backBiasGamesBtn only.
  // NEVER use showScreen("hub") or renderTaskHub() from screen-result's back button — see backHubBtn handler.
  els.backBiasGamesBtn?.addEventListener("click", () => {
    showScreen("hub");
  });

  initBiasCardDelegation();
}

initializeBiasPlayground();
// === BIAS PLAYGROUND ADDITION END ===

function showScreen(name) {
  Object.values(screens).forEach((screen) => {
    if (screen) screen.classList.remove("active");
  });
  if (screens[name]) screens[name].classList.add("active");

  if (name === "introVideo" && els.introVideo) {
    els.introVideo.currentTime = 0;
    els.introVideo.load();
    els.introVideo.play().catch(() => {});
  } else if (name === "instructionVideo" && els.instructionVideo) {
    els.instructionVideo.currentTime = 0;
    els.instructionVideo.load();
    els.instructionVideo.play().catch(() => {});
  }
}

function showLoading(active) {
  els.loadingOverlay.classList.toggle("active", active);
  els.loadingOverlay.setAttribute("aria-hidden", active ? "false" : "true");
}

function t(key) {
  return appState.translations?.[appState.language]?.[key] || key;
}

function applyTranslations() {
  document.querySelectorAll("[data-t]").forEach((el) => {
    el.textContent = t(el.dataset.t);
  });
  document.querySelectorAll("[data-t-placeholder]").forEach((el) => {
    el.placeholder = t(el.dataset.tPlaceholder);
  });
  updateLangSwitcher();
}

function updateProgressIndicator() {
  const completed = appState.completedTasks.length;
  const dots = [0, 1, 2].map((idx) => (idx < completed ? "●" : "○")).join(" ");
  document.querySelectorAll("[data-progress]").forEach((el) => {
    el.textContent = dots;
  });
}

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function loadTranslations() {
  const res = await fetch("/data/translations.json");
  appState.translations = await res.json();
  loadLanguageFromStorage();
  applyTranslations();
}

function loadLanguageFromStorage() {
  const saved = localStorage.getItem("pc_language");
  if (saved && appState.translations?.[saved]) {
    appState.language = saved;
  }
}

function persistLanguage(lang) {
  localStorage.setItem("pc_language", lang);
}

function updateLangSwitcher() {
  document.querySelectorAll(".lang-pill").forEach((pill) => {
    pill.classList.toggle("active", pill.dataset.lang === appState.language);
  });
}

async function startSession() {
  let tasks = [];
  try {
    const res = await fetch("/start", { method: "POST" });
    const payload = await res.json();
    tasks = payload.tasks || [];
  } catch {
    const fallbackRes = await fetch("/data/tasks_2.json");
    tasks = await fallbackRes.json();
    tasks = (tasks || []).sort(() => Math.random() - 0.5).slice(0, 3);
  }

  appState.tasks = tasks.slice(0, 3);
  appState.completedTasks = [];
  appState.scores = {};
  appState.currentTask = null;
  updateProgressIndicator();
  renderTaskHub();
}

function renderTaskHub() {
  els.taskGrid.innerHTML = "";
  if (els.taskGrid) {
    els.taskGrid.style.display = "none";
  }
}

function updateCounter() {
  els.charCounter.textContent = `${els.promptInput.value.length}/200`;
}

function applyScoreColor(score) {
  els.resultScore.classList.remove("score-low", "score-mid", "score-high");
  if (score < 40) {
    els.resultScore.classList.add("score-low");
  } else if (score < 70) {
    els.resultScore.classList.add("score-mid");
  } else {
    els.resultScore.classList.add("score-high");
  }
}

async function submitPrompt() {
  // NOTE: showScreen("hub") here is a guard for missing task state only.
  // NEVER use showScreen("hub") or renderTaskHub() from screen-result's back button — see backHubBtn handler.
  if (!appState.currentTask) {
    showScreen("hub");
    return;
  }

  const prompt = els.promptInput.value.trim();
  if (!prompt) {
    alert(t("alertEmptyPrompt"));
    return;
  }

  showLoading(true);
  currentGenerateController = new AbortController();

  try {
    const [res] = await Promise.all([
      fetch("/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt, task_id: appState.currentTask.id }),
        signal: currentGenerateController.signal,
      }),
      delay(2000),
    ]);

    const payload = await res.json();

    if (!res.ok) {
      throw new Error(payload.error || "Image generation failed.");
    }

    if (String(payload.task_id) !== String(appState.currentTask.id)) {
      throw new Error("Task response mismatch");
    }

    const score = Number(payload.score || 0);
    const generatedUrl = payload.generated_image_url || payload.generated_image;
    let biasScore = null;

    if (!appState.completedTasks.includes(appState.currentTask.id)) {
      appState.completedTasks.push(appState.currentTask.id);
    }

    appState.scores[appState.currentTask.id] = score;
    updateProgressIndicator();

    const isBiasPlay = appState.currentTask?.category === "Bias Playground";

    els.generatedImage.loading = "lazy";
    els.targetImage.loading = "lazy";
    if (isBiasPlay) {
      const biasFolder = `bias_${appState.currentTask.cardIndex + 1}`;

      let files = [];
      try {
        const fakeRes = await fetch(`/fake-generated/${biasFolder}`);
        const fakeData = await fakeRes.json();
        files = Array.isArray(fakeData.images) ? fakeData.images : [];
      } catch {
        files = [];
      }

      let chosenFile = null;
      if (files.length) {
        const stripExt = (name) => name.replace(/\.[^.]+$/, "").toLowerCase();
        const pickMatch = (baseNames) => {
          const wanted = (Array.isArray(baseNames) ? baseNames : []).map((b) => String(b).toLowerCase());
          const matches = files.filter((f) => wanted.includes(stripExt(f)));
          return matches.length ? matches[Math.floor(Math.random() * matches.length)] : null;
        };

        const rules = (await getFakeGenRules())[biasFolder] || {};
        const promptLower = prompt.toLowerCase();

        // c. keyword rules — first rule whose keyword is a substring of the prompt
        const keywordRules = Array.isArray(rules.keyword_rules) ? rules.keyword_rules : [];
        for (const rule of keywordRules) {
          const keywords = Array.isArray(rule.keywords) ? rule.keywords : [];
          if (keywords.some((kw) => promptLower.includes(String(kw).toLowerCase()))) {
            chosenFile = pickMatch(rule.images);
            break;
          }
        }

        // d. length rules — first rule whose [min, max] contains the prompt length
        if (!chosenFile) {
          const lengthRules = Array.isArray(rules.length_rules) ? rules.length_rules : [];
          for (const rule of lengthRules) {
            const min = typeof rule.min === "number" ? rule.min : 0;
            const max = rule.max === null || rule.max === undefined ? Infinity : rule.max;
            if (prompt.length >= min && prompt.length <= max) {
              chosenFile = pickMatch(rule.images);
              break;
            }
          }
        }

        // e. fallback — random from files not reserved by any keyword rule
        if (!chosenFile) {
          const reserved = new Set();
          keywordRules.forEach((rule) => {
            (Array.isArray(rule.images) ? rule.images : []).forEach((b) => reserved.add(String(b).toLowerCase()));
          });
          const unreserved = files.filter((f) => !reserved.has(stripExt(f)));
          const pool = unreserved.length ? unreserved : files;
          chosenFile = pool[Math.floor(Math.random() * pool.length)];
        }
      }

      if (chosenFile) {
        const strippedChosen = chosenFile.replace(/\.[^.]+$/, "").toLowerCase();
        const rules = (await getFakeGenRules())[biasFolder] || {};
        const keywordRules = Array.isArray(rules.keyword_rules)
          ? rules.keyword_rules : [];

        // Build set of all reserved true image base names
        const trueBaseNames = new Set();
        keywordRules.forEach(rule => {
          (rule.images || []).forEach(img =>
            trueBaseNames.add(img.toLowerCase()));
        });

        const isTrue = trueBaseNames.has(strippedChosen);

        if (isTrue) {
          // Keyword-matched true image: score 85–95
          biasScore = Math.floor(Math.random() * 11) + 85;
        } else {
          // Default/fallback image: score 20–65
          biasScore = Math.floor(Math.random() * 46) + 20;
        }

        // Cap bias_3 and bias_5 always below 70
        if (biasFolder === "bias_3" || biasFolder === "bias_5") {
          biasScore = Math.min(biasScore, 65);
        }

        appState.scores[appState.currentTask.id] = biasScore;
      }

      if (chosenFile) {
        els.generatedImage.style.display = "block";
        els.generatedImage.src = `/images/fake_generated/${biasFolder}/${chosenFile}`;
      } else {
        els.generatedImage.removeAttribute("src");
        els.generatedImage.style.display = "none";
      }
    } else {
      els.generatedImage.style.display = "block";
      els.generatedImage.src = generatedUrl;
    }

    if (isBiasPlay) {
      const targetSources = appState.currentTask.target_image_candidates || [appState.currentTask.target_image];
      let targetSourceIndex = 0;

      els.targetImage.onerror = () => {
        targetSourceIndex += 1;
        if (targetSourceIndex < targetSources.length) {
          els.targetImage.src = targetSources[targetSourceIndex];
          return;
        }

        els.targetImage.removeAttribute("src");
        els.targetImage.style.display = "none";
      };

      els.targetImage.onload = () => {
        els.targetImage.style.display = "block";
      };

      els.targetImage.src = targetSources[targetSourceIndex];
    } else {
      els.targetImage.onerror = null;
      els.targetImage.onload = null;
      els.targetImage.style.display = "block";
      els.targetImage.src = payload.target_image || generatedUrl;
    }

    if (isBiasPlay) {
      els.resultTaskId.textContent = `${t("biasModeResult")} — ${payload.task_title || gameText(appState.currentBiasGame, "title")}`;
      els.resultScore.classList.add("score-bias-mode");
    } else {
      els.resultTaskId.textContent = `${t("taskIdLabel")}: ${payload.task_id} - ${payload.task_title || appState.currentTask.title}`;
      els.resultScore.classList.remove("score-bias-mode");
    }

    if (isBiasPlay) {
      if (biasScore !== null) {
        els.resultScore.style.display = "block";
        els.scoreLine.style.display = "block";
        els.resultScore.textContent = `${biasScore}`;
        applyScoreColor(biasScore);
        els.scoreLine.textContent = `${t("similarityScore")}: ${biasScore}`;
      } else {
        els.resultScore.style.display = "none";
        els.scoreLine.style.display = "none";
      }
    } else {
      els.resultScore.style.display = "block";
      els.scoreLine.style.display = "block";
      els.resultScore.textContent = `${score}`;
      applyScoreColor(score);
      els.scoreLine.textContent = `${t("similarityScore")}: ${score}`;
    }
    if (isBiasPlay) {
      const filterData = biasExplanationData[appState.currentTask.filterType];
      const lang = appState.language || "en";
      const data = (filterData && (filterData[lang] || filterData["en"])) || {
        title: (appState.currentBiasGame && gameText(appState.currentBiasGame, "bias")) || "Bias Pattern",
        description: "",
      };

      els.biasLine.textContent = `${t("biasCategory")}: ${data.title}`;
      els.explanationLine.textContent = data.description;
    } else {
      els.biasLine.textContent = `${t("biasCategory")}: ${payload.bias || appState.currentTask.bias || "Bias Pattern"}`;
      els.explanationLine.textContent = payload.explanation || "This output reflects embedded data bias patterns.";
    }
    els.promptLine.textContent = `${t("promptUsed")}: ${payload.user_prompt || prompt}`;

    if (appState.currentTask.id === 5) {
      els.targetLabel.textContent = "Reference";
    } else {
      els.targetLabel.textContent = t("targetLabel");
    }

    showScreen("result");
  } catch (err) {
    if (err.name !== "AbortError") {
      alert(err.message || t("alertGenerationFailed"));
    }
    showScreen("prompt");
  } finally {
    showLoading(false);
    currentGenerateController = null;
  }
}

function showFinal() {
  const rows = appState.tasks
    .filter((task) => appState.completedTasks.includes(task.id))
    .map((task) => ({ title: task.title, score: appState.scores[task.id] || 0 }));

  const total = rows.length
    ? Math.round(rows.reduce((sum, item) => sum + item.score, 0) / rows.length)
    : 0;

  appState.total = total;
  els.finalUser.textContent = appState.userName;
  els.finalList.innerHTML = rows.map((row) => `<p>${row.title}: ${row.score}</p>`).join("");
  els.finalTotal.textContent = `${t("totalScore")}: ${total}`;
  showScreen("final");
}

async function loadLeaderboard() {
  await fetch("/leaderboard", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name: appState.userName || "Guest", score: appState.total || 0 }),
  });

  const res = await fetch("/leaderboard");
  const payload = await res.json();
  els.leaderboardList.innerHTML = (payload.leaderboard || [])
    .map((entry) => `<li>${entry.name} - ${entry.score}</li>`)
    .join("");
}

function pauseAllVideos() {
  [els.introVideo, els.instructionVideo].forEach((video) => {
    if (!video) return;
    video.pause();
  });
}

async function playVideo(videoEl) {
  if (!videoEl) return;
  try {
    videoEl.currentTime = 0;
    await videoEl.play();
  } catch (err) {
    console.warn("Video play blocked:", err);
  }
}

async function enterBiasChamber() {
  pauseAllVideos();
  await startSession();
  loadBiasGames();
  showScreen("biasGames");
}

function resetApp() {
  if (currentGenerateController) currentGenerateController.abort();
  pauseAllVideos();
  document.querySelectorAll("video").forEach((v) => {
    v.currentTime = 0;
    v.load();
    v.pause();
  });

  appState.userName = "";
  appState.language = "en";
  appState.tasks = [];
  appState.completedTasks = [];
  appState.scores = {};
  appState.currentTask = null;
  appState.currentBiasGame = null;
  appState.biasGames = [];
  appState.biasModeActive = false;
  appState.total = 0;

  els.username.value = "";
  updateProgressIndicator();
  applyTranslations();
  document.querySelectorAll(".lang-btn").forEach((btn) => btn.classList.remove("is-selected"));
  updateLangSwitcher();
  showScreen("introVideo");
}

els.startBtn.addEventListener("click", async () => {
  const name = els.username.value.trim();
  if (!name) {
    alert(t("alertEmptyUsername"));
    return;
  }

  appState.userName = name;
  showScreen("instructionChoice");
});

els.skipIntroBtn.addEventListener("click", () => {
  if (dismissScreensaver()) return;
  pauseAllVideos();
  showScreen("language");
});

els.replayIntroBtn?.addEventListener("click", async () => {
  await playVideo(els.introVideo);
});

els.continueFromIntroBtn?.addEventListener("click", () => {
  if (dismissScreensaver()) return;
  pauseAllVideos();
  showScreen("language");
});

els.introVideo?.addEventListener("ended", () => {
  showScreen("language");
});

els.playInstructionBtn.addEventListener("click", async () => {
  showScreen("instructionVideo");
  await playVideo(els.instructionVideo);
});

els.skipToSetupBtn.addEventListener("click", async () => {
  await enterBiasChamber();
});

els.backInstructionChoiceBtn.addEventListener("click", () => {
  pauseAllVideos();
  showScreen("instructionChoice");
});

els.replayInstructionBtn.addEventListener("click", async () => {
  await playVideo(els.instructionVideo);
});

els.continueToLanguageBtn.addEventListener("click", async () => {
  await enterBiasChamber();
});

els.instructionVideo.addEventListener("ended", async () => {
  await enterBiasChamber();
});

document.querySelectorAll(".lang-btn").forEach((btn) => {
  btn.addEventListener("click", async () => {
    document.querySelectorAll(".lang-btn").forEach((item) => item.classList.remove("is-selected"));
    btn.classList.add("is-selected");
    appState.language = btn.dataset.lang;
    persistLanguage(appState.language);
    applyTranslations();
    await delay(260);
    showScreen("start");
  });
});

document.querySelectorAll(".lang-pill").forEach((pill) => {
  pill.addEventListener("click", async () => {
    appState.language = pill.dataset.lang;
    persistLanguage(appState.language);
    applyTranslations();
    loadBiasGames();
    biasCaptionCache = null;
    biasExplanationData = {};
    await loadBiasExplanations();

    const activeName = getCurrentScreenName();

    // Re-render prompt screen caption if currently on prompt screen
    if (activeName === "prompt" && appState.currentBiasGame &&
        typeof appState.currentTask?.cardIndex === "number") {
      const promptCaption = await getBiasCaption(
        appState.currentBiasGame,
        appState.currentTask.cardIndex
      );
      els.promptInstruction.textContent = promptCaption;
    }

    // Re-render result screen bias text if currently on result screen
    if (activeName === "result" && appState.currentTask?.category ===
        "Bias Playground") {
      const filterData = biasExplanationData[appState.currentTask.filterType];
      const lang = appState.language || "en";
      const data = (filterData && (filterData[lang] || filterData["en"])) || {
        title: (appState.currentBiasGame &&
                gameText(appState.currentBiasGame, "bias")) || "Bias Pattern",
        description: "",
      };
      els.biasLine.textContent = `${t("biasCategory")}: ${data.title}`;
      els.explanationLine.textContent = data.description;
      els.resultTaskId.textContent = `${t("biasModeResult")} — ${
        gameText(appState.currentBiasGame, "title")}`;
    }
  });
});

els.promptInput.addEventListener("input", updateCounter);

els.promptInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter" && !e.shiftKey) {
    e.preventDefault();
    submitPrompt();
  }
});

els.generateBtn.addEventListener("click", submitPrompt);

// ============================================================
// PERMANENT FIX — DO NOT MODIFY THIS HANDLER
// "Back to Task Hub" must ALWAYS navigate to screen-biasGames
// with cleared task state. Never route to screen-hub or any
// intermediate screen. Never add renderTaskHub() here.
// Last fixed: 2026-06-09
// ============================================================
els.backHubBtn.addEventListener("click", () => {
  if (appState.completedTasks.length >= 3) {
    appState.tasks = BIAS_GAMES
      .filter(game => appState.completedTasks.includes(game.mappedTaskId))
      .map(game => ({ id: game.mappedTaskId, title: gameText(game, "title") }));
    showFinal();
    return;
  }
  clearTimeout(biasGameTransitionTimer);
  appState.currentBiasGame = null;
  appState.currentTask = null;
  loadBiasGames();
  showScreen("biasGames");
});
// ============================================================

els.viewLeaderboardBtn.addEventListener("click", async () => {
  await loadLeaderboard();
  showScreen("leaderboard");
});

els.resetBtn.addEventListener("click", resetApp);

els.backLanguage.addEventListener("click", () => showScreen("language"));
els.backHub.addEventListener("click", () => showScreen("biasGames"));
els.backPrompt.addEventListener("click", () => showScreen(appState.currentBiasGame ? "biasGames" : "hub"));
els.backResult.addEventListener("click", () => showScreen("hub"));
els.backFinal.addEventListener("click", () => showScreen("hub"));
els.backLeaderboard.addEventListener("click", () => showScreen("final"));

function initBackgroundBlobs() {
  const cursorGlow = document.getElementById("cursor-glow");
  const mainBlob = document.querySelector(".blob-main");
  const floatingNodes = Array.from(document.querySelectorAll(".blob-floating"));

  if (!cursorGlow || !mainBlob || !floatingNodes.length) return;

  let mouseX = window.innerWidth * 0.5;
  let mouseY = window.innerHeight * 0.5;
  let smoothX = mouseX;
  let smoothY = mouseY;
  let glowX = mouseX;
  let glowY = mouseY;

  const floating = floatingNodes.map((node) => {
    const size = Number(node.dataset.size) || 700;
    const speed = 0.05 + Math.random() * 0.1;
    const angle = Math.random() * Math.PI * 2;

    return {
      node,
      size,
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      maxSpeed: 0.16,
    };
  });

  document.addEventListener("mousemove", (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
  });

  function animate() {
    const w = window.innerWidth;
    const h = window.innerHeight;

    smoothX += (mouseX - smoothX) * 0.08;
    smoothY += (mouseY - smoothY) * 0.08;
    glowX += (mouseX - glowX) * 0.05;
    glowY += (mouseY - glowY) * 0.05;

    const mainSize = Number(mainBlob.dataset.size) || 900;
    mainBlob.style.transform = `translate3d(${smoothX - mainSize / 2}px, ${smoothY - mainSize / 2}px, 0)`;
    cursorGlow.style.transform = `translate3d(${glowX - 320}px, ${glowY - 320}px, 0)`;

    floating.forEach((blob) => {
      blob.vx += (Math.random() - 0.5) * 0.01;
      blob.vy += (Math.random() - 0.5) * 0.01;

      const dx = mouseX - blob.x;
      const dy = mouseY - blob.y;
      const distance = Math.hypot(dx, dy);

      if (distance < 500) {
        blob.vx += dx * 0.00005;
        blob.vy += dy * 0.00005;
      }

      const speed = Math.hypot(blob.vx, blob.vy);
      if (speed > blob.maxSpeed) {
        blob.vx = (blob.vx / speed) * blob.maxSpeed;
        blob.vy = (blob.vy / speed) * blob.maxSpeed;
      }

      blob.x += blob.vx;
      blob.y += blob.vy;

      if (blob.x < -200 || blob.x > w + 200) blob.vx *= -1;
      if (blob.y < -200 || blob.y > h + 200) blob.vy *= -1;

      blob.node.style.transform = `translate3d(${blob.x - blob.size / 2}px, ${blob.y - blob.size / 2}px, 0)`;
    });

    requestAnimationFrame(animate);
  }

  animate();
}

loadTranslations();
loadBiasExplanations();
updateProgressIndicator();
initBackgroundBlobs();

// === BIAS LANDSCAPE SYSTEM START ===
const BIAS_GAMES = [
  {
    id: "bias_right",
    title: { en: "The Akward Reach", es: "El Alcance Dominante", ca: "L'Abast Dominant" },
    instruction: { en: "Write a prompt without assuming handedness.", es: "Escribe un prompt sin asumir la mano dominante.", ca: "Escriu un prompt sense assumir la mà dominant." },
    bias: { en: "Default Assumption Bias", es: "Sesgo de Suposición por Defecto", ca: "Biaix d'Assumpció per Defecte" },
    mappedTaskId: 1,
    filterType: "right_hand",
    target_image: "/images/targets/task_01.png",
    explanation: { en: "Bias appears as missing information: the system loses parts of the scene instead of seeing the full input.", es: "El sesgo aparece como información ausente: el sistema pierde partes de la escena en lugar de ver la entrada completa.", ca: "El biaix apareix com a informació absent: el sistema perd parts de l'escena en lloc de veure l'entrada completa." },
  },
  {
    id: "bias_gender",
    title: { en: "Who's the BOSS", es: "¿Quién Manda Aquí?", ca: "Qui Mana Aquí?" },
    instruction: { en: "Write a prompt without assuming gender roles.", es: "Escribe un prompt sin asumir roles de género.", ca: "Escriu un prompt sense assumir rols de gènere." },
    bias: { en: "Misrepresentation Bias", es: "Sesgo de Subrepresentación", ca: "Biaix de Subrepresentació" },
    mappedTaskId: 8,
    filterType: "gender",
    target_image: "/images/targets/task_08.png",
    explanation: { en: "Bias appears as projection: the system stamps an assumption onto the scene before judging it.", es: "El sesgo aparece como proyección: el sistema impone una suposición sobre la escena antes de evaluarla.", ca: "El biaix apareix com a projecció: el sistema imposa una suposició sobre l'escena abans d'avaluar-la." },
  },
  {
    id: "bias_keyword",
    title: { en: "Tunnel Vision", es: "Visión Túnel", ca: "Visió Túnel" },
    instruction: { en: "Write a prompt without assuming language or culture.", es: "Escribe un prompt sin asumir idioma ni cultura.", ca: "Escriu un prompt sense assumir idioma ni cultura." },
    bias: { en: "Cultural Misalignment Bias", es: "Sesgo de Desalineación Cultural", ca: "Biaix de Desalineació Cultural" },
    mappedTaskId: 4,
    filterType: "language",
    target_image: "/images/targets/task_04.png",
    explanation: { en: "Bias appears as misalignment: duplicated signals make the input harder to read cleanly.", es: "El sesgo aparece como desalineación: las señales duplicadas dificultan una lectura limpia de la entrada.", ca: "El biaix apareix com a desalineació: els senyals duplicats dificulten una lectura neta de l'entrada." },
  },
  {
    id: "bias_couple",
    title: { en: "The Invisible Spectrum", es: "El Espectro Invisible", ca: "L'Espectre Invisible" },
    instruction: { en: "Write a prompt that preserves local architectural detail.", es: "Escribe un prompt que preserve el detalle arquitectónico local.", ca: "Escriu un prompt que preservi el detall arquitectònic local." },
    bias: { en: "Detail Loss Bias", es: "Sesgo de Pérdida de Detalle", ca: "Biaix de Pèrdua de Detall" },
    mappedTaskId: 5,
    filterType: "architecture",
    target_image: "/images/targets/task_05.png",
    explanation: { en: "Bias appears as lost texture: repeated copying collapses detail into a flatter image.", es: "El sesgo aparece como textura perdida: la copia repetida colapsa el detalle en una imagen más plana.", ca: "El biaix apareix com a textura perduda: la còpia repetida col·lapsa el detall en una imatge més plana." },
  },
  {
    id: "bias_global_south_flattening",
    title: { en: "No Complexity Zone", es: "Zona Sin Complejidad", ca: "Zona Sense Complexitat" },
    instruction: { en: "Write a prompt that preserves the everyday complexity and variety of a city, without defaulting to poverty or chaos.", es: "Escribe un prompt que preserve la complejidad y variedad cotidiana de una ciudad, sin recurrir a la pobreza o el caos.", ca: "Escriu un prompt que preservi la complexitat i varietat quotidiana d'una ciutat, sense recórrer a la pobresa o el caos." },
    bias: { en: "Global South Flattening Bias", es: "Sesgo de Aplanamiento del Sur Global", ca: "Biaix d'Aplanament del Sud Global" },
    mappedTaskId: 7,
    filterType: "global_south_flattening",
    target_image: "/images/targets/task_07.png",
    explanation: { en: "Bias appears as flattening: cities in Africa, India, South America, and the Middle East are reduced to poverty, chaos, markets, dust, or crowds instead of their full complexity.", es: "El sesgo aparece como aplanamiento: las ciudades de África, India, Sudamérica y Oriente Medio se reducen a pobreza, caos, mercados, polvo o multitudes en lugar de su complejidad real.", ca: "El biaix apareix com a aplanament: les ciutats d'Àfrica, Índia, Amèrica del Sud i Orient Mitjà es redueixen a pobresa, caos, mercats, pols o multituds en lloc de la seva complexitat real." },
  },
  {
    id: "bias_nurse",
    title: { en: "The Missing Brother", es: "El Hermano Invisible", ca: "El Germà Invisible" },
    instruction: { en: "Write a prompt for a nurse without specifying gender.", es: "Escribe un prompt para un enfermero sin especificar género.", ca: "Escriu un prompt per a un infermer sense especificar gènere." },
    bias: { en: "Occupational Gender Bias", es: "Sesgo de Género Ocupacional", ca: "Biaix de Gènere Ocupacional" },
    mappedTaskId: 3,
    filterType: "nurse",
    target_image: "/images/targets/task_03.png",
    explanation: { en: "Bias appears as a gendered default: care roles like nursing are almost always rendered as female, erasing the significant portion of male nurses in the real world.", es: "El sesgo aparece como un género por defecto: los roles de cuidado como la enfermería casi siempre se representan como femeninos, borrando la proporción significativa de enfermeros hombres en el mundo real.", ca: "El biaix apareix com un gènere per defecte: els rols de cura com la infermeria gairebé sempre es representen com a femenins, esborrant la proporció significativa d'infermers homes en el món real." },
  },
];

function gameText(game, field) {
  const val = game[field];
  if (val && typeof val === "object") {
    return val[appState.language] || val["en"] || "";
  }
  return val || "";
}

const biasLandscapeShowScreen = showScreen;
showScreen = function showLandscapeScreen(name) {
  const previousName = Object.entries(screens).find(([, screen]) => screen?.classList.contains("active"))?.[0] || "";
  document.body.classList.add("is-cinematic-transitioning");
  document.body.classList.toggle("is-entering-bias-chamber", name === "biasGames");

  biasLandscapeShowScreen(name);
  document.body.classList.toggle("is-prompt-screen", name === "prompt");
  document.body.classList.toggle("is-bias-chamber-screen", name === "biasGames");

  window.dispatchEvent(new CustomEvent("cinematic-screen-change", {
    detail: { from: previousName, to: name },
  }));

  window.clearTimeout(window.__cinematicTransitionTimer);
  window.__cinematicTransitionTimer = window.setTimeout(() => {
    document.body.classList.remove("is-cinematic-transitioning", "is-entering-bias-chamber");
  }, name === "biasGames" ? 4600 : 2600);

  if (name === "prompt") {
    updatePromptTargetImage();
  }
};

function updatePromptTargetImage() {
  const targetImg = document.getElementById("prompt-target-image");
  if (!targetImg) return;

  const promptScreen = document.getElementById("screen-prompt");
  const sources = appState.currentTask?.target_image_candidates || [appState.currentTask?.target_image || ""];
  let sourceIndex = 0;

  targetImg.onerror = () => {
    sourceIndex += 1;
    if (sourceIndex < sources.length) {
      if (promptScreen) {
        promptScreen.style.setProperty("--prompt-bg-image", `url("${sources[sourceIndex]}")`);
      }
      targetImg.src = sources[sourceIndex];
      return;
    }

    targetImg.removeAttribute("src");
    targetImg.style.display = "none";
    if (promptScreen) {
      promptScreen.style.removeProperty("--prompt-bg-image");
    }
  };

  targetImg.onload = () => {
    targetImg.style.display = "block";
    if (promptScreen && targetImg.currentSrc) {
      promptScreen.style.setProperty("--prompt-bg-image", `url("${targetImg.currentSrc}")`);
    }
  };

  if (promptScreen && sources[sourceIndex]) {
    promptScreen.style.setProperty("--prompt-bg-image", `url("${sources[sourceIndex]}")`);
  }
  targetImg.src = sources[sourceIndex] || "";
}

// === BIAS TARGET IMAGE RESOLVER START ===
function getBiasTargetImage(game, index) {
  const fileName = `bias_${index + 1}.png`;
  return `/images/new_test_target/${fileName}`;
}

function getBiasTargetImageCandidates(game, index) {
  const baseName = `bias_${index + 1}`;
  return [
    `/images/new_test_target/${baseName}.png`,
    `/images/new_test_target/${baseName}.jpeg`,
    `/images/new_test_target/${baseName}.jpg`,
    `/images/new_test_target/${baseName}.AVIF`,
    `/images/new_test_target/${baseName}.avif`,
    `/images/new_test_target/${baseName}.webp`,
  ];
}
// === BIAS TARGET IMAGE RESOLVER END ===

// === BIAS CAPTION RESOLVER START ===
let biasCaptionCache = null;
let biasCaptionLang = null;

async function getBiasCaptions() {
  if (biasCaptionCache && biasCaptionLang === appState.language)
    return biasCaptionCache;
  biasCaptionCache = null;

  try {
    const res = await fetch("/backend/captions.md");
    const text = await res.text();
    biasCaptionCache = {};
    biasCaptionLang = appState.language;

    text.split(/\r?\n/).forEach((line) => {
      const match = line.match(/^(bias_\d+(?:_[a-z]{2})?)\s*=\s*(.*)$/);
      if (!match) return;

      biasCaptionCache[match[1]] = match[2].trim();
    });
  } catch {
    biasCaptionCache = {};
  }

  return biasCaptionCache;
}

async function getBiasCaption(game, index) {
  const captions = await getBiasCaptions();
  const lang = appState.language || "en";
  return captions[`bias_${index + 1}_${lang}`]
    || captions[`bias_${index + 1}_en`]
    || "Try to recreate the target image.";
}
// === BIAS CAPTION RESOLVER END ===

// === FAKE GENERATED RULES RESOLVER START ===
let fakeGenRulesCache = null;

async function getFakeGenRules() {
  if (fakeGenRulesCache) return fakeGenRulesCache;

  try {
    const res = await fetch("/data/fake_generated_rules.json");
    fakeGenRulesCache = await res.json();
  } catch {
    fakeGenRulesCache = {};
  }

  return fakeGenRulesCache;
}
// === FAKE GENERATED RULES RESOLVER END ===

function loadBiasGames() {
  appState.biasGames = BIAS_GAMES.slice();
  renderBiasGames();
}

function renderBiasGames() {
  if (!els.biasGamesGrid) return;

  const posClasses = ["pos-left", "pos-center", "pos-right"];
  els.biasGamesGrid.innerHTML = "";

  for (let rowStart = 0; rowStart < BIAS_GAMES.length; rowStart += 3) {
    const row = document.createElement("div");
    row.className = "bias-row";

    for (let col = 0; col < 3; col++) {
      const index = rowStart + col;
      if (index >= BIAS_GAMES.length) break;
      const game = BIAS_GAMES[index];

      const card = document.createElement("article");
      const isCompleted = appState.completedTasks.includes(game.mappedTaskId);
      card.className = `bias-card ${posClasses[col]}${isCompleted ? " bias-card--completed" : ""}`;
      card.dataset.biasIndex = index;
      card.innerHTML = `
        <div class="task-card-top">
          <div class="task-meta">
            <span class="bias-id">Challenge 0${index + 1}</span>
            <h3>${gameText(game, "title")}</h3>
            <p class="task-category">${t("challengeInstruction")}</p>
          </div>
        </div>
        ${isCompleted
          ? `<div class="completed-label" style="text-align:center;padding:10px 0;opacity:0.6;font-family:inherit;font-size:0.9rem;letter-spacing:0.05em;color:#a0aec0;">✓ ${t("completedBtn") || "Completed"}</div>`
          : `<button class="button btn primary-btn" type="button">${t("playBtn")}</button>`
        }
      `;

      row.appendChild(card);
    }

    els.biasGamesGrid.appendChild(row);
  }
}

function initBiasCardDelegation() {
  if (!els.biasGamesGrid) return;

  // Primary: standard delegation — works for center cards where 3D hit-testing succeeds
  els.biasGamesGrid.addEventListener("click", (e) => {
    const card = e.target.closest(".bias-card");
    if (!card) return;
    if (card.classList.contains("bias-card--completed")) return;
    e.stopPropagation(); // prevent document fallback from also firing
    const index = parseInt(card.dataset.biasIndex, 10);
    if (!isNaN(index) && BIAS_GAMES[index]) openBiasGame(BIAS_GAMES[index], index);
  });

  // Fallback: document-level listener using getBoundingClientRect() for side cards where
  // the browser's 3D hit-test may miss due to rotateY + translateZ inside a preserve-3d context.
  // getBoundingClientRect() always returns the actual rendered 2D bounding box.
  document.addEventListener("click", (e) => {
    const screen = document.getElementById("screen-bias-games");
    if (!screen?.classList.contains("active")) return;
    // Bail if the click originated outside screen-bias-games — e.g. a button on another
    // screen called showScreen("biasGames") mid-bubble, making this screen active before
    // this listener fires. Without this guard that click would also trigger a card open.
    if (!screen.contains(e.target)) return;
    const cards = els.biasGamesGrid.querySelectorAll(".bias-card");
    for (const card of cards) {
      const rect = card.getBoundingClientRect();
      if (
        e.clientX >= rect.left && e.clientX <= rect.right &&
        e.clientY >= rect.top && e.clientY <= rect.bottom
      ) {
        const index = parseInt(card.dataset.biasIndex, 10);
        if (!isNaN(index) && BIAS_GAMES[index]) {
          if (card.classList.contains("bias-card--completed")) return;
          openBiasGame(BIAS_GAMES[index], index);
          return;
        }
      }
    }
  });
}

async function openBiasGame(game, index) {
  const targetImagePath = getBiasTargetImage(game, index);
  const promptCaption = await getBiasCaption(game, index);

  appState.currentBiasGame = game;
  appState.currentTask = {
    ...game,
    id: game.mappedTaskId,
    category: "Bias Playground",
    cardIndex: index,
    target_image: targetImagePath,
    target_image_candidates: getBiasTargetImageCandidates(game, index),
  };

  if (appState.currentTask.category === "Bias Playground") {
    els.promptTitle.textContent = t("biasTestTitle");
    els.promptTaskId.textContent = "";
    els.promptInstruction.textContent = promptCaption;
  } else {
    els.promptTitle.textContent = game.title;
    els.promptTaskId.textContent = `Task ID: ${game.mappedTaskId}`;
    els.promptInstruction.textContent = game.instruction;
  }
  els.promptInput.value = "";
  els.charCounter.textContent = "0/200";
  updatePromptTargetImage();
  const preview = document.getElementById("challenge-preview");
  const previewImg = document.getElementById("challenge-preview-img");
  const previewCandidates = getBiasTargetImageCandidates(game, index);
  let previewSourceIndex = 0;
  previewImg.onerror = () => {
    previewSourceIndex += 1;
    if (previewSourceIndex < previewCandidates.length) {
      previewImg.src = previewCandidates[previewSourceIndex];
    }
  };
  previewImg.src = previewCandidates[previewSourceIndex];
  preview.style.opacity = "1";
  preview.style.display = "block";
  clearTimeout(biasGameTransitionTimer);
  biasGameTransitionTimer = setTimeout(() => {
    preview.style.transition = "opacity 800ms ease";
    preview.style.opacity = "0";
    showScreen("prompt");
    setTimeout(() => {
      preview.style.display = "none";
      preview.style.transition = "";
    }, 800);
  }, 2750);
}

// === BIAS LANDSCAPE SYSTEM END ===

// === 3D CINEMATIC BACKGROUND SYSTEM ===
let scene, camera, renderer, globe, particles, mouse, targetRotation;

function init3DScene() {
  // Scene setup
  scene = new THREE.Scene();
  scene.background = new THREE.Color(0x02040d);
  scene.fog = new THREE.Fog(0x02040d, 8, 18);

  // Camera - positioned to see the large globe
  camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.1, 1000);
  camera.position.z = 8;

  // Renderer
  renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.domElement.style.position = 'fixed';
  renderer.domElement.style.top = '0';
  renderer.domElement.style.left = '0';
  renderer.domElement.style.zIndex = '-1';
  renderer.domElement.style.pointerEvents = 'none';
  // document.body.style.backgroundColor = '#00050e';
  // document.body.style.backgroundImage = 'radial-gradient(circle at 40% 30%, rgba(59,130,246,0.18), transparent 16%), radial-gradient(circle at 60% 55%, rgba(99,102,241,0.12), transparent 12%), radial-gradient(circle at 50% 70%, rgba(15,23,42,0.28), transparent 22%), radial-gradient(circle at 15% 25%, rgba(0, 0, 0, 0.32), transparent 18%)';
  document.body.style.backgroundRepeat = 'no-repeat';
  document.body.style.backgroundSize = 'cover';
  document.body.style.overflow = 'hidden';
  document.body.appendChild(renderer.domElement);

  // MAIN GLOBE - Large, visible, dominant
  const globeGeometry = new THREE.SphereGeometry(5, 128, 128);
  const globeMaterial = new THREE.ShaderMaterial({
    uniforms: {
      time: { value: 0 },
      mouse: { value: new THREE.Vector2(0, 0) }
    },
    vertexShader: `
      varying vec3 vNormal;
      varying vec3 vPosition;
      varying vec2 vUv;
      uniform float time;
      void main() {
        vNormal = normalize(normalMatrix * normal);
        vPosition = position;
        vUv = uv;
        vec3 pos = position;
        pos += normal * sin(time + position.x * 5.0 + position.y * 4.0) * 0.03;
        pos += normal * cos(time * 0.4 + position.z * 3.5) * 0.02;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
      }
    `,
    fragmentShader: `
      varying vec3 vNormal;
      varying vec3 vPosition;
      varying vec2 vUv;
      uniform float time;
      void main() {
            vec3 base = vec3(0.04, 0.12, 0.35);
        float fresnel = pow(1.0 - dot(vNormal, vec3(0, 0, 1)), 2.2);
        vec3 rim = vec3(0.4, 0.7, 1.0) * fresnel * 1.2;

        float waves = sin(vPosition.x * 4.5 + time * 0.8) * cos(vPosition.y * 3.8 + time * 0.75) * 0.18;
        float rings = abs(sin(vUv.x * 60.0) * cos(vUv.y * 35.0));
        float ringMask = smoothstep(0.75, 0.78, rings) * 0.42;
        vec3 color = base + rim + vec3(0.02, 0.18, 0.44) * waves + vec3(0.18, 0.4, 0.95) * ringMask;
        float alpha = 0.98;
        gl_FragColor = vec4(color, alpha);
      }
    `,
    transparent: true,
    side: THREE.DoubleSide,
    depthWrite: false
  });
  globe = new THREE.Mesh(globeGeometry, globeMaterial);
  globe.scale.set(2.0, 2.0, 2.0);
  scene.add(globe);

  // Inner core glow
  const coreMaterial = new THREE.MeshBasicMaterial({
    color: 0x0b1220,
    transparent: true,
    opacity: 0.25,
    side: THREE.DoubleSide
  });
  const core = new THREE.Mesh(new THREE.SphereGeometry(4.6, 64, 64), coreMaterial);
  scene.add(core);

  // NETWORK NODES - surface points and holes
  const nodeGeometry = new THREE.SphereGeometry(0.02, 10, 10);
  const nodeMaterial = new THREE.MeshBasicMaterial({
    color: 0x7C3AED,
    transparent: true,
    opacity: 0.92
  });
  const ringGeometry = new THREE.RingGeometry(0.02, 0.045, 24);
  const holeMaterial = new THREE.MeshBasicMaterial({
    color: 0xC084FC,
    transparent: true,
    opacity: 0.55,
    side: THREE.DoubleSide,
    depthWrite: false
  });
  const holeFillMaterial = new THREE.MeshBasicMaterial({
    color: 0x8B5CF6,
    transparent: true,
    opacity: 0.55,
    side: THREE.DoubleSide,
    depthWrite: false
  });
  const nodes = [];
  const holeMeshes = [];
  const holeFills = [];
  const nodeCount = 120;

  for (let i = 0; i < nodeCount; i++) {
    const phi = Math.random() * Math.PI * 2;
    const theta = Math.acos(2 * Math.random() - 1);
    const radius = 5.08;

    const position = new THREE.Vector3(
      radius * Math.sin(theta) * Math.cos(phi),
      radius * Math.cos(theta),
      radius * Math.sin(theta) * Math.sin(phi)
    );

    const node = new THREE.Mesh(nodeGeometry, nodeMaterial.clone());
    node.position.copy(position);
    node.userData.phase = Math.random() * Math.PI * 2;
    node.userData.speed = 0.8 + Math.random() * 0.6;
    globe.add(node);
    nodes.push(node);

    if (i % 2 === 0) {
      const hole = new THREE.Mesh(ringGeometry, holeMaterial.clone());
      hole.position.copy(position);
      hole.lookAt(position.clone().multiplyScalar(2));
      hole.userData.phase = Math.random() * Math.PI * 2;
      globe.add(hole);
      holeMeshes.push(hole);

      const fill = new THREE.Mesh(new THREE.CircleGeometry(0.018, 24), holeFillMaterial.clone());
      fill.position.copy(position).add(position.clone().normalize().multiplyScalar(0.01));
      fill.lookAt(position.clone().multiplyScalar(2));
      fill.userData.phase = Math.random() * Math.PI * 2;
      globe.add(fill);
      holeFills.push(fill);
    }
  }

  // STRUCTURED CONNECTIONS - curved paths along the globe
  const connectionMaterial = new THREE.MeshBasicMaterial({
    color: 0x60A5FA,
    transparent: true,
    opacity: 0.22
  });
  const connections = [];
  const connectionCount = Math.min(20, nodes.length);

  for (let i = 0; i < connectionCount; i++) {
    const startNode = nodes[i];
    const endNode = nodes[(i * 7 + 13) % nodes.length];
    if (startNode === endNode) continue;

    const start = startNode.position.clone();
    const end = endNode.position.clone();
    const mid = start.clone().lerp(end, 0.5).normalize().multiplyScalar(5.4 + start.distanceTo(end) * 0.08);
    const curve = new THREE.QuadraticBezierCurve3(start, mid, end);
    const arcGeometry = new THREE.TubeGeometry(curve, 28, 0.012, 8, false);
    const arc = new THREE.Mesh(arcGeometry, connectionMaterial.clone());
    scene.add(arc);
    connections.push({ arc, startNode, endNode, phase: Math.random() * Math.PI * 2 });
  }

  // ATMOSPHERIC PARTICLES - depth around globe
  const particleGeometry = new THREE.BufferGeometry();
  const particleCount = 280;
  const particlePositions = new Float32Array(particleCount * 3);
  const particleDepths = [];

  for (let i = 0; i < particleCount; i++) {
    const shellRadius = 6.2 + Math.random() * 4.0;
    const phi = Math.random() * Math.PI * 2;
    const theta = Math.random() * Math.PI;
    particlePositions[i * 3] = shellRadius * Math.sin(theta) * Math.cos(phi);
    particlePositions[i * 3 + 1] = shellRadius * Math.cos(theta);
    particlePositions[i * 3 + 2] = shellRadius * Math.sin(theta) * Math.sin(phi);
    particleDepths.push(shellRadius);
  }

  particleGeometry.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
  const particleMaterial = new THREE.PointsMaterial({
    color: 0x7DD3FC,
    size: 0.016,
    transparent: true,
    opacity: 0.35,
    sizeAttenuation: true
  });
  particles = new THREE.Points(particleGeometry, particleMaterial);
  scene.add(particles);

  // Mouse interaction - slow cinematic influence
  mouse = new THREE.Vector2();
  targetRotation = new THREE.Vector2();

  document.addEventListener('mousemove', (event) => {
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
    targetRotation.x = mouse.x * 0.28;
    targetRotation.y = mouse.y * 0.28;
  });

  function animate() {
    requestAnimationFrame(animate);
    const time = Date.now() * 0.001;

    const targetPosX = mouse.x * 0.8;
    const targetPosY = mouse.y * 0.5;
    globe.position.x = THREE.MathUtils.lerp(globe.position.x, targetPosX, 0.06);
    globe.position.y = THREE.MathUtils.lerp(globe.position.y, targetPosY, 0.06);
    core.position.copy(globe.position);

    globe.rotation.y += 0.0018;
    globe.rotation.x = THREE.MathUtils.lerp(globe.rotation.x, targetRotation.y, 0.04);
    globe.rotation.y += THREE.MathUtils.lerp(0, targetRotation.x, 0.04);

    globe.material.uniforms.time.value = time;
    globe.material.uniforms.mouse.value = mouse;
    core.rotation.copy(globe.rotation);

    nodes.forEach((node) => {
      const pulse = Math.sin(time * node.userData.speed + node.userData.phase) * 0.5 + 0.5;
      const intensity = 0.5 + pulse * 0.5;
      node.material.opacity = intensity;
      node.scale.setScalar(1 + pulse * 0.35);
    });

    holeMeshes.forEach((hole, index) => {
      hole.material.opacity = 0.35 + Math.sin(time * 1.2 + hole.userData.phase) * 0.14;
      hole.scale.setScalar(0.95 + Math.sin(time * 0.6 + hole.userData.phase) * 0.04);
    });

    holeFills.forEach((fill) => {
      fill.material.opacity = 0.35 + Math.sin(time * 1.1 + fill.userData.phase) * 0.14;
      fill.scale.setScalar(1 + Math.sin(time * 0.5 + fill.userData.phase) * 0.04);
    });

    connections.forEach((connection, idx) => {
      const flow = 0.2 + Math.sin(time * 1.4 + connection.phase + idx * 0.24) * 0.12;
      connection.arc.material.opacity = 0.18 + flow * 0.22;
      connection.arc.rotation.y += 0.00045;
    });

    particles.rotation.y += 0.0006;
    particles.rotation.x += 0.0002;
    const positionsArray = particles.geometry.attributes.position.array;
    for (let i = 0; i < particleCount; i++) {
      positionsArray[i * 3 + 1] += Math.sin(time * 0.5 + i * 0.12) * 0.0008;
    }
    particles.geometry.attributes.position.needsUpdate = true;

    renderer.render(scene, camera);
  }
  animate();

  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });
}

function initBiasGamesParallax() {
  const chamberScreen = screens.biasGames;
  if (!chamberScreen) return;

  document.addEventListener("mousemove", (event) => {
    const x = event.clientX / window.innerWidth - 0.5;
    const y = event.clientY / window.innerHeight - 0.5;
    chamberScreen.style.setProperty("--bias-parallax-x", `${x * 18}px`);
    chamberScreen.style.setProperty("--bias-parallax-y", `${y * 14}px`);
    chamberScreen.style.setProperty("--bias-tilt-x", `${y * -4}deg`);
    chamberScreen.style.setProperty("--bias-tilt-y", `${x * 6}deg`);
  });
}

// Initialize 3D scene when DOM is ready
// document.addEventListener('DOMContentLoaded', init3DScene);
document.addEventListener("DOMContentLoaded", initBiasGamesParallax);

// On every hard page load, set identical clean state to resetApp() and show
// the intro screen — ensures first journey matches every subsequent reset.
document.addEventListener("DOMContentLoaded", () => {
  appState.userName = "";
  appState.language = "en";
  appState.tasks = [];
  appState.completedTasks = [];
  appState.scores = {};
  appState.currentTask = null;
  appState.currentBiasGame = null;
  appState.biasGames = [];
  appState.biasModeActive = false;
  appState.total = 0;
  showScreen("introVideo");
});
// === 3D CINEMATIC BACKGROUND SYSTEM END ===

// === SCREENSAVER / INACTIVITY SYSTEM ===
let screensaverTimer = null;
let screensaverActive = false;
let screensaverReturnScreen = null;
const SCREENSAVER_DELAY = 30000;

function getCurrentScreenName() {
  return Object.entries(screens).find(([, s]) => s?.classList.contains("active"))?.[0] || null;
}

function activateScreensaver() {
  const current = getCurrentScreenName();
  if (current === "introVideo" || els.loadingOverlay?.classList.contains("active")) {
    scheduleScreensaver();
    return;
  }
  screensaverReturnScreen = current;
  screensaverActive = true;
  const introScreen = screens.introVideo;
  if (introScreen) introScreen.classList.add("screensaver-mode");
  if (els.introVideo) {
    els.introVideo.currentTime = 0;
    els.introVideo.play().catch(() => {});
  }
  showScreen("introVideo");
}

function dismissScreensaver() {
  if (!screensaverActive) return false;
  screensaverActive = false;
  const introScreen = screens.introVideo;
  if (introScreen) introScreen.classList.remove("screensaver-mode");
  if (els.introVideo) {
    els.introVideo.pause();
    els.introVideo.currentTime = 0;
  }
  if (screensaverReturnScreen && screens[screensaverReturnScreen]) {
    showScreen(screensaverReturnScreen);
  }
  screensaverReturnScreen = null;
  scheduleScreensaver();
  return true;
}

function scheduleScreensaver() {
  clearTimeout(screensaverTimer);
  screensaverTimer = setTimeout(activateScreensaver, SCREENSAVER_DELAY);
}

function onUserActivity() {
  if (screensaverActive) {
    dismissScreensaver();
    return;
  }
  scheduleScreensaver();
}

["mousemove", "keydown", "touchmove", "touchstart", "scroll"].forEach((evt) => {
  document.addEventListener(evt, onUserActivity, { passive: true });
});

scheduleScreensaver();
// === SCREENSAVER / INACTIVITY SYSTEM END ===
