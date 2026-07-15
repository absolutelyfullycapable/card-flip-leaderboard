(() => {
  "use strict";

  const CARDS = [
    { symbol: "★", bg: "#fff1d6", color: "#e39b00" },
    { symbol: "◆", bg: "#ffe4dc", color: "#ff5a3c" },
    { symbol: "●", bg: "#dcf7ef", color: "#0f9f6e" },
    { symbol: "▲", bg: "#e5f4ff", color: "#1f8fff" },
    { symbol: "♥", bg: "#ffe0ea", color: "#e11d64" },
    { symbol: "♠", bg: "#e8eef5", color: "#334155" },
    { symbol: "✚", bg: "#fff5d8", color: "#c98500" },
    { symbol: "✦", bg: "#e7fff6", color: "#0b8f6a" },
  ];
  const PAIR_COUNT = CARDS.length;
  const FLIP_BACK_MS = 750;
  const LEADERBOARD_LIMIT = 10;

  const pageEl = document.getElementById("page");
  const boardEl = document.getElementById("board");
  const timeEl = document.getElementById("time");
  const movesEl = document.getElementById("moves");
  const pairsLeftEl = document.getElementById("pairsLeft");
  const playerLabelEl = document.getElementById("playerLabel");
  const resetBtn = document.getElementById("resetBtn");
  const changeNameBtn = document.getElementById("changeNameBtn");
  const startOverlay = document.getElementById("startOverlay");
  const clearOverlay = document.getElementById("clearOverlay");
  const finalPlayerEl = document.getElementById("finalPlayer");
  const finalTimeEl = document.getElementById("finalTime");
  const finalMovesEl = document.getElementById("finalMoves");
  const playerNameInput = document.getElementById("playerName");
  const startBtn = document.getElementById("startBtn");
  const startStatusEl = document.getElementById("startStatus");
  const playAgainBtn = document.getElementById("playAgainBtn");
  const goHomeBtn = document.getElementById("goHomeBtn");
  const saveBtn = document.getElementById("saveBtn");
  const saveStatusEl = document.getElementById("saveStatus");
  const leaderboardListEl = document.getElementById("leaderboardList");
  const leaderboardNoteEl = document.getElementById("leaderboardNote");

  /** @type {'idle' | 'ready' | 'playing' | 'locked' | 'finished'} */
  let status = "idle";
  let playerName = "";
  let moves = 0;
  let matchedPairs = 0;
  let flippedCards = [];
  let startTimestamp = 0;
  let elapsedMs = 0;
  let timerId = null;
  let scoreSaved = false;

  const config = window.SUPABASE_CONFIG || {};
  const hasConfig =
    typeof config.url === "string" &&
    typeof config.anonKey === "string" &&
    config.url.includes("supabase.co") &&
    !config.url.includes("YOUR_PROJECT_REF") &&
    config.anonKey.length > 20 &&
    !config.anonKey.includes("YOUR_SUPABASE");

  const supabaseClient =
    hasConfig && window.supabase
      ? window.supabase.createClient(config.url, config.anonKey)
      : null;

  function escapeHtml(value) {
    return String(value)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#39;");
  }

  function shuffle(items) {
    const list = [...items];
    for (let i = list.length - 1; i > 0; i -= 1) {
      const j = Math.floor(Math.random() * (i + 1));
      [list[i], list[j]] = [list[j], list[i]];
    }
    return list;
  }

  function formatSeconds(ms) {
    return (ms / 1000).toFixed(1);
  }

  function updateStats() {
    timeEl.textContent = formatSeconds(elapsedMs);
    movesEl.textContent = String(moves);
    pairsLeftEl.textContent = String(PAIR_COUNT - matchedPairs);
    playerLabelEl.textContent = playerName || "-";
  }

  function stopTimer() {
    if (timerId !== null) {
      window.clearInterval(timerId);
      timerId = null;
    }
  }

  function startTimer() {
    startTimestamp = performance.now();
    elapsedMs = 0;
    stopTimer();
    timerId = window.setInterval(() => {
      elapsedMs = performance.now() - startTimestamp;
      timeEl.textContent = formatSeconds(elapsedMs);
    }, 100);
  }

  function createDeck() {
    const values = shuffle([...CARDS, ...CARDS]);
    return values.map((card, index) => ({
      id: index,
      symbol: card.symbol,
      bg: card.bg,
      color: card.color,
    }));
  }

  function renderBoard() {
    boardEl.innerHTML = "";

    createDeck().forEach((card) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "card";
      button.dataset.symbol = card.symbol;
      button.dataset.id = String(card.id);
      button.setAttribute("aria-label", "뒤집힌 카드");
      button.innerHTML = `
        <span class="card-inner">
          <span class="card-face card-back" aria-hidden="true"></span>
          <span class="card-face card-front" aria-hidden="true">
            <span class="card-symbol" style="--symbol-bg:${card.bg};--symbol-color:${card.color}">${card.symbol}</span>
          </span>
        </span>
      `;
      button.addEventListener("click", () => onCardClick(button));
      boardEl.appendChild(button);
    });
  }

  function setStartStatus(message, type) {
    startStatusEl.textContent = message;
    startStatusEl.className = `save-status${type ? ` is-${type}` : ""}`;
  }

  function setSaveStatus(message, type) {
    saveStatusEl.textContent = message;
    saveStatusEl.className = `save-status${type ? ` is-${type}` : ""}`;
  }

  function showStartScreen(options = {}) {
    const {
      message = "",
      messageType = "",
      keepInput = false,
      clearInput = false,
    } = options;

    stopTimer();
    status = "idle";
    const previousName = playerName;
    playerName = "";
    moves = 0;
    matchedPairs = 0;
    flippedCards = [];
    startTimestamp = 0;
    elapsedMs = 0;
    scoreSaved = false;
    pageEl.classList.add("is-locked");
    clearOverlay.classList.add("hidden");
    startOverlay.classList.remove("hidden");
    setStartStatus(message, messageType);
    setSaveStatus("", "");
    updateStats();
    renderBoard();

    if (clearInput) {
      playerNameInput.value = "";
    } else if (keepInput && previousName) {
      playerNameInput.value = previousName;
    }

    playerNameInput.focus();
    playerNameInput.select();
  }

  function beginRound() {
    stopTimer();
    status = "ready";
    moves = 0;
    matchedPairs = 0;
    flippedCards = [];
    startTimestamp = 0;
    elapsedMs = 0;
    scoreSaved = false;
    pageEl.classList.remove("is-locked");
    startOverlay.classList.add("hidden");
    clearOverlay.classList.add("hidden");
    setSaveStatus("", "");
    updateStats();
    renderBoard();
  }

  async function isNameTaken(name) {
    if (!supabaseClient) return false;

    const { data, error } = await supabaseClient
      .from("scores")
      .select("id")
      .eq("player_name", name)
      .limit(1);

    if (error) {
      console.error(error);
      throw error;
    }

    return Array.isArray(data) && data.length > 0;
  }

  async function startGame() {
    const name = playerNameInput.value.trim().slice(0, 12);
    if (!name) {
      setStartStatus("이름을 입력해 주세요.", "error");
      playerNameInput.focus();
      return;
    }

    playerNameInput.value = name;
    startBtn.disabled = true;
    setStartStatus("이름 확인 중…", "");

    try {
      const taken = await isNameTaken(name);
      if (taken) {
        setStartStatus(
          "이미 등록된 이름입니다. 다른 이름을 입력해 주세요.",
          "error"
        );
        playerNameInput.focus();
        playerNameInput.select();
        return;
      }

      playerName = name;
      setStartStatus("", "");
      beginRound();
    } catch (error) {
      setStartStatus(
        "이름 확인에 실패했습니다. 잠시 후 다시 시도해 주세요.",
        "error"
      );
    } finally {
      startBtn.disabled = false;
    }
  }

  function canFlip(card) {
    if (status === "idle" || status === "locked" || status === "finished") {
      return false;
    }
    if (card.classList.contains("is-flipped")) return false;
    if (card.classList.contains("is-matched")) return false;
    if (flippedCards.length >= 2) return false;
    return true;
  }

  function onCardClick(card) {
    if (!canFlip(card)) return;

    if (status === "ready") {
      status = "playing";
      startTimer();
    }

    card.classList.add("is-flipped");
    card.setAttribute("aria-label", `카드 ${card.dataset.symbol}`);
    flippedCards.push(card);

    if (flippedCards.length === 2) {
      moves += 1;
      updateStats();
      resolveFlip();
    }
  }

  function resolveFlip() {
    const [first, second] = flippedCards;
    const isMatch = first.dataset.symbol === second.dataset.symbol;

    if (isMatch) {
      first.classList.add("is-matched");
      second.classList.add("is-matched");
      first.setAttribute("aria-label", `맞춘 카드 ${first.dataset.symbol}`);
      second.setAttribute("aria-label", `맞춘 카드 ${second.dataset.symbol}`);
      flippedCards = [];
      matchedPairs += 1;
      updateStats();

      if (matchedPairs === PAIR_COUNT) {
        finishGame();
      }
      return;
    }

    status = "locked";
    first.classList.add("is-mismatch");
    second.classList.add("is-mismatch");

    window.setTimeout(() => {
      first.classList.remove("is-flipped", "is-mismatch");
      second.classList.remove("is-flipped", "is-mismatch");
      first.setAttribute("aria-label", "뒤집힌 카드");
      second.setAttribute("aria-label", "뒤집힌 카드");
      flippedCards = [];
      if (status === "locked") {
        status = "playing";
      }
    }, FLIP_BACK_MS);
  }

  function finishGame() {
    status = "finished";
    stopTimer();
    elapsedMs = performance.now() - startTimestamp;
    updateStats();

    finalPlayerEl.textContent = playerName;
    finalTimeEl.textContent = formatSeconds(elapsedMs);
    finalMovesEl.textContent = String(moves);
    scoreSaved = false;
    saveBtn.disabled = !supabaseClient;
    setSaveStatus(
      supabaseClient
        ? `${playerName} 님 기록을 저장할 수 있어요.`
        : "config.example.js를 복사해 config.js에 키를 입력해 주세요.",
      supabaseClient ? "" : "error"
    );
    clearOverlay.classList.remove("hidden");
  }

  function renderLeaderboard(rows) {
    if (!rows.length) {
      leaderboardListEl.innerHTML =
        '<li class="leaderboard-empty">아직 기록이 없습니다</li>';
      return;
    }

    leaderboardListEl.innerHTML = rows
      .map((row, index) => {
        const rank = index + 1;
        const name = escapeHtml(row.player_name || "익명");
        const time = formatSeconds(row.time_ms ?? 0);
        const rowMoves = Number(row.moves ?? 0);
        const isMine = playerName && row.player_name === playerName;
        return `
          <li class="leaderboard-item${isMine ? " is-mine" : ""}">
            <span class="rank">${rank}</span>
            <span class="name">${name}</span>
            <span class="meta">${time}초 · ${rowMoves}회</span>
          </li>
        `;
      })
      .join("");
  }

  async function loadLeaderboard() {
    if (!supabaseClient) {
      leaderboardNoteEl.textContent =
        "config.example.js → config.js 로 키를 설정하면 연동됩니다";
      leaderboardListEl.innerHTML =
        '<li class="leaderboard-empty">Supabase 설정이 필요합니다</li>';
      return;
    }

    leaderboardNoteEl.textContent = "빠른 클리어 · 적은 시도";
    leaderboardListEl.innerHTML =
      '<li class="leaderboard-empty">불러오는 중…</li>';

    const { data, error } = await supabaseClient
      .from("scores")
      .select("id, player_name, time_ms, moves, created_at")
      .order("time_ms", { ascending: true })
      .order("moves", { ascending: true })
      .limit(LEADERBOARD_LIMIT);

    if (error) {
      console.error(error);
      leaderboardListEl.innerHTML =
        '<li class="leaderboard-empty">리더보드를 불러오지 못했습니다</li>';
      return;
    }

    renderLeaderboard(data || []);
  }

  async function saveScore() {
    if (!supabaseClient || scoreSaved) return;

    if (!playerName) {
      setSaveStatus("플레이어 이름이 없습니다. 다시 시작해 주세요.", "error");
      return;
    }

    saveBtn.disabled = true;
    setSaveStatus("저장 중…", "");

    try {
      const taken = await isNameTaken(playerName);
      if (taken) {
        setSaveStatus(
          "이미 등록된 이름입니다. 처음으로 돌아가 다른 이름을 사용해 주세요.",
          "error"
        );
        saveBtn.disabled = false;
        return;
      }

      const payload = {
        player_name: playerName,
        time_ms: Math.round(elapsedMs),
        moves,
      };

      const { error } = await supabaseClient.from("scores").insert(payload);

      if (error) {
        console.error(error);
        setSaveStatus(
          "저장에 실패했습니다. RLS 정책을 확인해 주세요.",
          "error"
        );
        saveBtn.disabled = false;
        return;
      }

      scoreSaved = true;
      setSaveStatus("기록이 저장되었습니다!", "success");
      await loadLeaderboard();
    } catch (error) {
      setSaveStatus(
        "저장 중 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.",
        "error"
      );
      saveBtn.disabled = false;
    }
  }

  /** 한 판 더: 저장 전이면 같은 이름으로 바로 재시작, 저장 후면 새 이름 입력 */
  function playAgain() {
    if (status === "idle" || !playerName) {
      showStartScreen({ clearInput: true });
      return;
    }

    if (scoreSaved) {
      showStartScreen({
        message: "기록이 저장된 이름입니다. 다른 이름으로 도전해 주세요.",
        messageType: "error",
        clearInput: true,
      });
      return;
    }

    beginRound();
  }

  /** 처음으로: 이름 입력 화면부터 다시 */
  function goHome() {
    showStartScreen({ clearInput: true });
  }

  startBtn.addEventListener("click", () => {
    startGame();
  });
  playerNameInput.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      startGame();
    }
  });
  resetBtn.addEventListener("click", playAgain);
  playAgainBtn.addEventListener("click", playAgain);
  goHomeBtn.addEventListener("click", goHome);
  changeNameBtn.addEventListener("click", () => {
    showStartScreen({ keepInput: true });
  });
  saveBtn.addEventListener("click", () => {
    saveScore();
  });

  showStartScreen();
  loadLeaderboard();
})();
