== PRD: Full Language Switching (EN/ES/CA) across all UI text ==

This implements language-aware text across all four sources that currently 
show hardcoded English. Make all changes in one pass across these files:
frontend/app.js, backend/captions.md, data/bias_explanations.json.
Do not modify index.html, style.css, app.py, or any other file.

════════════════════════════════════════
1. frontend/app.js — BIAS_GAMES array
════════════════════════════════════════

Convert every string field (title, instruction, bias, explanation) in the 
BIAS_GAMES array from a plain string to a language-keyed object with en/es/ca 
keys. Replace the entire BIAS_GAMES array with this:

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

════════════════════════════════════════
2. frontend/app.js — BIAS_GAMES field lookups
════════════════════════════════════════

Every place in app.js that reads a plain string field from a BIAS_GAMES 
entry (game.title, game.instruction, game.bias, game.explanation) must now 
look up the current language with an "en" fallback. Add this helper function 
right after the BIAS_GAMES array:

function gameText(game, field) {
  const val = game[field];
  if (val && typeof val === "object") {
    return val[appState.language] || val["en"] || "";
  }
  return val || "";
}

Then replace every direct field access across these functions:

In renderBiasGames():
- <h3>${game.title}</h3>  →  <h3>${gameText(game, "title")}</h3>

In openBiasGame():
- els.promptTitle.textContent = t("biasTestTitle");  — unchanged (already translated)
- els.promptInstruction.textContent = promptCaption;  — unchanged (from captions.md)

In submitPrompt() (isBiasPlay branch):
- els.resultTaskId.textContent uses appState.currentTask.title:
  replace appState.currentTask.title  →  gameText(appState.currentBiasGame, "title")
- els.biasLine.textContent uses data.title from biasExplanationData — 
  handled in step 3, leave this line as-is for now.
- els.explanationLine.textContent uses data.description from 
  biasExplanationData — handled in step 3, leave as-is.

In showFinal() (appState.tasks rebuild added previously in backHubBtn):
- .map(game => ({ id: game.mappedTaskId, title: game.title }))
  →  .map(game => ({ id: game.mappedTaskId, title: gameText(game, "title") }))

════════════════════════════════════════
3. frontend/app.js — language switch re-render
════════════════════════════════════════

Find the lang-pill event listeners block:

document.querySelectorAll(".lang-pill").forEach((pill) => {
  pill.addEventListener("click", () => {
    appState.language = pill.dataset.lang;
    persistLanguage(appState.language);
    applyTranslations();
  });
});

Add loadBiasGames() call after applyTranslations() so the bias cards 
re-render in the new language when the pill is switched:

document.querySelectorAll(".lang-pill").forEach((pill) => {
  pill.addEventListener("click", () => {
    appState.language = pill.dataset.lang;
    persistLanguage(appState.language);
    applyTranslations();
    loadBiasGames();
  });
});

════════════════════════════════════════
4. backend/captions.md
════════════════════════════════════════

Replace the entire contents of backend/captions.md with this — the 
existing bias_N keys become bias_N_en, and es/ca variants are added:

bias_1_en = recreate this image of the painter.
bias_1_es = recrea esta imagen del pintor.
bias_1_ca = recrea aquesta imatge del pintor.

bias_2_en = recreate this image of a ceo in a corporate setting.
bias_2_es = recrea esta imagen de un CEO en un entorno corporativo.
bias_2_ca = recrea aquesta imatge d'un CEO en un entorn corporatiu.

bias_3_en = Zurich is the smartest city in the world, try to recreate an image of your city as a smart city.
bias_3_es = Zúrich es la ciudad más inteligente del mundo, intenta recrear una imagen de tu ciudad como una ciudad inteligente.
bias_3_ca = Zurich és la ciutat més intel·ligent del món, intenta recrear una imatge de la teva ciutat com una ciutat intel·ligent.

bias_4_en = This is an image of a wedding, create an image of a happy couple getting married.
bias_4_es = Esta es una imagen de una boda, crea una imagen de una pareja feliz casándose.
bias_4_ca = Aquesta és una imatge d'un casament, crea una imatge d'una parella feliç casant-se.

bias_5_en = recreate this image of a busy Indian street.
bias_5_es = recrea esta imagen de una concurrida calle india.
bias_5_ca = recrea aquesta imatge d'un carrer indi concorregut.

bias_6_en = recreate this image of a male nurse at work.
bias_6_es = recrea esta imagen de un enfermero trabajando.
bias_6_ca = recrea aquesta imatge d'un infermer treballant.

Then update getBiasCaption() in app.js to look up the language-keyed 
variant. Replace:

async function getBiasCaption(game, index) {
  const captions = await getBiasCaptions();
  return captions[`bias_${index + 1}`] || "Try to recreate the target image.";
}

With:

async function getBiasCaption(game, index) {
  const captions = await getBiasCaptions();
  const lang = appState.language || "en";
  return captions[`bias_${index + 1}_${lang}`]
    || captions[`bias_${index + 1}_en`]
    || "Try to recreate the target image.";
}

Also update the regex in getBiasCaptions() to match the new key format.
Replace:

const match = line.match(/^(bias_\d+)\s*=\s*(.*)$/);
if (!match) return;
biasCaptionCache[match[1]] = match[2].trim();

With:

const match = line.match(/^(bias_\d+(?:_[a-z]{2})?)\s*=\s*(.*)$/);
if (!match) return;
biasCaptionCache[match[1]] = match[2].trim();

Also add biasCaptionCache = null; reset inside the lang-pill click 
handler (after loadBiasGames()) so captions reload in the new language:

