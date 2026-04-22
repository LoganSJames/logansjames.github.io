/* ============================================
   Calls of the Wild — Game Logic
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
      detail: 'These frogs prefer calls with extra "clicks" added.',
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
      detail: 'Zebra finches prefer songs learned during development over "isolate" songs produced without learning.',
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
      detail: 'Crickets prefer "chirps" over "purrs" when choosing a mate.',
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
      detail: 'Song sparrows prefer some individuals over others.',
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
      detail: 'Geladas prefer more "complex" vocalizations over more simple "grunts".',
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
      detail: 'Female t\u00fangara frogs strongly prefer calls with more "chucks" appended to the whine.',
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

  // --- State ---
  var currentRound = 0;
  var score = 0;
  var audioA = null;
  var audioB = null;
  var hasPlayedA = false;
  var hasPlayedB = false;
  var isPlaying = false;

  // --- DOM Elements ---
  var screenIntro = document.getElementById('screen-intro');
  var screenRound = document.getElementById('screen-round');
  var screenReveal = document.getElementById('screen-reveal');
  var screenSummary = document.getElementById('screen-summary');

  var btnStart = document.getElementById('btn-start');
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
    var audio, btn;
    if (which === 'A') {
      audio = audioA;
      btn = soundABtn;
    } else {
      audio = audioB;
      btn = soundBBtn;
    }
    btn.classList.add('playing');
    audio.play();
    audio.onended = function () {
      btn.classList.remove('playing');
      isPlaying = false;
      if (which === 'A') {
        hasPlayedA = true;
        // Auto-play B after a short pause
        setTimeout(function () {
          playSound('B');
        }, 500);
      } else {
        hasPlayedB = true;
        enableChoices();
      }
    };
  }

  function enableChoices() {
    soundABtn.classList.add('enabled');
    soundBBtn.classList.add('enabled');
    soundABtn.disabled = false;
    soundBBtn.disabled = false;
    listeningStatus.querySelector('p').textContent = 'Tap the sound you liked more!';
    btnReplay.style.display = 'inline-block';
  }

  // --- Round Setup ---
  function startRound() {
    var round = rounds[currentRound];
    hasPlayedA = false;
    hasPlayedB = false;

    gameProgress.textContent = (currentRound + 1) + ' / 6';

    soundABtn.classList.remove('enabled', 'selected', 'playing');
    soundBBtn.classList.remove('enabled', 'selected', 'playing');
    soundABtn.disabled = true;
    soundBBtn.disabled = true;
    btnReplay.style.display = 'none';
    listeningStatus.querySelector('p').textContent = 'Listen to both sounds, then pick your favorite';

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

    // Auto-play sound A after a short delay
    setTimeout(function () {
      playSound('A');
    }, 800);
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

    // Show reveal after a brief moment
    setTimeout(function () {
      showReveal(chosen, correct, round);
    }, 600);
  }

  // --- Reveal ---
  function showReveal(chosen, correct, round) {
    revealProgress.textContent = (currentRound + 1) + ' / 6';

    var resultDiv = document.getElementById('reveal-result');
    if (correct) {
      resultDiv.innerHTML = '<h3 class="result-match">You agreed with the ' + round.species + '!</h3>';
    } else {
      resultDiv.innerHTML = '<h3 class="result-mismatch">You disagreed with the ' + round.species + '!</h3>';
    }

    var revealImg = document.getElementById('reveal-animal-img');
    revealImg.style.opacity = '0';
    revealImg.src = round.image;
    revealImg.alt = round.species;
    revealImg.onload = function () { revealImg.style.opacity = '1'; };
    document.getElementById('reveal-species').textContent = round.species;
    document.getElementById('reveal-latin').textContent = round.latin;
    document.getElementById('reveal-detail').textContent = round.detail;

    var agreementEl = document.getElementById('reveal-agreement');
    if (round.humansAgree) {
      agreementEl.textContent = 'Most humans agreed with the animals on this one.';
      agreementEl.className = 'game-reveal-agreement agreed';
    } else {
      agreementEl.textContent = 'Most humans disagreed with the animals on this one!';
      agreementEl.className = 'game-reveal-agreement disagreed';
    }

    document.getElementById('reveal-credit').textContent = round.credit;

    // Button text
    if (currentRound < 5) {
      btnNext.textContent = 'Next Round';
    } else {
      btnNext.textContent = 'See Results';
    }

    showScreen(screenReveal);
  }

  // --- Summary ---
  function showSummary() {
    var scoreDiv = document.getElementById('game-score');
    scoreDiv.innerHTML = '<span class="score-number">' + score + ' / 6</span>' +
      'You agreed with the animals on ' + score + ' out of 6 rounds.';
    showScreen(screenSummary);
  }

  // --- Event Listeners ---
  btnStart.addEventListener('click', function () {
    currentRound = 0;
    score = 0;
    // Re-randomize sides
    rounds.forEach(function (round) {
      // Reset to default
      round.goodLabel = 'A';
      // Then randomize
      if (Math.random() < 0.5) {
        round.goodLabel = 'B';
      }
    });
    startRound();
  });

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
    listeningStatus.querySelector('p').textContent = 'Listen to both sounds, then pick your favorite';
    setTimeout(function () {
      playSound('A');
    }, 300);
  });

  btnNext.addEventListener('click', function () {
    currentRound++;
    if (currentRound < 6) {
      startRound();
    } else {
      showSummary();
    }
  });

  btnRestart.addEventListener('click', function () {
    currentRound = 0;
    score = 0;
    rounds.forEach(function (round) {
      round.goodLabel = 'A';
      if (Math.random() < 0.5) {
        round.goodLabel = 'B';
      }
    });
    startRound();
  });

})();
