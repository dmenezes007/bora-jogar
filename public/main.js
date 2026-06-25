const app = document.querySelector("#app");
const content = window.BORA_CONTENT || {};

const normalize = (text) =>
  (text || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toUpperCase()
    .replace(/[^A-Z0-9\s]/g, "")
    .replace(/\s+/g, " ")
    .trim();

const rand = (arr) => arr[Math.floor(Math.random() * arr.length)];
const shuffle = (arr) => [...arr].sort(() => Math.random() - 0.5);

const getWords = () => {
  const source = (content.lexicon || []).filter((w) => w.length >= 4 && w.length <= 9);
  if (source.length > 30) {
    return source;
  }
  return [
    "INOVACAO",
    "PATENTE",
    "MARCA",
    "DADOS",
    "GESTAO",
    "CURSO",
    "TECNOLOGIA",
    "INPI",
    "PROJETO",
    "SERVICO"
  ];
};

const words = getWords();
const courseNames = (content.courses || []).map((c) => normalize(c.curso)).filter(Boolean);
const objectives = (content.courses || []).map((c) => c.objetivo).filter(Boolean);
const topics = (content.topics || []).map((t) => normalize(t)).filter(Boolean);

const gameDefs = [
  {
    id: "conexoes",
    name: "Conexoes do Saber",
    subtitle: "Descubra os 4 grupos de termos"
  },
  {
    id: "enigma",
    name: "Enigma do Dito",
    subtitle: "Acerte a palavra omitida da frase"
  },
  {
    id: "mini-cruzes",
    name: "Mini Cruzes PI",
    subtitle: "Cruze as respostas no mini tabuleiro"
  },
  {
    id: "grade",
    name: "Grade Oculta",
    subtitle: "Encontre palavras escondidas"
  },
  {
    id: "colmeia",
    name: "Colmeia INPI",
    subtitle: "Monte palavras usando a letra central"
  },
  {
    id: "rota",
    name: "Rota em Rede",
    subtitle: "Saia do labirinto de conhecimento"
  },
  {
    id: "escada",
    name: "Escada Lexica",
    subtitle: "Transforme palavra por palavra"
  },
  {
    id: "trilha",
    name: "Trilha Wend PI",
    subtitle: "Siga a trilha de letras sem quebrar a rota"
  }
];

function mountLayout() {
  app.innerHTML = `
    <main class="main-wrap">
      <section class="hero">
        <img src="/bora_jogar.png" alt="Bora Jogar" />
        <p>Escolha um jogo e treine raciocinio logico e vocabulario com conteudo derivado das pastas pgc-inpi e pgi-inpi.</p>
      </section>
      <section class="games-grid" id="games-grid"></section>
      <section class="game-panel" id="game-panel">
        <h2 class="game-title">Selecione um jogo</h2>
        <p class="hint">Cada card abre um minijogo diferente.</p>
      </section>
    </main>
  `;

  const grid = document.querySelector("#games-grid");
  const panel = document.querySelector("#game-panel");

  gameDefs.forEach((game) => {
    const card = document.createElement("button");
    card.className = "game-card";
    card.type = "button";
    card.dataset.game = game.id;
    card.innerHTML = `<h3>${game.name}</h3><p>${game.subtitle}</p>`;
    card.addEventListener("click", () => {
      document.querySelectorAll(".game-card").forEach((el) => el.classList.remove("active"));
      card.classList.add("active");
      renderGame(game.id, panel, game.name);
    });
    grid.appendChild(card);
  });
}

function renderGame(id, panel, title) {
  panel.innerHTML = `<h2 class="game-title">${title}</h2>`;
  switch (id) {
    case "conexoes":
      renderConnections(panel);
      break;
    case "enigma":
      renderDito(panel);
      break;
    case "mini-cruzes":
      renderCrossword(panel);
      break;
    case "grade":
      renderWordSearch(panel);
      break;
    case "colmeia":
      renderBee(panel);
      break;
    case "rota":
      renderMaze(panel);
      break;
    case "escada":
      renderCrossclimb(panel);
      break;
    case "trilha":
      renderWend(panel);
      break;
    default:
      break;
  }
}

function setStatus(host, message, ok = false) {
  const status = host.querySelector(".status") || document.createElement("p");
  status.className = `status ${ok ? "good" : "bad"}`;
  status.textContent = message;
  if (!status.parentElement) {
    host.appendChild(status);
  }
}

function renderConnections(panel) {
  const all = shuffle(words).slice(0, 16);
  const groups = {
    A: all.slice(0, 4),
    B: all.slice(4, 8),
    C: all.slice(8, 12),
    D: all.slice(12, 16)
  };

  const mapGroup = new Map();
  Object.entries(groups).forEach(([group, terms]) => {
    terms.forEach((term) => mapGroup.set(term, group));
  });

  const picked = new Set();
  const solved = new Set();

  const host = document.createElement("div");
  host.innerHTML = `<p class="hint">Selecione 4 termos e clique em Validar para encontrar combinacoes corretas.</p>`;

  const grid = document.createElement("div");
  grid.className = "btn-row";

  shuffle(all).forEach((term) => {
    const btn = document.createElement("button");
    btn.textContent = term;
    btn.type = "button";
    btn.addEventListener("click", () => {
      if (solved.has(term)) {
        return;
      }
      if (picked.has(term)) {
        picked.delete(term);
        btn.classList.remove("selected");
      } else if (picked.size < 4) {
        picked.add(term);
        btn.classList.add("selected");
      }
    });
    grid.appendChild(btn);
  });

  const controls = document.createElement("div");
  controls.className = "btn-row";
  const check = document.createElement("button");
  check.type = "button";
  check.textContent = "Validar";
  check.addEventListener("click", () => {
    if (picked.size !== 4) {
      setStatus(host, "Selecione exatamente 4 termos.");
      return;
    }
    const selected = [...picked];
    const group = mapGroup.get(selected[0]);
    const ok = selected.every((item) => mapGroup.get(item) === group);
    if (!ok) {
      setStatus(host, "Grupo incorreto. Tente outra combinacao.");
      return;
    }
    selected.forEach((item) => solved.add(item));
    picked.clear();
    [...grid.children].forEach((el) => {
      if (solved.has(el.textContent)) {
        el.disabled = true;
        el.style.background = "#bae8cd";
      } else {
        el.classList.remove("selected");
      }
    });
    if (solved.size === 16) {
      setStatus(host, "Perfeito! Voce encontrou os 4 grupos.", true);
    } else {
      setStatus(host, "Boa! Grupo encontrado.", true);
    }
  });
  controls.appendChild(check);

  host.append(grid, controls);
  panel.appendChild(host);
}

function renderDito(panel) {
  const sentence = objectives.find((item) => normalize(item).split(" ").length > 8) || "A inovacao no INPI depende de estrategia, metodo e colaboracao entre equipes.";
  const clean = sentence.replace(/\s+/g, " ").trim();
  const candidates = clean.split(" ").filter((w) => normalize(w).length > 5);
  const hidden = rand(candidates) || "inovacao";
  const masked = clean.replace(hidden, "_____ ");

  const host = document.createElement("div");
  host.innerHTML = `<p class="hint">Complete a frase com a palavra correta.</p><p><strong>${masked}</strong></p>`;
  const input = document.createElement("input");
  input.placeholder = "Digite a palavra";
  const btn = document.createElement("button");
  btn.type = "button";
  btn.textContent = "Conferir";
  btn.addEventListener("click", () => {
    const ok = normalize(input.value) === normalize(hidden);
    setStatus(host, ok ? "Acertou a palavra oculta!" : `Nao foi dessa vez. Resposta: ${hidden}`, ok);
  });
  const row = document.createElement("div");
  row.className = "btn-row";
  row.append(input, btn);
  host.appendChild(row);
  panel.appendChild(host);
}

function renderCrossword(panel) {
  const board = [
    ["I", "N", "P", "I", "#"],
    ["#", "M", "#", "A", "#"],
    ["D", "A", "D", "O", "S"],
    ["#", "R", "#", "E", "#"],
    ["M", "A", "R", "C", "A"]
  ];

  const host = document.createElement("div");
  host.innerHTML = `<p class="hint">Preencha as casas. Dica horizontal: INPI, DADOS e MARCA.</p>`;

  const grid = document.createElement("div");
  grid.className = "grid-letters";
  grid.style.gridTemplateColumns = "repeat(5, 34px)";

  const inputs = [];
  board.forEach((row, y) => {
    row.forEach((cell, x) => {
      if (cell === "#") {
        const block = document.createElement("div");
        block.className = "cell block";
        grid.appendChild(block);
      } else {
        const input = document.createElement("input");
        input.maxLength = 1;
        input.className = "cell";
        input.dataset.answer = cell;
        input.dataset.x = String(x);
        input.dataset.y = String(y);
        inputs.push(input);
        grid.appendChild(input);
      }
    });
  });

  const btn = document.createElement("button");
  btn.type = "button";
  btn.textContent = "Verificar";
  btn.addEventListener("click", () => {
    const ok = inputs.every((i) => normalize(i.value) === i.dataset.answer);
    setStatus(host, ok ? "Mini cruzadinha resolvida!" : "Ainda ha letras incorretas.", ok);
  });

  host.append(grid, btn);
  panel.appendChild(host);
}

function renderWordSearch(panel) {
  const targets = shuffle(words).slice(0, 5).map((w) => w.slice(0, 8));
  const size = 10;
  const matrix = Array.from({ length: size }, () => Array.from({ length: size }, () => ""));

  targets.forEach((word, index) => {
    const letters = word.split("");
    const horizontal = index % 2 === 0;
    const row = (index * 2) % size;
    const col = horizontal ? 1 : (index + 1);
    letters.forEach((ch, i) => {
      const y = horizontal ? row : (row + i) % size;
      const x = horizontal ? col + i : col;
      if (x < size) {
        matrix[y][x] = ch;
      }
    });
  });

  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  for (let y = 0; y < size; y += 1) {
    for (let x = 0; x < size; x += 1) {
      if (!matrix[y][x]) {
        matrix[y][x] = alphabet[Math.floor(Math.random() * alphabet.length)];
      }
    }
  }

  const host = document.createElement("div");
  host.innerHTML = `<p class="hint">Clique nas letras em sequencia para formar uma palavra alvo.</p><div>${targets.map((w) => `<span class="word-chip">${w}</span>`).join("")}</div>`;

  const grid = document.createElement("div");
  grid.className = "grid-letters";
  grid.style.gridTemplateColumns = `repeat(${size}, 34px)`;
  const picked = [];
  const found = new Set();

  matrix.forEach((row, y) => {
    row.forEach((cell, x) => {
      const el = document.createElement("button");
      el.type = "button";
      el.className = "cell";
      el.textContent = cell;
      el.dataset.x = String(x);
      el.dataset.y = String(y);
      el.addEventListener("click", () => {
        if (el.classList.contains("hit")) {
          return;
        }
        picked.push(el);
        el.classList.add("selected");
      });
      grid.appendChild(el);
    });
  });

  const btn = document.createElement("button");
  btn.type = "button";
  btn.textContent = "Checar sequencia";
  btn.addEventListener("click", () => {
    const formed = picked.map((el) => el.textContent).join("");
    if (targets.includes(formed) && !found.has(formed)) {
      found.add(formed);
      picked.forEach((el) => {
        el.classList.remove("selected");
        el.classList.add("hit");
      });
      setStatus(host, `Boa! Palavra ${formed} encontrada.`, true);
      if (found.size === targets.length) {
        setStatus(host, "Excelente! Todas as palavras encontradas.", true);
      }
    } else {
      picked.forEach((el) => el.classList.remove("selected"));
      setStatus(host, "Sequencia invalida. Tente novamente.");
    }
    picked.length = 0;
  });

  host.append(grid, btn);
  panel.appendChild(host);
}

function renderBee(panel) {
  const baseWord = rand(words.filter((w) => w.length >= 7)) || "INOVACAO";
  const letters = shuffle(Array.from(new Set(baseWord.split("")))).slice(0, 7);
  while (letters.length < 7) {
    letters.push(String.fromCharCode(65 + letters.length));
  }
  const center = letters[0];

  const dictionary = new Set(
    [...courseNames, ...words]
      .filter((word) => word.length >= 4)
      .map((w) => normalize(w))
      .filter((word) => word.split("").every((ch) => letters.includes(ch)))
      .filter((word) => word.includes(center))
  );

  const found = new Set();
  const host = document.createElement("div");
  host.innerHTML = `<p class="hint">Use apenas essas letras e inclua a letra central: <strong>${center}</strong></p><div>${letters.map((l) => `<span class="word-chip">${l}</span>`).join("")}</div>`;

  const input = document.createElement("input");
  input.placeholder = "Digite uma palavra";
  const btn = document.createElement("button");
  btn.type = "button";
  btn.textContent = "Enviar";
  const score = document.createElement("p");
  score.className = "hint";
  score.textContent = "Pontos: 0";

  btn.addEventListener("click", () => {
    const value = normalize(input.value);
    if (!value.includes(center)) {
      setStatus(host, "A palavra precisa ter a letra central.");
      return;
    }
    if (value.length < 4) {
      setStatus(host, "Use palavras com 4 ou mais letras.");
      return;
    }
    if (!dictionary.has(value)) {
      setStatus(host, "Palavra fora da base importada.");
      return;
    }
    if (found.has(value)) {
      setStatus(host, "Voce ja encontrou essa palavra.");
      return;
    }
    found.add(value);
    input.value = "";
    score.textContent = `Pontos: ${found.size}`;
    setStatus(host, "Boa! Palavra valida.", true);
  });

  const row = document.createElement("div");
  row.className = "btn-row";
  row.append(input, btn);
  host.append(row, score);
  panel.appendChild(host);
}

function renderMaze(panel) {
  const maze = [
    [0, 0, 1, 0, 0, 0, 1, 0],
    [1, 0, 1, 0, 1, 0, 1, 0],
    [1, 0, 0, 0, 1, 0, 0, 0],
    [1, 1, 1, 0, 1, 1, 1, 0],
    [0, 0, 0, 0, 0, 0, 1, 0],
    [0, 1, 1, 1, 1, 0, 1, 0],
    [0, 0, 0, 0, 1, 0, 0, 0],
    [1, 1, 1, 0, 0, 0, 1, 0]
  ];

  let player = { x: 0, y: 0 };
  const goal = { x: 7, y: 7 };

  const host = document.createElement("div");
  host.innerHTML = `<p class="hint">Use as setas do teclado ou botoes para chegar ao destino verde.</p>`;

  const grid = document.createElement("div");
  grid.className = "grid-letters";
  grid.style.gridTemplateColumns = "repeat(8, 34px)";

  const draw = () => {
    grid.innerHTML = "";
    maze.forEach((row, y) => {
      row.forEach((cell, x) => {
        const el = document.createElement("div");
        el.className = "cell";
        if (cell === 1) {
          el.classList.add("block");
        }
        if (x === goal.x && y === goal.y) {
          el.classList.add("goal");
        }
        if (x === player.x && y === player.y) {
          el.classList.add("player");
          el.textContent = "P";
        }
        grid.appendChild(el);
      });
    });
  };

  const move = (dx, dy) => {
    const nx = player.x + dx;
    const ny = player.y + dy;
    if (nx < 0 || ny < 0 || nx >= 8 || ny >= 8 || maze[ny][nx] === 1) {
      return;
    }
    player = { x: nx, y: ny };
    draw();
    if (nx === goal.x && ny === goal.y) {
      setStatus(host, "Voce concluiu o labirinto!", true);
    }
  };

  const controls = document.createElement("div");
  controls.className = "btn-row";
  [["Cima", 0, -1], ["Esquerda", -1, 0], ["Direita", 1, 0], ["Baixo", 0, 1]].forEach(([label, dx, dy]) => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.textContent = label;
    btn.addEventListener("click", () => move(dx, dy));
    controls.appendChild(btn);
  });

  const keyHandler = (event) => {
    if (!panel.contains(host)) {
      window.removeEventListener("keydown", keyHandler);
      return;
    }
    if (event.key === "ArrowUp") move(0, -1);
    if (event.key === "ArrowDown") move(0, 1);
    if (event.key === "ArrowLeft") move(-1, 0);
    if (event.key === "ArrowRight") move(1, 0);
  };
  window.addEventListener("keydown", keyHandler);

  draw();
  host.append(grid, controls);
  panel.appendChild(host);
}

