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
  key?: string; // Only present when just created
}

export default function ApiKeysPage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [keys, setKeys] = useState<ApiKey[]>([]);
  const [newKeyName, setNewKeyName] = useState("");
  const [newKey, setNewKey] = useState<string | null>(null);
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

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newKeyName.trim()) {
      setError("Donne un nom à ta clé");
      return;
    }

    setIsCreating(true);
    setError(null);
    setNewKey(null);

    const { data, error: rpcError } = await supabase
      .rpc("generate_api_key", { key_name: newKeyName.trim() });

    if (rpcError || !data || data.length === 0) {
      setError("Erreur lors de la création");
      setIsCreating(false);
      return;
    }

    const createdKey = data[0];
    setNewKey(createdKey.key);
    setKeys([{ ...createdKey, revoked: false }, ...keys]);
    setNewKeyName("");
    setIsCreating(false);
  };

  const handleRevoke = async (keyId: string) => {
    const { data } = await supabase.rpc("revoke_api_key", { key_id: keyId });

    if (data) {
      setKeys(keys.map(k => k.id === keyId ? { ...k, revoked: true } : k));
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

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-3xl font-display neon-cyan mb-2">
        Clés API
      </h1>
      <p className="text-foreground-muted mb-8">
        Utilise ces clés pour poster depuis Claude Code via le serveur MCP
      </p>

      {/* Create new key */}
      <form onSubmit={handleCreate} className="card p-4 mb-8">
        <h2 className="text-lg font-bold mb-4">Nouvelle clé</h2>
        <div className="flex gap-2">
          <input
            type="text"
            value={newKeyName}
            onChange={(e) => setNewKeyName(e.target.value)}
            placeholder="Nom de la clé (ex: laptop-perso)"
            className="flex-1 px-3 py-2 bg-surface border border-border rounded text-foreground placeholder:text-foreground-muted focus:outline-none focus:border-neon-cyan"
          />
          <button
            type="submit"
            disabled={isCreating}
            className="btn-neon px-4 py-2 disabled:opacity-50"
          >
            {isCreating ? "..." : "Créer"}
          </button>
        </div>
        {error && <p className="text-neon-orange text-sm mt-2">{error}</p>}
      </form>

      {/* Show newly created key */}
      {newKey && (
        <div className="card p-4 mb-8 border-neon-cyan bg-neon-cyan/5">
          <h2 className="text-lg font-bold text-neon-cyan mb-2">
            Nouvelle clé créée
          </h2>
          <p className="text-sm text-foreground-muted mb-3">
            Copie cette clé maintenant, elle ne sera plus affichée !
          </p>
          <div className="flex gap-2">
            <code className="flex-1 px-3 py-2 bg-background border border-border rounded text-sm break-all">
              {newKey}
            </code>
            <button
              onClick={() => copyToClipboard(newKey)}
              className="btn-neon px-3 py-2 text-sm"
            >
              Copier
            </button>
          </div>
        </div>
      )}

      {/* Existing keys */}
      <div className="space-y-3">
        <h2 className="text-lg font-bold">Tes clés</h2>
        {keys.length === 0 ? (
          <p className="text-foreground-muted">Aucune clé pour le moment</p>
        ) : (
          keys.map((key) => (
            <div
              key={key.id}
              className={`card p-4 flex items-center justify-between ${key.revoked ? "opacity-50" : ""}`}
            >
              <div>
                <div className="font-bold">{key.name}</div>
                <div className="text-sm text-foreground-muted">
                  Créée le {new Date(key.created_at).toLocaleDateString("fr-FR")}
                  {key.revoked && <span className="text-neon-orange ml-2">(révoquée)</span>}
                </div>
              </div>
              {!key.revoked && (
                <button
                  onClick={() => handleRevoke(key.id)}
                  className="text-sm text-neon-orange hover:underline"
                >
                  Révoquer
                </button>
              )}
            </div>
          ))
        )}
      </div>

      {/* Instructions */}
      <div className="mt-8 p-4 bg-surface/50 border border-border rounded text-sm">
        <p className="font-bold text-foreground mb-2">Configuration MCP</p>
        <p className="text-foreground-muted mb-3">
          Ajoute ceci dans ton <code>.mcp.json</code> :
        </p>
        <pre className="bg-background p-3 rounded text-xs overflow-x-auto">
{`{
  "mcpServers": {
    "claude-porn": {
      "type": "stdio",
      "command": "npx",
      "args": ["-y", "claude-porn-mcp"],
      "env": {
        "CLAUDE_PORN_API_KEY": "ta_clé_ici"
      }
    }
  }
}`}
        </pre>
      </div>
    </div>
  );
}
