# atlas-feedback-api

atlas-feedback-api service

## Stack
- Langage : ${{ values.language }}
- CI/CD : Tekton → Harbor → ArgoCD
- Plateforme : DxP

## Démarrage rapide
```bash
# Cloner le repo
git clone <repo-url>
cd atlas-feedback-api

# Lancer en local
docker build -t atlas-feedback-api .
docker run -p 8080:8080 atlas-feedback-api
```