function renderCrossclimb(panel) {
  const ladder = ["DADO", "DANO", "DINO", "FINO", "FIND"];

  const host = document.createElement("div");
  host.innerHTML = `<p class="hint">Cada linha deve mudar apenas 1 letra em relacao a anterior.</p><p>Inicio: <strong>${ladder[0]}</strong> | Fim: <strong>${ladder[ladder.length - 1]}</strong></p>`;

  const inputs = [];
  for (let i = 1; i < ladder.length - 1; i += 1) {
    const input = document.createElement("input");
    input.maxLength = 4;
    input.placeholder = `Passo ${i}`;
    inputs.push(input);
    host.appendChild(input);
  }

  const btn = document.createElement("button");
  btn.type = "button";
  btn.textContent = "Validar escada";
  btn.addEventListener("click", () => {
    const attempt = [ladder[0], ...inputs.map((i) => normalize(i.value)), ladder[ladder.length - 1]];
    const expected = ladder.map((w) => normalize(w));
    const valid = attempt.every((word, index) => word === expected[index]);
    setStatus(host, valid ? "Escada completa!" : "Escada invalida. Revise os passos.", valid);
  });

  host.appendChild(btn);
  panel.appendChild(host);
}

function renderWend(panel) {
  const targetWords = shuffle(topics.length ? topics : words).slice(0, 3).map((w) => w.replace(/\s+/g, "").slice(0, 6));
  const merged = targetWords.join("");
  const width = 6;
  const rows = Math.ceil(merged.length / width);
  const chars = merged.padEnd(rows * width, "X").split("");

  const host = document.createElement("div");
  host.innerHTML = `<p class="hint">Forme as palavras na ordem, clicando letras adjacentes.</p><p>${targetWords.map((w) => `<span class="word-chip">${w}</span>`).join("")}</p>`;

  const grid = document.createElement("div");
  grid.className = "grid-letters";
  grid.style.gridTemplateColumns = `repeat(${width}, 34px)`;

  const picked = [];
  let currentWord = 0;

  chars.forEach((ch, index) => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "cell";
    btn.textContent = ch;
    btn.dataset.idx = String(index);
    btn.addEventListener("click", () => {
      if (btn.classList.contains("hit")) {
        return;
      }
      const last = picked[picked.length - 1];
      if (last) {
        const li = Number(last.dataset.idx);
        const lx = li % width;
        const ly = Math.floor(li / width);
        const nx = index % width;
        const ny = Math.floor(index / width);
        const adjacent = Math.abs(nx - lx) <= 1 && Math.abs(ny - ly) <= 1;
        if (!adjacent) {
          setStatus(host, "A trilha deve seguir por casas adjacentes.");
          return;
        }
      }
      picked.push(btn);
      btn.classList.add("selected");
      const formed = picked.map((el) => el.textContent).join("");
      const target = targetWords[currentWord];
      if (!target.startsWith(formed)) {
        picked.forEach((el) => el.classList.remove("selected"));
        picked.length = 0;
        setStatus(host, "Sequencia incorreta para a palavra atual.");
        return;
      }
      if (formed === target) {
        picked.forEach((el) => {
          el.classList.remove("selected");
          el.classList.add("hit");
        });
        picked.length = 0;
        currentWord += 1;
        if (currentWord >= targetWords.length) {
          setStatus(host, "Trilha concluida com sucesso!", true);
        } else {
          setStatus(host, "Palavra concluida, continue para a proxima.", true);
        }
      }
    });
    grid.appendChild(btn);
  });

  host.appendChild(grid);
  panel.appendChild(host);
}

mountLayout();
