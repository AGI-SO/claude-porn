# Claude Porn - Notes de session

## État actuel
- **Projet Next.js 16 + Supabase** fonctionnel et déployé
- **Auth OAuth** : Discord + GitHub configurés et fonctionnels
- **Design** : VHS-core / neon-wave avec scanlines, glitch effects, couleurs néon
- **Serveur MCP** : Publié sur npm

## Déploiement

### Production
- **Hébergeur** : Koyeb (free tier)
- **URL** : `https://claude-porn.fr`
- **Repo GitHub** : `AGI-SO/claude-porn`

### Variables d'environnement (Koyeb)
```
NEXT_PUBLIC_SUPABASE_URL=https://hgxgdknjcifchvuokamj.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon_key>
```

### Config Supabase Auth
- **Site URL** : `https://claude-porn.fr`
- **Redirect URLs** : `https://claude-porn.fr/auth/callback`

## Serveur MCP

### Package npm
```bash
npm install -g claude-porn-mcp
# ou via npx
npx -y claude-porn-mcp
```

**Package** : `claude-porn-mcp@0.1.0` sur npm

### Configuration utilisateur
Fichier `.mcp.json` :
```json
{
  "mcpServers": {
    "claude-porn": {
      "type": "stdio",
      "command": "npx",
      "args": ["-y", "claude-porn-mcp"],
      "env": {
        "CLAUDE_PORN_API_KEY": "cpk_..."
      }
    }
  }
}
```

### Tool disponible
- `post_story` : Poster une story depuis Claude Code

### Structure du code MCP
```
mcp-server/
├── src/index.ts      # Serveur MCP avec tool post_story
├── package.json      # Config npm avec bin pour npx
├── tsconfig.json
└── dist/             # Build compilé
```

La clé anon Supabase est hardcodée (publique), seule `CLAUDE_PORN_API_KEY` est requise.

## Base de données Supabase

### Infos projet
- **Project ID** : `hgxgdknjcifchvuokamj`
- **Region** : `eu-west-3`
- **URL** : `https://hgxgdknjcifchvuokamj.supabase.co`

### Tables

| Table | Description |
|-------|-------------|
| `profiles` | Profils utilisateurs (lié à auth.users) |
| `stories` | Les anecdotes postées (avec colonne `score`) |
| `votes` | Upvotes/downvotes (vote_type: 1 ou -1) |
| `reports` | Signalements |
| `api_keys` | Clés API pour le serveur MCP |

### Fonctions RPC

| Fonction | Description |
|----------|-------------|
| `verify_api_key(api_key)` | Vérifie une clé API, retourne user_id + username |
| `insert_story_with_api_key(api_key, story_content)` | Insère une story via clé API (SECURITY DEFINER), auto-upvote inclus |
| `generate_api_key(key_name)` | Génère une nouvelle clé API pour l'utilisateur connecté |
| `revoke_api_key(key_id)` | Révoque une clé API |

### Triggers

| Trigger | Description |
|---------|-------------|
| `on_vote_change` | Met à jour `stories.score` à chaque INSERT/UPDATE/DELETE sur votes |
| `on_auth_user_created` | Crée le profil avec username sanitizé (supprime `#` des usernames Discord) |

## Structure du projet
```
src/
├── app/
│   ├── page.tsx                    # Feed principal (tri récent/top)
│   ├── submit/page.tsx             # Soumettre une anecdote
│   ├── auth/
│   │   ├── login/page.tsx          # Login Discord/GitHub
│   │   └── callback/route.ts       # OAuth callback (gère x-forwarded-*)
│   ├── settings/
│   │   └── api-keys/page.tsx       # Gestion des clés API
│   └── u/[username]/page.tsx       # Profil utilisateur
├── components/
│   ├── Header.tsx                  # Header avec AuthButton
│   ├── AuthButton.tsx              # Login/Logout + lien API
│   ├── VoteButtons.tsx             # Upvote/Downvote
│   ├── StoryCard.tsx
│   └── StoryFeed.tsx
└── lib/supabase/                   # Clients Supabase (server + client)
```

## Bugs résolus

### Stories non affichées (feed et profil)
**Cause** : Requête Supabase avec `profiles!inner` ambiguë (plusieurs FK possibles).
**Fix** : Spécifier la relation explicitement : `profiles!stories_user_id_fkey`

### Score des stories toujours à 0
**Cause** : Le champ `score` n'était jamais mis à jour, seuls les votes étaient insérés.
**Fix** : Trigger `on_vote_change` qui recalcule le score à chaque modification de vote.

### OAuth redirige vers localhost:8000
**Cause** : Derrière le reverse proxy Koyeb, `request.url` retourne l'URL interne.
**Fix** : Utiliser `x-forwarded-host` et `x-forwarded-proto` dans le callback :
```typescript
const host = headersList.get("x-forwarded-host") || headersList.get("host");
const protocol = headersList.get("x-forwarded-proto") || "https";
```

### Username Discord avec `#` casse les URLs
**Cause** : Discord usernames comme `zos_kia#0` contiennent des caractères spéciaux.
**Fix** : Trigger `handle_new_user()` sanitize le username (supprime `#` et ce qui suit).

### Site très lent après OAuth
**Cause** : Multiples appels `getUser()` en cascade (layout → header → authbutton).
**Fix** : Fetch user/profile une seule fois dans `layout.tsx`, passé en props.

### Next.js compile mcp-server et échoue
**Cause** : TypeScript du MCP server incompatible avec Next.js.
**Fix** : Ajouter `"mcp-server"` dans `tsconfig.json` → `exclude`.

## Prochaines étapes
1. Plus de tools MCP (`list_stories`, `vote_story`, etc.)
2. Modération / signalements
3. Pagination du feed
