import { access, readFile, readdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "..");

const pgcDir = path.resolve(rootDir, "..", "pgc-inpi");
const pgiDir = path.resolve(rootDir, "..", "pgi-inpi");

const normalize = (text) =>
  (text || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^A-Za-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

const toWords = (text) =>
  normalize(text)
    .split(" ")
    .map((word) => word.toUpperCase())
    .filter((word) => word.length >= 4 && word.length <= 10);

const parseCsv = (raw) =>
  raw
    .split(/\r?\n/)
    .filter(Boolean)
    .map((line) => line.split(";"));

async function pathExists(targetPath) {
  try {
    await access(targetPath);
    return true;
  } catch {
    return false;
  }
}

async function readPgcCourses() {
  const filePath = path.join(pgcDir, "curadoria_de_cursos.csv");
  const raw = await readFile(filePath, "utf8");
  const rows = parseCsv(raw);
  const headers = rows[0] || [];
  const data = rows.slice(1).map((row) => {
    const item = {};
    headers.forEach((header, index) => {
      item[header?.trim() || `col${index}`] = (row[index] || "").trim();
    });
    return {
      status: item.Status || item.status || "",
      area: item.Area || item.area || "",
      tematica: item.Tematica || item.tematica || "",
      curso: item.Curso || item.curso || "",
      objetivo: item.Objetivo || item.objetivo || ""
    };
  });

  return data.filter((item) => item.curso);
}

async function readDocs(folder) {
  const entries = await readdir(folder, { withFileTypes: true });
  const docs = [];

  for (const entry of entries) {
    if (!entry.isFile()) {
      continue;
    }

    const filePath = path.join(folder, entry.name);
    const raw = await readFile(filePath, "utf8");
    docs.push({
      name: entry.name,
      raw,
      words: toWords(raw)
    });
  }

  return docs;
}

async function main() {
  const pgcCoursesPath = path.join(pgcDir, "curadoria_de_cursos.csv");
  const pgcDocsPath = path.join(pgcDir, "src", "files", "docs");
  const pgiDocsPath = path.join(pgiDir, "files", "docs");

  const sourcesAvailable =
    (await pathExists(pgcCoursesPath)) &&
    (await pathExists(pgcDocsPath)) &&
    (await pathExists(pgiDocsPath));

  if (!sourcesAvailable) {
    console.warn(
      "Fontes externas nao encontradas (pgc-inpi/pgi-inpi). Mantendo conteudo versionado para build/deploy."
    );
    return;
  }

  const courses = await readPgcCourses();
  const pgcDocs = await readDocs(pgcDocsPath);
  const pgiDocs = await readDocs(pgiDocsPath);

  const lexicon = new Set();
  const phrases = [];
  const topics = new Set();

  for (const course of courses) {
    toWords(course.curso).forEach((word) => lexicon.add(word));
    toWords(course.objetivo).forEach((word) => lexicon.add(word));
    if (course.tematica) {
      topics.add(course.tematica.toUpperCase());
    }
    if (course.objetivo) {
      phrases.push(course.objetivo.slice(0, 180));
    }
  }

  for (const doc of [...pgcDocs, ...pgiDocs]) {
    doc.words.forEach((word) => lexicon.add(word));
    if (doc.raw) {
      phrases.push(doc.raw.slice(0, 180).replace(/\s+/g, " "));
    }
  }

  const content = {
    generatedAt: new Date().toISOString(),
    courses: courses.slice(0, 250),
    lexicon: Array.from(lexicon).slice(0, 3000),
    phrases: phrases.filter(Boolean).slice(0, 600),
    topics: Array.from(topics).slice(0, 120)
  };

  const outputPath = path.join(rootDir, "src", "data", "content.json");
  await writeFile(outputPath, JSON.stringify(content, null, 2), "utf8");
  console.log(`Conteudo importado para ${outputPath}`);
}

main().catch((error) => {
  console.error("Falha na importacao de dados:", error);
  process.exit(1);
});
