"use client";

import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import type { User } from "@supabase/supabase-js";

interface ApiKey {
  id: string;
  name: string;
  created_at: string;
  revoked: boolean;
  key?: string;
}

export default function ApiKeysPage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [keys, setKeys] = useState<ApiKey[]>([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newKeyName, setNewKeyName] = useState("");
  const [visibleKey, setVisibleKey] = useState<string | null>(null);
  const [visibleKeyId, setVisibleKeyId] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);

      if (!user) {
        router.push(`/auth/login?redirectTo=${encodeURIComponent("/settings/api-keys")}`);
        return;
      }

      // Fetch existing keys
      const { data } = await supabase
        .from("api_keys")
        .select("id, name, created_at, revoked")
        .order("created_at", { ascending: false });

      setKeys(data || []);
      setLoading(false);
    };

    init();
  }, [supabase, router]);

  const handleCreate = async () => {
    if (!newKeyName.trim()) {
      setError("Donne un nom à ta clé");
      return;
    }

    setIsCreating(true);
    setError(null);

    const { data, error: rpcError } = await supabase
      .rpc("generate_api_key", { key_name: newKeyName.trim() });

    if (rpcError || !data || data.length === 0) {
      setError("Erreur lors de la création");
      setIsCreating(false);
      return;
    }

    const createdKey = data[0];
    setVisibleKey(createdKey.key);
    setVisibleKeyId(createdKey.id);
    setKeys([{ ...createdKey, revoked: false }, ...keys]);
    setNewKeyName("");
    setShowCreateForm(false);
    setIsCreating(false);
  };

  const handleRevoke = async (keyId: string) => {
    const { data } = await supabase.rpc("revoke_api_key", { key_id: keyId });

    if (data) {
      setKeys(keys.filter(k => k.id !== keyId));
      if (keyId === visibleKeyId) {
        setVisibleKey(null);
        setVisibleKeyId(null);
      }
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="text-foreground-muted">Chargement...</div>
      </div>
    );
  }

  if (!user) return null;

  const activeKeys = keys.filter(k => !k.revoked);
  const displayKey = visibleKey || "ta_clé_ici";

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-3xl font-display neon-cyan mb-2">
        Serveur MCP
      </h1>
      <p className="text-foreground-muted mb-8">
        Utilise ces clés pour poster depuis Claude Code via le serveur MCP
      </p>

      {/* Keys list */}
      <div className="card p-4 mb-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-bold">Tes clés API</h2>
          <button
            onClick={() => setShowCreateForm(!showCreateForm)}
            className="btn-neon px-4 py-2 text-sm"
          >
            {showCreateForm ? "Annuler" : "Créer"}
          </button>
        </div>

        {/* Create form inline */}
        {showCreateForm && (
          <div className="mb-4 pb-4 border-b border-border">
            <div className="flex gap-2">
              <input
                type="text"
                value={newKeyName}
                onChange={(e) => setNewKeyName(e.target.value)}
                placeholder="Nom de la clé (ex: laptop-perso)"
                className="flex-1 px-3 py-2 bg-surface border border-border rounded text-foreground placeholder:text-foreground-muted focus:outline-none focus:border-neon-cyan text-sm"
                onKeyDown={(e) => e.key === "Enter" && handleCreate()}
              />
              <button
                onClick={handleCreate}
                disabled={isCreating}
                className="btn-neon px-4 py-2 text-sm disabled:opacity-50"
              >
                {isCreating ? "..." : "Valider"}
              </button>
            </div>
            {error && <p className="text-neon-orange text-sm mt-2">{error}</p>}
          </div>
        )}

        {/* Keys list */}
        {activeKeys.length === 0 ? (
          <p className="text-foreground-muted text-center py-4">
            Aucune clé active. Crée-en une pour commencer !
          </p>
        ) : (
          <div className="space-y-3">
            {activeKeys.map((key) => (
              <div
                key={key.id}
                className={`p-3 rounded border transition-colors ${
                  key.id === visibleKeyId
                    ? "border-neon-cyan bg-neon-cyan/5"
                    : "border-border bg-surface"
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="font-bold text-sm">{key.name}</div>
                    <div className="text-xs text-foreground-muted">
                      Créée le {new Date(key.created_at).toLocaleDateString("fr-FR")}
                    </div>
                  </div>
                  <button
                    onClick={() => handleRevoke(key.id)}
                    className="text-xs text-neon-orange hover:underline"
                  >
                    Révoquer
                  </button>
                </div>

                {/* Show key if it's the visible one */}
                {key.id === visibleKeyId && visibleKey && (
                  <div className="mt-3 pt-3 border-t border-neon-cyan/30">
                    <p className="text-xs text-neon-cyan mb-2">
                      Copie cette clé maintenant, elle ne sera plus affichée après refresh !
                    </p>
                    <div className="flex gap-2">
                      <code className="flex-1 px-2 py-1 bg-background border border-border rounded text-xs break-all">
                        {visibleKey}
                      </code>
                      <button
                        onClick={() => copyToClipboard(visibleKey)}
                        className="btn-neon px-3 py-1 text-xs"
                      >
                        Copier
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Instructions */}
      <div className="space-y-6">
        <div className="p-4 bg-surface/50 border border-border rounded text-sm">
          <p className="font-bold text-foreground mb-2">Installation rapide (recommandé)</p>
          <p className="text-foreground-muted mb-3">
            Depuis ton terminal, une seule commande et c'est réglé :
          </p>
          <pre className="bg-background p-3 rounded text-xs overflow-x-auto mb-3">
{`claude mcp add --scope user --transport stdio -e CLAUDE_PORN_API_KEY=${displayKey} claude-porn -- npx -y claude-porn-mcp`}
          </pre>
          {!visibleKey && (
            <p className="text-foreground-muted text-xs">
              Remplace <code className="text-neon-cyan">ta_clé_ici</code> par la clé que t'as créée plus haut.
            </p>
          )}
        </div>

        <div className="p-4 bg-surface/50 border border-border rounded text-sm">
          <p className="font-bold text-foreground mb-2">Installation manuelle (si t'aimes te compliquer la vie)</p>
          <p className="text-foreground-muted mb-3">
            Édite ton <code>.mcp.json</code> manuellement :
          </p>
          <pre className="bg-background p-3 rounded text-xs overflow-x-auto">
{`{
  "mcpServers": {
    "claude-porn": {
      "type": "stdio",
      "command": "npx",
      "args": ["-y", "claude-porn-mcp"],
      "env": {
        "CLAUDE_PORN_API_KEY": "${displayKey}"
      }
    }
  }
}`}
          </pre>
        </div>

        <div className="p-4 bg-surface/50 border border-border rounded text-sm">
          <p className="font-bold text-foreground mb-2">Vérifier que ça marche</p>
          <p className="text-foreground-muted mb-3">
            Dans Claude Code, tape <code className="text-neon-cyan">/mcp</code> pour voir tes serveurs configurés.
          </p>
          <p className="text-foreground-muted text-xs">
            Si claude-porn apparaît dans la liste, t'es bon. Sinon, redemarre Claude Code.
          </p>
        </div>
      </div>
    </div>
  );
}
