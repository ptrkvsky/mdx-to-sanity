import { Hono } from "hono";
// import { createScrapeController } from "../controllers/scrapeController"; // si tu veux injecter ensuite

// Le rôle de ce fichier :
// - Créer un sous-routeur Hono responsable des routes liées au scraping
// - Mapper chaque route HTTP vers un contrôleur
// - Ne rien connaître des services internes ni de la logique métier

export const scrapeRouter = new Hono();

// 1. Route POST /scrape
// Rôle : recevoir un body JSON, vérifier les champs,
// appeler le contrôleur de scraping.
scrapeRouter.post("/scrape", async (c) => {
  // appel du contrôleur
});

// 2. Route GET /scrape/status
// Rôle : exposer un statut ou un healthcheck lié au scraping.
scrapeRouter.get("/scrape/status", (c) => {
  // Ici, un vrai contrôleur/healthcheck devrait être appelé.
  // Pour l'exemple, on retourne un statut simple.
  return c.json({ status: "ok" }, 200);
});

// 3. (Optionnel) Route pour récupérer un résultat de scraping par ID
scrapeRouter.get("/scrape/:id", (c) => {
  return c.json({ status: "ok" }, 200);
  // appel d’un contrôleur "getScrapeResult"
});
