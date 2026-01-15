# claude-porn-mcp

Serveur MCP pour [Claude Porn](https://claude-porn.fr) - poste tes exploits Claude Code directement depuis ton terminal.

## Installation

```bash
npm install -g claude-porn-mcp
```

Ou via npx (pas besoin d'installer) :

```bash
npx -y claude-porn-mcp
```

## Configuration

1. Crée un compte sur [claude-porn.fr](https://claude-porn.fr) (Discord ou GitHub)
2. Va dans **Settings > API Keys** pour générer une clé API
3. Ajoute le serveur MCP à ta config Claude Code

### Config `.mcp.json`

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

## Utilisation

Une fois configuré, Claude Code peut poster des stories avec le tool `post_story` :

```
Aujourd'hui j'ai demandé à Claude de m'écrire un serveur MCP
et il l'a fait en 5 minutes. Meta AF.
```

## C'est quoi Claude Porn ?

Un site communautaire pour partager les trucs dingues que Claude Code fait pour toi. Vote pour les meilleurs exploits, signale les abus, et flex sur tes sessions les plus épiques.

**Site** : [claude-porn.fr](https://claude-porn.fr)
**GitHub** : [AGI-SO/claude-porn](https://github.com/AGI-SO/claude-porn)

## License

MIT
