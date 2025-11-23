# Configuration de la couverture de code

## Badge de couverture actuel

Le badge de couverture dans le README affiche actuellement **94.4%** (mis à jour manuellement).

## Option 1 : Badge statique (actuel)

Le badge est mis à jour manuellement dans le README.md :
```markdown
[![Coverage](https://img.shields.io/badge/coverage-94.4%25-brightgreen)](https://github.com/ptrkvsky/mdx-to-sanity)
```

Pour le mettre à jour, exécutez `pnpm test:coverage` et mettez à jour le pourcentage dans le README.

## Option 2 : Codecov (recommandé pour un badge dynamique)

Pour avoir un badge qui se met à jour automatiquement :

1. Créez un compte gratuit sur [Codecov](https://about.codecov.io/)
2. Connectez votre dépôt GitHub
3. Décommentez les lignes dans `.github/workflows/test.yml` :
   ```yaml
   - name: Upload coverage to Codecov
     uses: codecov/codecov-action@v3
     with:
       file: ./coverage/lcov.info
       flags: unittests
       name: codecov-umbrella
       fail_ci_if_error: false
   ```
4. Ajoutez le badge Codecov dans le README :
   ```markdown
   [![codecov](https://codecov.io/gh/ptrkvsky/mdx-to-sanity/branch/main/graph/badge.svg)](https://codecov.io/gh/ptrkvsky/mdx-to-sanity)
   ```

## Génération locale

Pour générer le rapport de couverture localement :

```bash
pnpm test:coverage
```

Le rapport HTML est disponible dans `coverage/index.html`.

