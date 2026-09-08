// --- Dati: pasti pre/post allenamento ---
const MEALS = {
  "3h": {
    titolo: "3 ore prima: pasto completo",
    voci: [
      "Pasta o riso (80-100g) con pomodoro leggero",
      "Petto di pollo o tacchino alla griglia (120-150g)",
      "Verdure cotte a scelta",
      "1 frutto (banana o mela)",
      "Acqua a piccoli sorsi durante il pasto"
    ]
  },
  "1h": {
    titolo: "1 ora prima: spuntino leggero e veloce",
    voci: [
      "1 banana",
      "Una manciata di frutta secca (max 20g) oppure 2 gallette di riso",
      "Un sorso d'acqua ogni 15-20 minuti fino all'allenamento",
      "Evita cibi grassi o fritti: rallentano la digestione"
    ]
  },
  "post": {
    titolo: "Dopo l'allenamento: recupero",
    voci: [
      "Una fonte di proteine (yogurt greco, uovo, petto di pollo)",
      "Una fonte di carboidrati per ricaricare (pane, riso, frutta)",
      "Acqua + eventualmente un pizzico di sale se hai sudato molto",
      "Consuma il pasto di recupero entro 30-45 minuti dalla fine"
    ]
  }
};

// --- Dati: esercizi per zona muscolare ---
const EXERCISES = {
  adduttori: {
    titolo: "Adduttori",
    voci: [
      "Affondi laterali — 3 serie da 10 per gamba",
      "Copenhagen plank (ginocchio a terra) — 3 serie da 20-30 secondi per lato",
      "Slittamenti laterali su tappetino — 3 serie da 12"
    ]
  },
  femorali: {
    titolo: "Femorali",
    voci: [
      "Nordic curl assistito — 3 serie da 6-8",
      "Stacco rumeno a corpo libero o con pesi leggeri — 3 serie da 10",
      "Ponte su una gamba — 3 serie da 12 per lato"
    ]
  },
  quadricipiti: {
    titolo: "Quadricipiti",
    voci: [
      "Squat a corpo libero — 3 serie da 15",
      "Affondi in camminata — 3 serie da 10 per gamba",
      "Step-up su gradino o panca — 3 serie da 12 per lato"
    ]
  },
  core: {
    titolo: "Core",
    voci: [
      "Plank frontale — 3 serie da 30-45 secondi",
      "Russian twist — 3 serie da 20",
      "Dead bug — 3 serie da 10 per lato"
    ]
  },
  spalle: {
    titolo: "Spalle",
    voci: [
      "Alzate laterali con pesi leggeri — 3 serie da 12",
      "Push-up con mani strette — 3 serie da 10",
      "Rotazioni esterne con elastico — 3 serie da 15 per lato"
    ]
  }
};

function renderList(container, titolo, voci) {
  container.innerHTML = `<h2>${titolo}</h2><ul>${voci.map(v => `<li>${v}</li>`).join("")}</ul>`;
}

// --- Tab switching ---
document.querySelectorAll(".tab-btn").forEach(btn => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".tab-btn").forEach(b => b.classList.remove("active"));
    document.querySelectorAll(".tab-panel").forEach(p => p.classList.remove("active"));
    btn.classList.add("active");
    document.getElementById("panel-" + btn.dataset.tab).classList.add("active");
  });
});

// --- Nutrizione ---
const mealResult = document.getElementById("meal-result");
function showMeal(timing) {
  const m = MEALS[timing];
  renderList(mealResult, m.titolo, m.voci);
}
document.querySelectorAll("#timing-chips .chip").forEach(chip => {
  chip.addEventListener("click", () => {
    document.querySelectorAll("#timing-chips .chip").forEach(c => c.classList.remove("active"));
    chip.classList.add("active");
    showMeal(chip.dataset.timing);
  });
});
showMeal("3h");

// --- Esercizi ---
const exerciseResult = document.getElementById("exercise-result");
function showExercise(muscle) {
  const e = EXERCISES[muscle];
  renderList(exerciseResult, e.titolo, e.voci);
}
document.querySelectorAll("#muscle-chips .chip").forEach(chip => {
  chip.addEventListener("click", () => {
    document.querySelectorAll("#muscle-chips .chip").forEach(c => c.classList.remove("active"));
    chip.classList.add("active");
    showExercise(chip.dataset.muscle);
  });
});
showExercise("adduttori");

// --- Generazione PDF scheda allenamento ---
document.getElementById("sheet-form").addEventListener("submit", function (e) {
  e.preventDefault();

  const nome = document.getElementById("f-nome").value.trim();
  const obiettivo = document.getElementById("f-obiettivo").value.trim();
  const zona = document.getElementById("f-zona").value;
  const note = document.getElementById("f-note").value.trim();
  const esercizi = EXERCISES[
    Object.keys(EXERCISES).find(k => EXERCISES[k].titolo.toLowerCase() === zona.toLowerCase())
  ];

  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();

  // Fascia verde in alto
  doc.setFillColor(30, 122, 76);
  doc.rect(0, 0, 210, 28, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(20);
  doc.text("IoAtleta", 14, 18);
  doc.setFontSize(11);
  doc.text("Scheda di allenamento", 14, 24);

  doc.setTextColor(20, 20, 20);
  doc.setFontSize(12);
  let y = 42;
  doc.text(`Atleta: ${nome}`, 14, y); y += 8;
  doc.text(`Obiettivo settimana: ${obiettivo}`, 14, y); y += 8;
  doc.text(`Zona muscolare: ${zona}`, 14, y); y += 12;

  // Barra arancione titolo esercizi
  doc.setFillColor(217, 106, 31);
  doc.rect(14, y - 6, 182, 8, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(12);
  doc.text("Esercizi", 16, y);
  y += 10;

  doc.setTextColor(20, 20, 20);
  doc.setFontSize(11);
  const lista = esercizi ? esercizi.voci : ["Esercizi generali a corpo libero, 3 serie da 12-15 ripetizioni."];
  lista.forEach(voce => {
    doc.text("• " + voce, 16, y, { maxWidth: 178 });
    y += 9;
  });

  if (note) {
    y += 6;
    doc.setFontSize(11);
    doc.setTextColor(85, 100, 90);
    doc.text("Note per l'allenatore:", 14, y);
    y += 7;
    doc.text(note, 14, y, { maxWidth: 182 });
  }

  const nomeFile = (nome || "atleta").toLowerCase().replace(/\s+/g, "-");
  doc.save(`scheda-ioatleta-${nomeFile}.pdf`);
});
