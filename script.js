document.addEventListener("DOMContentLoaded", () => {
  let bank = [];

  const btnStart = document.getElementById("btn-start");
  const screenIntro = document.getElementById("screen-intro");
  const screenQuiz = document.getElementById("screen-quiz");
  const screenResult = document.getElementById("screen-result");
  const qCard = document.getElementById("q-card");
  const btnNext = document.getElementById("btn-next");
  const btnBack = document.getElementById("btn-back");
  const btnHome = document.getElementById("btn-home");
  const barFill = document.getElementById("bar-fill");
  const timerDisplay = document.getElementById("timer-display");

  let currentQuestions = [];
  let currentIndex = 0;
  let score = 0;
  let selectedOption = null;
  let timerInterval;
  let timeLeft = 0;
  let elapsedSeconds = 0;
  let timeLimitSeconds = 0;
  let chartInstance = null;
  let lastQuizConfig = { topic: "all", length: 20 };
  let lastQuizQuestions = [];
  let questionResults = [];
  const STORAGE_KEY_PROGRESS = 'uniparJavaProgress';

  const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  const themeLabelMap = {
    all: 'Tudo misturado',
    operadores: 'Operadores',
    selecao: 'If / Switch',
    repeticao: 'Laço While',
    logica: 'Lógica Básica'
  };

  function playSound(type) {
    if (audioCtx.state === 'suspended') audioCtx.resume();
    const osc = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();
    osc.connect(gainNode);
    gainNode.connect(audioCtx.destination);

    if (type === 'correct') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(523.25, audioCtx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(1046.5, audioCtx.currentTime + 0.1);
      gainNode.gain.setValueAtTime(0.2, audioCtx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.4);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.4);
    } else {
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(150, audioCtx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(100, audioCtx.currentTime + 0.2);
      gainNode.gain.setValueAtTime(0.2, audioCtx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.3);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.3);
    }
  }

  fetch('questoes.json')
    .then((response) => response.json())
    .then((data) => {
      bank = data;
      btnStart.textContent = 'Iniciar prova →';
      btnStart.disabled = false;
    })
    .catch((error) => {
      console.error('Erro ao carregar o banco de questões:', error);
      btnStart.textContent = 'Erro ao carregar';
    });

  let selectedTopic = 'all';
  document.querySelectorAll('.tpick').forEach((btn) => {
    btn.addEventListener('click', (event) => {
      document.querySelectorAll('.tpick').forEach((item) => item.classList.remove('on'));
      event.target.classList.add('on');
      selectedTopic = event.target.dataset.topic;
      updateProgressPanel();
    });
  });

  let selectedLen = 100;
  document.querySelectorAll('.len').forEach((btn) => {
    btn.addEventListener('click', (event) => {
      document.querySelectorAll('.len').forEach((item) => item.classList.remove('on'));
      const target = event.target.closest('.len');
      target.classList.add('on');
      selectedLen = parseInt(target.dataset.len, 10);
    });
  });

  function shuffleArray(items) {
    const copy = [...items];
    for (let i = copy.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
  }

  function withBalancedAnswerSlot(question, targetIndex) {
    const correctText = question.options[question.correct];
    const otherTexts = shuffleArray(question.options.filter((_, idx) => idx !== question.correct));
    const mixed = Array(question.options.length).fill(null);
    mixed[targetIndex] = correctText;

    let cursor = 0;
    for (let i = 0; i < mixed.length; i++) {
      if (mixed[i] === null) {
        mixed[i] = otherTexts[cursor];
        cursor++;
      }
    }

    return {
      ...question,
      options: mixed,
      correct: targetIndex
    };
  }

  function buildFilteredQuestions(topic = selectedTopic, len = selectedLen) {
    let filtered = bank;

    if (topic !== 'all') {
      filtered = bank.filter((question) => question.topic === topic);
    }

    if (!filtered.length) return [];

    const base = shuffleArray(filtered);
    const deck = [];
    const answerSlots = [0, 2, 1, 3];

    while (deck.length < len) {
      const baseQuestion = base[deck.length % base.length];
      const targetIndex = answerSlots[deck.length % answerSlots.length];
      deck.push(withBalancedAnswerSlot(baseQuestion, targetIndex));
    }

    return deck.slice(0, len);
  }

  function loadProgressState() {
    try {
      const data = JSON.parse(localStorage.getItem(STORAGE_KEY_PROGRESS));
      return data || { sessions: 0, bestScore: 0, totalCorrect: 0, recent: [], topicStats: {} };
    } catch (error) {
      return { sessions: 0, bestScore: 0, totalCorrect: 0, recent: [], topicStats: {} };
    }
  }

  function saveProgressState(state) {
    localStorage.setItem(STORAGE_KEY_PROGRESS, JSON.stringify(state));
  }

  function formatTime(totalSeconds) {
    const safeTotal = Math.max(0, Number(totalSeconds) || 0);
    const minutes = Math.floor(safeTotal / 60).toString().padStart(2, '0');
    const seconds = (safeTotal % 60).toString().padStart(2, '0');
    return `${minutes}:${seconds}`;
  }

  function getThemeLabel(topic) {
    return themeLabelMap[topic] || 'Tema';
  }

  function renderThemeProgress(themeStats) {
    const container = document.getElementById('theme-progress');
    if (!container) return;

    const entries = Object.entries(themeStats || {}).sort(([, a], [, b]) => (b.best || 0) - (a.best || 0));

    if (!entries.length) {
      container.innerHTML = '<div class="theme-row empty"><span>Sem dados</span><strong>—</strong></div>';
      return;
    }

    container.innerHTML = entries.slice(0, 4).map(([topic, info]) => `
      <div class="theme-row">
        <span>${getThemeLabel(topic)}</span>
        <strong>${Math.round(info.best || 0)}%</strong>
      </div>
    `).join('');
  }

  function updateProgressPanel() {
    const state = loadProgressState();
    const best = Number(state.bestScore || 0);
    const level = best >= 85 ? 'Avançado' : best >= 70 ? 'Bom' : best >= 40 ? 'Em progresso' : 'Iniciante';

    document.getElementById('stat-sessions').textContent = state.sessions || 0;
    document.getElementById('stat-best').textContent = `${best}%`;
    document.getElementById('stat-total-correct').textContent = state.totalCorrect || 0;
    document.getElementById('progress-level').textContent = level;

    const currentThemeLabel = document.getElementById('current-theme-label');
    if (currentThemeLabel) {
      currentThemeLabel.textContent = getThemeLabel(selectedTopic);
    }

    renderThemeProgress(state.topicStats || {});
  }

  function recordProgressSnapshot(pct, totalQuestions, finalScore, topic) {
    const state = loadProgressState();
    state.sessions = (state.sessions || 0) + 1;
    state.bestScore = Math.max(state.bestScore || 0, pct);
    state.totalCorrect = (state.totalCorrect || 0) + finalScore;
    state.recent = (state.recent || []).concat([{ date: new Date().toISOString(), pct, topic, totalQuestions }]);
    if (state.recent.length > 8) state.recent = state.recent.slice(-8);

    const safeTopic = topic || 'all';
    state.topicStats = state.topicStats || {};
    if (!state.topicStats[safeTopic]) {
      state.topicStats[safeTopic] = { attempts: 0, best: 0, correct: 0, total: 0 };
    }
    state.topicStats[safeTopic].attempts += 1;
    state.topicStats[safeTopic].best = Math.max(state.topicStats[safeTopic].best || 0, pct);
    state.topicStats[safeTopic].correct += finalScore;
    state.topicStats[safeTopic].total += totalQuestions;

    saveProgressState(state);
    updateProgressPanel();
  }

  function getWrongQuestionsFromCurrentRound() {
    if (!currentQuestions.length) return [];

    return currentQuestions.reduce((acc, question, index) => {
      const result = questionResults[index];
      if (!result || result.isCorrect) return acc;
      acc.push({
        ...question,
        selectedIndex: result.selectedIndex,
        correct: question.correct
      });
      return acc;
    }, []);
  }

  function renderReviewPanel(wrongItems) {
    const reviewList = document.getElementById('review-list');
    const reviewPanel = document.getElementById('review-panel');
    if (!reviewList || !reviewPanel) return;

    if (!wrongItems || wrongItems.length === 0) {
      reviewList.innerHTML = '<div class="review-empty">Você não teve erros nesta rodada. A revisão está limpa e pronta para o próximo teste.</div>';
      reviewPanel.classList.remove('hidden');
      return;
    }

    reviewList.innerHTML = wrongItems.map((item, index) => `
      <div class="review-card bad">
        <div class="review-badge">Erro ${index + 1}</div>
        <div class="review-question">${item.statement}</div>
        <div class="review-answer"><strong>Resposta certa:</strong> ${item.options[item.correct]}</div>
        <div class="review-answer"><strong>Você marcou:</strong> ${item.options[item.selectedIndex] || 'Sem resposta'}</div>
      </div>
    `).join('');

    reviewPanel.classList.remove('hidden');
  }

  function closeReviewPanel() {
    const panel = document.getElementById('review-panel');
    if (panel) panel.classList.add('hidden');
  }

  function startQuizWithQuestions(questions) {
    if (!questions || questions.length === 0) {
      alert('Nenhuma questão encontrada para este filtro.');
      return;
    }

    currentQuestions = questions.slice();
    currentIndex = 0;
    score = 0;
    questionResults = Array(currentQuestions.length).fill(null);
    closeReviewPanel();

    timeLimitSeconds = currentQuestions.length * 60;
    timeLeft = timeLimitSeconds;
    elapsedSeconds = 0;
    startTimer();

    screenIntro.classList.add('hidden');
    screenQuiz.classList.remove('hidden');
    renderQuestion();
  }

  btnStart.addEventListener('click', () => {
    const filtered = buildFilteredQuestions(selectedTopic, selectedLen);

    if (filtered.length === 0) {
      alert('Nenhuma questão encontrada para este filtro.');
      return;
    }

    lastQuizConfig = { topic: selectedTopic, length: selectedLen };
    lastQuizQuestions = filtered.slice();
    startQuizWithQuestions(filtered);
  });

  function startTimer() {
    timerDisplay.classList.remove('danger');
    updateTimerUI();
    clearInterval(timerInterval);

    timerInterval = setInterval(() => {
      if (timeLeft > 0) {
        timeLeft -= 1;
        elapsedSeconds += 1;
      }

      updateTimerUI();

      if (timeLeft <= 10) {
        timerDisplay.classList.add('danger');
      }

      if (timeLeft <= 0) {
        clearInterval(timerInterval);
        alert('O tempo esgotou! Entregando a prova automaticamente.');
        showResult();
      }
    }, 1000);
  }

  function updateTimerUI() {
    timerDisplay.textContent = `⏳ ${formatTime(timeLeft)}`;
  }

  function renderQuestion() {
    selectedOption = null;
    btnNext.disabled = true;
    const q = currentQuestions[currentIndex];

    document.getElementById('q-now').textContent = currentIndex + 1;
    document.getElementById('q-total').textContent = currentQuestions.length;
    barFill.style.width = `${((currentIndex + 1) / currentQuestions.length) * 100}%`;

    let html = `<div class="q-statement">${q.statement}</div>`;
    if (q.code) html += `<pre class="code">${q.code.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</pre>`;

    const optionsMapped = q.options.map((texto, index) => ({
      textoOriginal: texto,
      originalIndex: index,
      isCerta: index === q.correct
    }));

    html += '<div class="options" id="opts-container">';
    optionsMapped.forEach((optData, i) => {
      const letter = String.fromCharCode(65 + i);
      html += `
        <button type="button" class="option" data-option-index="${optData.originalIndex}" data-correct="${optData.isCerta}" aria-pressed="false">
          <span class="key">${letter}</span>
          <span class="txt">${optData.textoOriginal.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</span>
        </button>`;
    });
    html += '</div><div id="feedback-area"></div>';
    qCard.innerHTML = html;

    document.querySelectorAll('.option').forEach((optEl) => {
      optEl.addEventListener('click', function () {
        if (selectedOption !== null) return;
        selectedOption = true;
        document.getElementById('opts-container').classList.add('locked');

        const selectedIndex = Number(this.dataset.optionIndex);
        const isCorrect = selectedIndex === q.correct;
        questionResults[currentIndex] = {
          isCorrect,
          selectedIndex,
          correctIndex: q.correct
        };

        playSound(isCorrect ? 'correct' : 'wrong');

        document.querySelectorAll('.option').forEach((item) => item.setAttribute('aria-pressed', 'false'));
        this.setAttribute('aria-pressed', 'true');

        if (isCorrect) {
          this.classList.add('correct');
          score += 1;
        } else {
          this.classList.add('wrong');
          document.querySelector('.option[data-correct="true"]').classList.add('correct');
        }

        document.getElementById('feedback-area').innerHTML = `
          <div class="feedback ${isCorrect ? 'ok' : 'no'}">
            <div class="fh">${isCorrect ? 'Você acertou!' : 'Você errou!'}</div>
            <div class="why">${q.explain}</div>
          </div>
        `;
        btnNext.disabled = false;
      });
    });
  }

  document.getElementById('btn-skip').addEventListener('click', () => {
    if (selectedOption !== null) return;

    if (!questionResults[currentIndex]) {
      questionResults[currentIndex] = {
        isCorrect: false,
        selectedIndex: null,
        correctIndex: currentQuestions[currentIndex].correct
      };
    }

    document.getElementById('feedback-area').innerHTML = `
      <div class="feedback no">
        <div class="fh">Questão pulada</div>
        <div class="why">Você não respondeu esta questão. Continue para a próxima e tente acertar as restantes.</div>
      </div>
    `;
    selectedOption = true;
    document.getElementById('opts-container').classList.add('locked');
    btnNext.disabled = false;
  });

  btnNext.addEventListener('click', () => {
    currentIndex += 1;
    if (currentIndex >= currentQuestions.length) {
      showResult();
    } else {
      renderQuestion();
    }
  });

  function goToIntro() {
    clearInterval(timerInterval);
    screenQuiz.classList.add('hidden');
    screenResult.classList.add('hidden');
    screenIntro.classList.remove('hidden');
    qCard.innerHTML = '';
    btnNext.disabled = true;
    currentQuestions = [];
    currentIndex = 0;
    score = 0;
    questionResults = [];
    selectedOption = null;
    timeLeft = 0;
    elapsedSeconds = 0;
    timeLimitSeconds = 0;
    closeReviewPanel();
    updateTimerUI();
  }

  btnBack.addEventListener('click', () => {
    if (!confirm('Voltar ao início vai encerrar a prova atual. Deseja continuar?')) return;
    goToIntro();
  });

  document.getElementById('btn-quit').addEventListener('click', () => {
    if (!confirm('Tem certeza que deseja abandonar a prova?')) return;
    goToIntro();
  });

  function showResult() {
    clearInterval(timerInterval);
    screenQuiz.classList.add('hidden');
    screenResult.classList.remove('hidden');

    const resultShell = document.querySelector('.result-shell');
    const resultHead = document.querySelector('.result-head');
    const chartWrap = document.querySelector('.chart-container');
    const stats = document.querySelectorAll('.result-stat');

    if (resultShell) resultShell.style.opacity = '0.68';
    if (resultHead) resultHead.style.opacity = '0.15';
    if (chartWrap) chartWrap.style.opacity = '0.15';
    stats.forEach((stat, index) => {
      stat.style.opacity = '0';
      stat.style.transform = 'translateY(14px) scale(0.98)';
      stat.style.transition = `opacity 0.7s ease ${index * 0.11}s, transform 0.7s ease ${index * 0.11}s`;
    });

    setTimeout(() => {
      if (resultShell) resultShell.style.transition = 'opacity 0.6s ease, box-shadow 0.6s ease, border-color 0.6s ease';
      if (resultHead) resultHead.style.transition = 'opacity 0.75s ease';
      if (chartWrap) chartWrap.style.transition = 'opacity 0.75s ease';
      if (resultShell) resultShell.style.opacity = '1';
      if (resultHead) resultHead.style.opacity = '1';
      if (chartWrap) chartWrap.style.opacity = '1';
      if (resultHead) resultHead.style.animation = 'resultReveal 1.25s cubic-bezier(0.2, 0.9, 0.2, 1)';
      if (chartWrap) chartWrap.style.animation = 'fade 1.1s ease';
      stats.forEach((stat, index) => {
        stat.style.opacity = '1';
        stat.style.transform = 'translateY(0) scale(1)';
        stat.style.transition = `opacity 0.7s ease ${index * 0.11 + 0.2}s, transform 0.7s ease ${index * 0.11 + 0.2}s`;
      });
    }, 180);

    const totalQuestions = currentQuestions.length;
    const pct = totalQuestions ? Math.round((score / totalQuestions) * 100) : 0;
    const errors = totalQuestions - score;
    const elapsedTime = Math.max(0, elapsedSeconds || 0);

    document.getElementById('res-pct').textContent = `${pct}%`;
    document.getElementById('res-frac').textContent = `${score}/${totalQuestions}`;
    document.getElementById('res-nota').textContent = (pct / 10).toFixed(1).replace('.', ',');
    document.getElementById('res-acertos').textContent = score;
    document.getElementById('res-erros').textContent = errors;
    document.getElementById('res-tempo').textContent = formatTime(elapsedTime);

    const badgeStatus = document.getElementById('badge-status');
    const performanceMessage = document.getElementById('performance-message');
    const verdict = document.getElementById('res-verdict');

    if (pct >= 70) {
      badgeStatus.textContent = 'Aprovado';
      badgeStatus.classList.add('pass');
      badgeStatus.classList.remove('fail');
      verdict.textContent = 'Excelente desempenho!';
      performanceMessage.innerHTML = `Você ficou em <strong>${pct}%</strong> e mostrou grande domínio da matéria.`;
      performanceMessage.className = 'performance-message pass';
      resultShell.style.boxShadow = '0 25px 60px rgba(54, 211, 153, 0.18), inset 0 1px 0 rgba(255, 255, 255, 0.06)';
      resultShell.style.borderColor = 'rgba(54, 211, 153, 0.28)';
    } else if (pct >= 40) {
      badgeStatus.textContent = 'Em andamento';
      badgeStatus.classList.remove('pass');
      badgeStatus.classList.remove('fail');
      verdict.textContent = 'Bom esforço!';
      performanceMessage.innerHTML = `Seu desempenho foi <strong>${pct}%</strong>. Ainda há espaço para evoluir com mais revisão.`;
      performanceMessage.className = 'performance-message average';
      resultShell.style.boxShadow = '0 25px 60px rgba(124, 108, 255, 0.18), inset 0 1px 0 rgba(255, 255, 255, 0.06)';
      resultShell.style.borderColor = 'rgba(124, 108, 255, 0.32)';
    } else {
      badgeStatus.textContent = 'Precisa estudar';
      badgeStatus.classList.add('fail');
      badgeStatus.classList.remove('pass');
      verdict.textContent = 'Vamos revisar mais?';
      performanceMessage.innerHTML = `Você alcançou <strong>${pct}%</strong>. A prática continua sendo a melhor forma de fixar a lógica.`;
      performanceMessage.className = 'performance-message fail';
      resultShell.style.boxShadow = '0 25px 60px rgba(251, 111, 132, 0.18), inset 0 1px 0 rgba(255, 255, 255, 0.06)';
      resultShell.style.borderColor = 'rgba(251, 111, 132, 0.28)';
    }

    const history = JSON.parse(localStorage.getItem('uniparJavaScores')) || [];
    history.push(pct);
    if (history.length > 10) history.shift();
    localStorage.setItem('uniparJavaScores', JSON.stringify(history));

    recordProgressSnapshot(pct, totalQuestions, score, selectedTopic);
    renderReviewPanel(getWrongQuestionsFromCurrentRound());
    updateProgressPanel();
    renderChart(history);
  }

  function renderChart(historyData) {
    const ctx = document.getElementById('chart-history').getContext('2d');

    if (chartInstance) chartInstance.destroy();

    const labels = historyData.map((_, index) => `T${index + 1}`);
    const lastValue = historyData[historyData.length - 1] ?? 0;
    const isStrong = lastValue >= 70;
    const isMedium = lastValue >= 40;

    const palette = isStrong
      ? {
          border: '#5EE7B0',
          fill: 'rgba(94, 231, 176, 0.18)',
          point: '#D6FFF1',
          glow: 'rgba(94, 231, 176, 0.26)'
        }
      : isMedium
        ? {
            border: '#9A8BFF',
            fill: 'rgba(154, 139, 255, 0.15)',
            point: '#E0D9FF',
            glow: 'rgba(154, 139, 255, 0.22)'
          }
        : {
            border: '#FF8AA3',
            fill: 'rgba(255, 138, 163, 0.14)',
            point: '#FFD8E4',
            glow: 'rgba(255, 138, 163, 0.2)'
          };

    chartInstance = new Chart(ctx, {
      type: 'line',
      data: {
        labels,
        datasets: [{
          label: 'Evolução da Nota (%)',
          data: historyData,
          borderColor: palette.border,
          backgroundColor: palette.fill,
          borderWidth: 2.5,
          pointBackgroundColor: palette.point,
          pointBorderColor: '#101722',
          pointBorderWidth: 1.8,
          pointRadius: 3.5,
          pointHoverRadius: 5,
          fill: true,
          tension: 0.38,
          borderJoinStyle: 'round',
          cubicInterpolationMode: 'monotone',
          shadowColor: palette.glow,
          shadowBlur: 16
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: { intersect: false, mode: 'index' },
        animation: { duration: 850, easing: 'easeOutCubic' },
        scales: {
          y: {
            beginAtZero: true,
            max: 100,
            grid: { color: 'rgba(255, 255, 255, 0.06)', drawBorder: false },
            ticks: { color: '#D0D7F1', padding: 8 },
            border: { display: false }
          },
          x: {
            grid: { display: false, drawBorder: false },
            ticks: { color: '#D0D7F1', padding: 6 },
            border: { display: false }
          }
        },
        plugins: {
          legend: {
            display: true,
            labels: { color: '#E9ECF5', boxWidth: 12, usePointStyle: true, pointStyle: 'circle' }
          },
          tooltip: {
            backgroundColor: 'rgba(12, 16, 25, 0.96)',
            titleColor: '#fff',
            bodyColor: '#fff',
            borderColor: palette.border,
            borderWidth: 1,
            displayColors: true,
            padding: 10,
            titleFont: { family: 'Plus Jakarta Sans' },
            bodyFont: { family: 'Plus Jakarta Sans' }
          }
        }
      }
    });
  }

  function shareResult() {
    const totalQuestions = currentQuestions.length || 0;
    const pct = totalQuestions ? Math.round((score / totalQuestions) * 100) : 0;
    const nota = (pct / 10).toFixed(1).replace('.', ',');
    const mensagem = `Meu resultado no Simulado de Programação Java: ${score}/${totalQuestions} acertos (${pct}%), nota ${nota}/10.`;

    if (navigator.share) {
      navigator.share({
        title: 'Simulado de Programação Java',
        text: mensagem,
        url: window.location.href
      }).catch(() => {
        fallbackShareCopy(mensagem);
      });
      return;
    }

    fallbackShareCopy(mensagem);
  }

  function fallbackShareCopy(mensagem) {
    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(mensagem)
        .then(() => alert('Resultado copiado para a área de transferência!'))
        .catch(() => alert('Seu resultado foi: ' + mensagem));
      return;
    }

    const temp = document.createElement('textarea');
    temp.value = mensagem;
    document.body.appendChild(temp);
    temp.select();
    document.execCommand('copy');
    document.body.removeChild(temp);
    alert('Resultado copiado para a área de transferência!');
  }

  document.getElementById('btn-review').addEventListener('click', () => {
    renderReviewPanel(getWrongQuestionsFromCurrentRound());
  });

  document.getElementById('btn-close-review').addEventListener('click', closeReviewPanel);
  document.getElementById('btn-share').addEventListener('click', shareResult);

  document.getElementById('btn-repeat').addEventListener('click', () => {
    if (!lastQuizQuestions.length) {
      alert('Ainda não há uma prova anterior para repetir.');
      return;
    }

    selectedTopic = lastQuizConfig.topic;
    selectedLen = lastQuizConfig.length;
    document.querySelectorAll('.tpick').forEach((item) => {
      item.classList.toggle('on', item.dataset.topic === selectedTopic);
    });
    document.querySelectorAll('.len').forEach((item) => {
      item.classList.toggle('on', parseInt(item.dataset.len, 10) === selectedLen);
    });

    screenResult.classList.add('hidden');
    closeReviewPanel();
    startQuizWithQuestions(lastQuizQuestions.slice());
  });

  document.getElementById('btn-retry').addEventListener('click', () => {
    screenResult.classList.add('hidden');
    screenIntro.classList.remove('hidden');
    qCard.innerHTML = '';
    currentQuestions = [];
    currentIndex = 0;
    score = 0;
    questionResults = [];
    selectedOption = null;
    timeLeft = 0;
    elapsedSeconds = 0;
    timeLimitSeconds = 0;
    closeReviewPanel();
    updateTimerUI();
  });

  btnHome.addEventListener('click', () => {
    goToIntro();
  });

  updateProgressPanel();
});
