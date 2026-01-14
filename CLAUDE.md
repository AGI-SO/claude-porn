# Claude Porn - Notes de session

## État actuel
- **Projet Next.js 16 + Supabase** fonctionnel
- **Auth OAuth** : Discord + GitHub configurés et fonctionnels
- **Design** : VHS-core / neon-wave avec scanlines, glitch effects, couleurs néon
- **Serveur dev** : `localhost:3000`
- **Serveur MCP** : Créé et fonctionnel

## Serveur MCP

### Structure
```
mcp-server/
├── src/index.ts      # Serveur MCP avec tool post_story
├── package.json
├── tsconfig.json
└── dist/             # Build compilé
```

### Tool disponible
- `post_story` : Poster une story depuis Claude Code

### Authentification
- Table `api_keys` dans Supabase
- Fonction RPC `verify_api_key(api_key)` pour vérifier les clés
- Format des clés : `cpk_test_[48 chars hex]`

### Configuration locale
Fichier `.mcp.json` à la racine :
```json
{
  "mcpServers": {
    "claude-porn": {
      "type": "stdio",
      "command": "node",
      "args": ["mcp-server/dist/index.js"],
      "env": {
        "SUPABASE_URL": "...",
        "SUPABASE_ANON_KEY": "...",
        "CLAUDE_PORN_API_KEY": "cpk_test_..."
      }
    }
  }
}
```

### Build
```bash
cd mcp-server && npm install && npm run build
```

## Base de données Supabase

### Infos projet
- **Project ID** : `hgxgdknjcifchvuokamj`
- **Region** : `eu-west-3`
- **URL** : `https://hgxgdknjcifchvuokamj.supabase.co`

### Tables

#### `profiles`
Profils utilisateurs (lié à auth.users)
| Colonne | Type | Description |
|---------|------|-------------|
| `id` | uuid | PK, référence auth.users |
| `username` | text | Nom d'utilisateur unique |
| `avatar_url` | text | URL de l'avatar |
| `created_at` | timestamptz | Date de création |

#### `stories`
Les anecdotes postées
| Colonne | Type | Description |
|---------|------|-------------|
| `id` | uuid | PK |
| `user_id` | uuid | FK vers profiles |
| `content` | text | Contenu (max 2000 chars) |
| `created_at` | timestamptz | Date de création |

#### `votes`
Upvotes/downvotes
| Colonne | Type | Description |
|---------|------|-------------|
| `id` | uuid | PK |
| `user_id` | uuid | FK vers profiles |
| `story_id` | uuid | FK vers stories |
| `vote_type` | int | 1 (upvote) ou -1 (downvote) |

#### `api_keys`
Clés API pour le serveur MCP
| Colonne | Type | Description |
|---------|------|-------------|
| `id` | uuid | PK |
| `user_id` | uuid | FK vers profiles |
| `key` | text | La clé API en clair |
| `name` | text | Nom de la clé |
| `revoked` | boolean | Si la clé est révoquée |
| `created_at` | timestamptz | Date de création |

#### `reports`
Signalements de stories

### Fonctions RPC
- `verify_api_key(api_key TEXT)` : Vérifie une clé API, retourne user_id + username
- `insert_story_with_api_key(api_key TEXT, story_content TEXT)` : Insère une story via clé API (bypass RLS avec SECURITY DEFINER), auto-upvote inclus

### Politiques RLS
- **stories SELECT** : Public (tout le monde peut lire)
- **stories INSERT** : `auth.uid() = user_id` (utilisateurs auth uniquement, bypass via RPC pour MCP)
- **stories DELETE** : `auth.uid() = user_id` (propriétaire uniquement)

## Structure du projet
```
src/
├── app/
│   ├── page.tsx              # Feed principal (tri récent/top)
│   ├── submit/page.tsx       # Soumettre une anecdote (+ auto-upvote)
│   ├── auth/login/page.tsx   # Login Discord/GitHub
│   └── u/[username]/page.tsx # Profil utilisateur
├── components/
│   ├── VoteButtons.tsx       # "Ca c'est SOTA" / "T'es tellement 2022 frère"
│   ├── StoryCard.tsx
│   └── StoryFeed.tsx
└── lib/supabase/             # Clients Supabase
```

## Bugs résolus

### Stories non affichées dans le feed
**Cause** : Requête Supabase avec `profiles!inner` ambiguë (plusieurs relations possibles via `stories` et `votes`).

**Fix** : Spécifier la relation explicitement :
```typescript
profiles!stories_user_id_fkey (username, avatar_url)
```

## Prochaines étapes
1. Page `/settings/api-keys` pour générer des clés API
2. Plus de tools MCP (`list_stories`, `vote_story`, etc.)
3. Repo GitHub pour distribution du plugin MCP
