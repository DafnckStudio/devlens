# DevLens - Plan Ralph pour 100% Fonctionnel

> Extension doit fonctionner AVANT les plans/pricing

---

## Phase 1: Fix Auth (Sans Clerk pour l'instant) ✅ COMPLETED

- [x] 1.1 Créer un système d'auth simple/demo sans Clerk
- [x] 1.2 Remplacer les pages sign-in/sign-up par un mode demo
- [x] 1.3 Dashboard layout avec mode demo
- [x] 1.4 Dashboard page avec données demo
- [x] TEST: Build passe sans erreurs

## Phase 2: Database Setup

- [ ] 2.1 Configurer les variables d'environnement Postgres
- [ ] 2.2 Créer un script de migration/seed
- [ ] 2.3 Initialiser le schema en base
- [ ] 2.4 Créer un projet demo avec API key
- [ ] TEST: Vérifier les tables via API ou logs

## Phase 3: Extension Chrome - Build & Test

- [ ] 3.1 Vérifier et fixer les erreurs de build extension
- [ ] 3.2 Builder l'extension: `pnpm build` dans apps/extension
- [ ] 3.3 Documenter le chargement en Chrome dev mode
- [ ] 3.4 Tester le popup UI manuellement
- [ ] 3.5 Tester la capture de screenshot
- [ ] TEST: Extension chargée et capture screenshot fonctionnel

## Phase 4: API Integration

- [ ] 4.1 Tester POST /api/feedback avec curl
- [ ] 4.2 Tester GET /api/feedback avec curl
- [ ] 4.3 Vérifier le stockage des screenshots (Blob ou fallback)
- [ ] 4.4 Fixer les erreurs si présentes
- [ ] TEST: Feedback soumis visible dans dashboard

## Phase 5: Full Loop Test

- [ ] 5.1 Soumettre un feedback depuis l'extension
- [ ] 5.2 Vérifier l'apparition dans le dashboard
- [ ] 5.3 Tester les commandes du plugin Claude
- [ ] 5.4 Marquer un feedback comme résolu
- [ ] TEST: Loop complet extension → dashboard → plugin

## Phase 6: Polish & Documentation

- [ ] 6.1 Mettre à jour README avec les vrais steps
- [ ] 6.2 Créer .env.example complet
- [ ] 6.3 Ajouter instructions téléchargement extension
- [ ] 6.4 Final build & deploy
- [ ] TEST: Fresh clone + setup fonctionne

---

## Critères de Validation Globaux

- [ ] Extension téléchargeable et fonctionnelle en Chrome dev mode
- [ ] Dashboard accessible (mode demo OK)
- [ ] Feedback loop complet fonctionne
- [ ] Build passe sans erreurs
- [ ] Documentation à jour

---

*Généré par Claude - Plan Ralph DevLens*