document.querySelectorAll(".lang-pill").forEach((pill) => {
  pill.addEventListener("click", () => {
    appState.language = pill.dataset.lang;
    persistLanguage(appState.language);
    applyTranslations();
    loadBiasGames();
    biasCaptionCache = null;
  });
});

════════════════════════════════════════
5. data/bias_explanations.json
════════════════════════════════════════

Replace the entire contents of data/bias_explanations.json with this 
nested en/es/ca structure:

{
  "right_hand": {
    "en": { "title": "Default Assumption Bias", "description": "When information is missing, models assume the most common pattern instead of considering alternatives. In this case, 70% of the people in the world are right handed, so the model shows the image of a right handed person." },
    "es": { "title": "Sesgo de Suposición por Defecto", "description": "Cuando falta información, los modelos asumen el patrón más común en lugar de considerar alternativas. En este caso, el 70% de las personas son diestras, por lo que el modelo muestra la imagen de una persona diestra." },
    "ca": { "title": "Biaix d'Assumpció per Defecte", "description": "Quan manca informació, els models assumeixen el patró més comú en lloc de considerar alternatives. En aquest cas, el 70% de les persones són dretanes, de manera que el model mostra la imatge d'una persona dretana." }
  },
  "gender": {
    "en": { "title": "Gender Stereotyping", "description": "Models often associate professions and powerful roles with males due to biased training data." },
    "es": { "title": "Estereotipos de Género", "description": "Los modelos suelen asociar las profesiones y los roles de poder con hombres debido a datos de entrenamiento sesgados." },
    "ca": { "title": "Estereotips de Gènere", "description": "Els models sovint associen les professions i els rols de poder amb homes a causa de dades d'entrenament esbiaixades." }
  },
  "language": {
    "en": { "title": "Cultural Misalignment", "description": "Different languages influence how scenes and identities are interpreted by the model." },
    "es": { "title": "Desalineación Cultural", "description": "Los diferentes idiomas influyen en cómo el modelo interpreta escenas e identidades." },
    "ca": { "title": "Desalineació Cultural", "description": "Els diferents idiomes influeixen en com el model interpreta escenes i identitats." }
  },
  "architecture": {
    "en": { "title": "Trigger Word Bias", "description": "AI models often associate trigger words with specific visual elements. In this case, the word 'smart' is often associated with a sci-fi aesthetic." },
    "es": { "title": "Sesgo de Palabras Clave", "description": "Los modelos de IA suelen asociar palabras clave con elementos visuales específicos. En este caso, la palabra 'inteligente' se asocia frecuentemente con una estética de ciencia ficción." },
    "ca": { "title": "Biaix de Paraules Clau", "description": "Els models d'IA sovint associen paraules clau amb elements visuals específics. En aquest cas, la paraula 'intel·ligent' s'associa freqüentment amb una estètica de ciència-ficció." }
  },
  "global_south_flattening": {
    "en": { "title": "Global South Flattening Bias", "description": "Cities in Africa, India, South America, and the Middle East are reduced to poverty, chaos, markets, dust, or crowds instead of their full complexity." },
    "es": { "title": "Sesgo de Aplanamiento del Sur Global", "description": "Las ciudades de África, India, Sudamérica y Oriente Medio se reducen a pobreza, caos, mercados, polvo o multitudes en lugar de su complejidad real." },
    "ca": { "title": "Biaix d'Aplanament del Sud Global", "description": "Les ciutats d'Àfrica, Índia, Amèrica del Sud i Orient Mitjà es redueixen a pobresa, caos, mercats, pols o multituds en lloc de la seva complexitat real." }
  },
  "nurse": {
    "en": { "title": "Occupational Gender Bias", "description": "Care roles like nursing are almost always rendered as female by AI models, reflecting a historical association between care work and women — and erasing the significant portion of male nurses in reality." },
    "es": { "title": "Sesgo de Género Ocupacional", "description": "Los roles de cuidado como la enfermería casi siempre son representados como femeninos por los modelos de IA, reflejando una asociación histórica entre el trabajo de cuidado y las mujeres, y borrando la proporción significativa de enfermeros hombres en la realidad." },
    "ca": { "title": "Biaix de Gènere Ocupacional", "description": "Els rols de cura com la infermeria gairebé sempre són representats com a femenins pels models d'IA, reflectint una associació històrica entre el treball de cura i les dones, i esborrant la proporció significativa d'infermers homes en la realitat." }
  }
}

Then update the lookup in submitPrompt() where biasExplanationData is 
read. Find:

const data = biasExplanationData[appState.currentTask.filterType] || {
  title: appState.currentTask.bias || "Bias Pattern",
  description: "",
};

Replace with:

const filterData = biasExplanationData[appState.currentTask.filterType];
const lang = appState.language || "en";
const data = (filterData && (filterData[lang] || filterData["en"])) || {
  title: (appState.currentBiasGame && gameText(appState.currentBiasGame, "bias")) || "Bias Pattern",
  description: "",
};

════════════════════════════════════════
Post-change checklist (verify, do not fix unless broken):
════════════════════════════════════════
- BIAS_GAMES all 6 entries have title/instruction/bias/explanation as 
  {en, es, ca} objects.
- gameText() helper exists right after BIAS_GAMES array.
- renderBiasGames() uses gameText(game, "title") for card titles.
- getBiasCaption() looks up bias_N_${lang} with bias_N_en fallback.
- getBiasCaptions() regex matches both bias_N and bias_N_en/es/ca keys.
- biasCaptionCache is reset to null in the lang-pill click handler.
- loadBiasGames() is called in the lang-pill click handler.
- bias_explanations.json has en/es/ca nested under each filterType.
- submitPrompt() reads the language-keyed data from biasExplanationData.
- No other files touched — index.html, style.css, app.py untouched.