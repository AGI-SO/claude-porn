# SQL - Supabase Stored Procedures

Ce dossier contient les procédures stockées et triggers déployés sur Supabase.

## Structure

```
sql/
├── functions/          # Fonctions RPC
│   ├── generate_api_key.sql
│   ├── handle_new_user.sql
│   ├── insert_story_with_api_key.sql
│   ├── revoke_api_key.sql
│   ├── sanitize_username.sql
│   ├── update_story_score.sql
│   └── verify_api_key.sql
└── triggers/           # Triggers
    ├── on_auth_user_created.sql
    └── on_vote_change.sql
```

## Fonctions

| Fonction | Description |
|----------|-------------|
| `generate_api_key(name)` | Génère une clé API pour l'utilisateur connecté |
| `handle_new_user()` | Trigger: crée le profil à l'inscription |
| `insert_story_with_api_key(key, content)` | Insère une story via clé API (MCP) |
| `revoke_api_key(key_id)` | Révoque une clé API |
| `sanitize_username(raw)` | Nettoie un username (utilitaire) |
| `update_story_score()` | Trigger: recalcule le score d'une story |
| `verify_api_key(key)` | Vérifie une clé API |

## Déploiement

Ces fichiers sont la source de vérité pour le code SQL.
Pour déployer une modification :

```sql
-- Via Supabase Dashboard > SQL Editor
-- Copier-coller le contenu du fichier modifié
```

## Note

Les fonctions `SECURITY DEFINER` s'exécutent avec les privilèges du créateur,
pas de l'appelant. Elles sont utilisées pour bypasser les RLS policies quand nécessaire.
