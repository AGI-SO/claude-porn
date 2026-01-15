# Claude Porn - Notes de session

## Ton et wording

### Principes
- **Tutoiement** systématique
- **Phrases courtes**, directes, percutantes
- **Mélange français/anglais** technique (franglais assumé)
- **Ton légèrement ironique/sarcastique** mais bienveillant
- **Métaphores télé/diffusion** : "transmission", "diffuser", "studio", "vu à la télé"
- **Messages d'erreur provocateurs** mais drôles ("T'as rien à raconter ? Retourne sur ChatGPT.")

### Exemples de wording
- Navigation : "Fresh", "Hall of Fame", "Hot cette semaine"
- Actions : "Diffuser", "Transmission...", "Édition spéciale"
- Erreurs : Direct et un peu piquant, jamais condescendant
- Boutons : Verbes d'action clairs, pas de "Cliquez ici" ou formules corporate

### À éviter
- Vouvoiement
- Jargon corporate ("Veuillez...", "Merci de...")
- Phrases longues et complexes
- Ton trop sérieux ou académique

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

### Vérification des déploiements
- **TOUJOURS** vérifier le déploiement après un push avec le skill `/check-deploy`
- Commandes Koyeb CLI :
  - `koyeb service get curious-micki/claude-porn` → vérifier le statut
  - `koyeb instances list` → lister les instances et leur santé
  - `koyeb service logs curious-micki/claude-porn` → voir les logs
- Le déploiement doit être `HEALTHY` avant de considérer la tâche terminée

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

### ⚠️ Règle importante
**Toute modification de fonction ou trigger sur Supabase DOIT être reportée dans `sql/`.**
- Fonctions → `sql/functions/<nom_fonction>.sql`
- Triggers → `sql/triggers/<nom_trigger>.sql`

Le dossier `sql/` est la source de vérité pour le code backend Supabase.

### ⚠️ Règles de commit
1. **Commiter par blocs de fonctionnalité** — pas de commits pour un petit changement de wording, sauf si l'utilisateur le demande explicitement.
2. **Après un push, TOUJOURS lancer `/check-deploy`** — le déploiement doit être `HEALTHY` avant de considérer la tâche terminée.

### ⚠️ Règles de session
1. **Serveur local toujours actif** — lancer `npm run dev` en background au début de la session pour que l'utilisateur puisse tester rapidement.
2. **npm publish interdit** — je ne peux pas publier sur npm (OTP requis). Toujours demander à l'utilisateur de le faire :
   ```bash
   cd mcp-server && npm publish
   ```

## Structure du projet
```
sql/
├── functions/                      # Fonctions RPC Supabase
│   ├── generate_api_key.sql
│   ├── handle_new_user.sql
│   ├── insert_story_with_api_key.sql
│   ├── revoke_api_key.sql
│   ├── sanitize_username.sql
│   ├── update_story_score.sql
│   └── verify_api_key.sql
└── triggers/                       # Triggers Supabase
    ├── on_auth_user_created.sql
    └── on_vote_change.sql

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

## GitHub Actions - Règles d'engagement

Claude est déclenché via :
- Label `claude` sur une issue
- Mention `@claude` dans un commentaire
- Assignation à `claude[bot]`

### Quand créer une PR directement :
- Bug fixes évidents (typos, erreurs simples)
- Issues labelées `quick-fix` ou `good-first-issue`
- Demandes explicites de code dans l'issue

### Quand demander clarification d'abord :
- Features nouvelles sans spec détaillée
- Changements d'architecture
- Modifications de la DB (nouvelles tables, colonnes, RPC)
- Tout ce qui est ambigu

### Quand faire de la recherche seulement :
- Issues labelées `question` ou `research`
- Demandes d'investigation ou d'explication
- Analyse de bugs sans fix évident

### Convention de branches :
```
claude/issue-{number}-{short-description}
```

### Après chaque PR :
1. Attendre la review du maintainer
2. Ne pas merge sans approbation explicite

## Prochaines étapes
1. Plus de tools MCP (`list_stories`, `vote_story`, etc.)
2. Modération / signalements
3. Pagination du feed
