/* ============================================
   Acoustic Preferences — Game Logic
   ============================================ */

(function () {
  'use strict';

  // --- Round Data ---
  var rounds = [
    {
      species: 'Hourglass Treefrog',
      latin: 'Dendropsophus ebraccatus',
      image: 'images/game/hourglass-treefrog.png',
      credit: 'Image: Dylan DiCicco',
      soundGood: 'files/sounds/hourglass_f_Good_animalSounds_011.mp3',
      soundBad: 'files/sounds/hourglass_f_Bad_animalSounds_012.mp3',
      goodLabel: 'A',
      humansAgree: true
    },
    {
      species: 'Zebra Finch',
      latin: 'Taeniopygia castanotis',
      image: 'images/game/zebra-finch.png',
      credit: 'Image: Damond Kyllo',
      soundGood: 'files/sounds/ZF_ccc_Good_animalSounds_067.mp3',
      soundBad: 'files/sounds/ZF_ccc_Bad_animalSounds_068.mp3',
      goodLabel: 'A',
      humansAgree: false
    },
    {
      species: 'Pacific Field Cricket',
      latin: 'Teleogryllus oceanicus',
      image: 'images/game/cricket.png',
      credit: 'Image: F.E. Wood',
      soundGood: 'files/sounds/Cricket_l_Good_animalSounds_023.mp3',
      soundBad: 'files/sounds/Cricket_l_Bad_animalSounds_024.mp3',
      goodLabel: 'A',
      humansAgree: true
    },
    {
      species: 'Song Sparrow',
      latin: 'Melospiza melodia',
      image: 'images/game/song-sparrow.jpg',
      credit: '',
      soundGood: 'files/sounds/SongSparrow_qrt_Good_animalSounds_170.mp3',
      soundBad: 'files/sounds/SongSparrow_qrt_Bad_animalSounds_171.mp3',
      goodLabel: 'A',
      humansAgree: true
    },
    {
      species: 'Gelada',
      latin: 'Theropithecus gelada',
      image: 'images/game/gelada.jpg',
      credit: '',
      soundGood: 'files/sounds/Gelada_sss_Good_animalSounds_080.mp3',
      soundBad: 'files/sounds/Gelada_sss_Bad_animalSounds_081.mp3',
      goodLabel: 'A',
      humansAgree: false
    },
    {
      species: 'T\u00fangara Frog',
      latin: 'Engystomops pustulosus',
      image: 'images/game/tungara-frog.png',
      credit: 'Image: Damond Kyllo',
      soundGood: 'files/sounds/tungara_be_Good_animalSounds_203.mp3',
      soundBad: 'files/sounds/tungara_be_Bad_animalSounds_031.mp3',
      goodLabel: 'A',
      humansAgree: true
    }
  ];

  // Randomize which side (A/B) the "good" sound appears on for each round
  // Note: only change goodLabel — startRound() handles the actual sound mapping
  rounds.forEach(function (round) {
    if (Math.random() < 0.5) {
      round.goodLabel = 'B';
    }
  });

  // --- i18n ---
  var i18n = window.GameI18n || {};

  // Detect browser language, fall back to English
  var browserLang = (navigator.language || 'en').split('-')[0];
  var savedLang = localStorage.getItem('gameLang');
  var currentLang = (savedLang && i18n[savedLang]) ? savedLang :
                    (i18n[browserLang] ? browserLang : 'en');

  function t(key) {
    var lang = i18n[currentLang] || i18n.en;
    return (lang && lang[key] !== undefined) ? lang[key] : (i18n.en[key] || key);
  }

  function tSpecies(englishName) {
    var lang = i18n[currentLang] || i18n.en;
    var sp = lang && lang.species && lang.species[englishName];
    return sp || (i18n.en.species && i18n.en.species[englishName]) || { name: englishName, nameInText: englishName, detail: '' };
  }

  function fill(template, vars) {
    return template.replace(/\{(\w+)\}/g, function (_, key) {
      return vars[key] !== undefined ? vars[key] : '';
    });
  }

  // Update all static translatable text on the page
  function applyLanguage() {
    document.documentElement.lang = currentLang;

    // Intro screen
    var introTitle = document.getElementById('intro-title');
    var introSubtitle = document.getElementById('intro-subtitle');
    var introText = document.getElementById('intro-text');
    var introDetails = document.getElementById('intro-details');
    var introNote = document.getElementById('intro-note');
    var creditsLabel = document.getElementById('credits-label');

    if (introTitle) introTitle.textContent = t('title');
    if (introSubtitle) introSubtitle.textContent = t('subtitle');
    if (introText) introText.textContent = t('introText');
    if (introDetails) introDetails.innerHTML = t('detailsHtml');
    if (introNote) introNote.textContent = t('roundNote');
    if (creditsLabel) creditsLabel.textContent = t('creditsLabel');

    var btnStart = document.getElementById('btn-start');
    if (btnStart) btnStart.textContent = t('startGame');

    // Round screen
    var gameQuestion = document.getElementById('game-question');
    var labelA = document.getElementById('label-a');
    var labelB = document.getElementById('label-b');
    var gameVs = document.getElementById('game-vs');
    var btnReplay = document.getElementById('btn-replay');

    if (gameQuestion) gameQuestion.textContent = t('whichSound');
    if (labelA) labelA.textContent = t('soundA');
    if (labelB) labelB.textContent = t('soundB');
    if (gameVs) gameVs.textContent = t('vs');
    if (btnReplay) btnReplay.textContent = t('replay');

    // Update listening status if round is active
    var statusP = document.querySelector('#listening-status p');
    if (statusP) {
      var soundABtn = document.getElementById('sound-a-btn');
      if (soundABtn && soundABtn.classList.contains('enabled')) {
        statusP.textContent = t('tapPrompt');
      } else {
        statusP.textContent = t('listenPrompt');
      }
    }

    // Reveal screen — re-render if active
    var screenReveal = document.getElementById('screen-reveal');
    if (screenReveal && screenReveal.classList.contains('game-screen-active') && lastReveal) {
      renderRevealContent(lastReveal.chosen, lastReveal.correct, lastReveal.round);
    }

    // Summary screen
    var summaryTitle = document.getElementById('summary-title');
    var summaryText = document.getElementById('summary-text');
    var darwinQuote = document.getElementById('darwin-quote');
    var darwinCite = document.getElementById('darwin-cite');
    var btnRestart = document.getElementById('btn-restart');
    var btnPaper = document.getElementById('btn-paper');

    if (summaryTitle) summaryTitle.textContent = t('results');
    if (summaryText) summaryText.textContent = t('summaryText');
    if (darwinQuote) darwinQuote.textContent = t('darwinQuote');
    if (darwinCite) darwinCite.textContent = t('darwinCite');
    if (btnRestart) btnRestart.textContent = t('playAgain');
    if (btnPaper) btnPaper.textContent = t('readPaper');

    // Re-render score if summary is active
    var screenSummary = document.getElementById('screen-summary');
    if (screenSummary && screenSummary.classList.contains('game-screen-active')) {
      renderScore();
    }

    // Update btn-next text if reveal is active
    if (screenReveal && screenReveal.classList.contains('game-screen-active')) {
      var btnNext = document.getElementById('btn-next');
      if (btnNext) {
        btnNext.textContent = (currentRound < 5) ? t('nextRound') : t('seeResults');
      }
    }
  }

  // --- State ---
  var currentRound = 0;
  var score = 0;
  var audioA = null;
  var audioB = null;
  var isPlaying = false;
  var lastReveal = null; // stored so language switch can re-render reveal screen

  // --- DOM Elements ---
  var screenIntro = document.getElementById('screen-intro');
  var screenRound = document.getElementById('screen-round');
  var screenReveal = document.getElementById('screen-reveal');
  var screenSummary = document.getElementById('screen-summary');

  var btnNext = document.getElementById('btn-next');
  var btnRestart = document.getElementById('btn-restart');
  var btnReplay = document.getElementById('btn-replay');

  var soundABtn = document.getElementById('sound-a-btn');
  var soundBBtn = document.getElementById('sound-b-btn');
  var listeningStatus = document.getElementById('listening-status');
  var gameProgress = document.getElementById('game-progress');
  var revealProgress = document.getElementById('reveal-progress');

  // --- Screen Management ---
  function showScreen(screen) {
    [screenIntro, screenRound, screenReveal, screenSummary].forEach(function (s) {
      s.classList.remove('game-screen-active');
    });
    screen.classList.add('game-screen-active');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // --- Audio ---
  function stopAll() {
    if (audioA) { audioA.pause(); audioA.currentTime = 0; }
    if (audioB) { audioB.pause(); audioB.currentTime = 0; }
    soundABtn.classList.remove('playing');
    soundBBtn.classList.remove('playing');
    isPlaying = false;
  }

  function playSound(which) {
    stopAll();
    isPlaying = true;
    var audio = (which === 'A') ? audioA : audioB;
    var btn   = (which === 'A') ? soundABtn : soundBBtn;

    btn.classList.add('playing');
    audio.play();
    audio.onended = function () {
      btn.classList.remove('playing');
      isPlaying = false;
      if (which === 'A') {
        setTimeout(function () { playSound('B'); }, 500);
      } else {
        enableChoices();
      }
    };
  }

  function enableChoices() {
    soundABtn.classList.add('enabled');
    soundBBtn.classList.add('enabled');
    soundABtn.disabled = false;
    soundBBtn.disabled = false;
    listeningStatus.querySelector('p').textContent = t('tapPrompt');
    btnReplay.style.display = 'inline-block';
  }

  // --- Round Setup ---
  function startRound() {
    var round = rounds[currentRound];

    gameProgress.textContent = (currentRound + 1) + ' / 6';

    soundABtn.classList.remove('enabled', 'selected', 'playing');
    soundBBtn.classList.remove('enabled', 'selected', 'playing');
    soundABtn.disabled = true;
    soundBBtn.disabled = true;
    btnReplay.style.display = 'none';
    listeningStatus.querySelector('p').textContent = t('listenPrompt');

    // Load audio: good sound goes to whichever button goodLabel says
    if (round.goodLabel === 'A') {
      audioA = new Audio(round.soundGood);
      audioB = new Audio(round.soundBad);
    } else {
      audioA = new Audio(round.soundBad);
      audioB = new Audio(round.soundGood);
    }

    // Preload the reveal image while the user listens
    var preload = new Image();
    preload.src = round.image;

    showScreen(screenRound);

    setTimeout(function () { playSound('A'); }, 800);
  }

  // --- Choice ---
  function makeChoice(chosen) {
    if (isPlaying) stopAll();

    var round = rounds[currentRound];
    var correct = (chosen === round.goodLabel);

    soundABtn.classList.remove('enabled', 'playing');
    soundBBtn.classList.remove('enabled', 'playing');
    soundABtn.disabled = true;
    soundBBtn.disabled = true;
    btnReplay.style.display = 'none';

    if (chosen === 'A') {
      soundABtn.classList.add('selected');
    } else {
      soundBBtn.classList.add('selected');
    }

    if (correct) score++;

    setTimeout(function () {
      showReveal(chosen, correct, round);
    }, 600);
  }

  // --- Reveal ---
  function renderRevealContent(chosen, correct, round) {
    var sp = tSpecies(round.species);
    var resultDiv = document.getElementById('reveal-result');
    if (correct) {
      resultDiv.innerHTML = '<h3 class="result-match">' +
        fill(t('agreed'), { species: sp.nameInText }) + '</h3>';
    } else {
      resultDiv.innerHTML = '<h3 class="result-mismatch">' +
        fill(t('disagreed'), { species: sp.nameInText }) + '</h3>';
    }

    document.getElementById('reveal-species').textContent = sp.name;
    document.getElementById('reveal-latin').textContent = round.latin;
    document.getElementById('reveal-detail').textContent = sp.detail;

    var agreementEl = document.getElementById('reveal-agreement');
    if (round.humansAgree) {
      agreementEl.textContent = t('humansAgreed');
      agreementEl.className = 'game-reveal-agreement agreed';
    } else {
      agreementEl.textContent = t('humansDisagreed');
      agreementEl.className = 'game-reveal-agreement disagreed';
    }

    document.getElementById('reveal-credit').textContent = round.credit;
    btnNext.textContent = (currentRound < 5) ? t('nextRound') : t('seeResults');
  }

  function showReveal(chosen, correct, round) {
    lastReveal = { chosen: chosen, correct: correct, round: round };
    revealProgress.textContent = (currentRound + 1) + ' / 6';

    var revealImg = document.getElementById('reveal-animal-img');
    revealImg.style.opacity = '0';
    revealImg.src = round.image;
    revealImg.alt = round.species;
    revealImg.onload = function () { revealImg.style.opacity = '1'; };

    renderRevealContent(chosen, correct, round);
    showScreen(screenReveal);
  }

  // --- Summary ---
  function renderScore() {
    var scoreDiv = document.getElementById('game-score');
    if (scoreDiv) {
      scoreDiv.innerHTML = '<span class="score-number">' + score + ' / 6</span>' +
        fill(t('scoreLabel'), { score: score });
    }
  }

  function showSummary() {
    renderScore();
    showScreen(screenSummary);
  }

  // --- Language Selector ---
  var langSelect = document.getElementById('lang-select');
  if (langSelect) {
    // Set initial value
    langSelect.value = currentLang;

    langSelect.addEventListener('change', function () {
      currentLang = langSelect.value;
      localStorage.setItem('gameLang', currentLang);
      applyLanguage();
    });
  }

  // Apply language on load
  applyLanguage();

  // --- Event Listeners ---
  function resetAndStart() {
    currentRound = 0;
    score = 0;
    lastReveal = null;
    rounds.forEach(function (round) {
      round.goodLabel = (Math.random() < 0.5) ? 'B' : 'A';
    });
    startRound();
  }

  document.getElementById('btn-start').addEventListener('click', resetAndStart);

  soundABtn.addEventListener('click', function () {
    if (soundABtn.classList.contains('enabled') && !isPlaying) {
      makeChoice('A');
    }
  });

  soundBBtn.addEventListener('click', function () {
    if (soundBBtn.classList.contains('enabled') && !isPlaying) {
      makeChoice('B');
    }
  });

  btnReplay.addEventListener('click', function () {
    stopAll();
    soundABtn.classList.remove('enabled', 'selected');
    soundBBtn.classList.remove('enabled', 'selected');
    soundABtn.disabled = true;
    soundBBtn.disabled = true;
    btnReplay.style.display = 'none';
    listeningStatus.querySelector('p').textContent = t('listenPrompt');
    setTimeout(function () { playSound('A'); }, 300);
  });

  btnNext.addEventListener('click', function () {
    currentRound++;
    if (currentRound < 6) {
      startRound();
    } else {
      showSummary();
    }
  });

  btnRestart.addEventListener('click', resetAndStart);

})();
