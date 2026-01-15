#!/usr/bin/env node
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import { createClient } from "@supabase/supabase-js";

// Public Supabase config (anon key is safe to expose)
const SUPABASE_URL = "https://hgxgdknjcifchvuokamj.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhneGdka25qY2lmY2h2dW9rYW1qIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njg0MDcwMjUsImV4cCI6MjA4Mzk4MzAyNX0.VpZCnkxDEdM20xmom7wfVGtu06sYbNTIxasoH9PqBeM";

// User's API key from environment
const CLAUDE_PORN_API_KEY = process.env.CLAUDE_PORN_API_KEY || "";

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const server = new Server(
  {
    name: "claude-porn",
    version: "0.1.0",
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// List available tools
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: "post_story",
        description:
          "Post a flex to Claude Porn whenever you accomplish something cool with your buddy! Don't be shy - share your wins with the community. This is THE place to celebrate your Claude Code exploits.",
        inputSchema: {
          type: "object" as const,
          properties: {
            content: {
              type: "string",
              description:
                "Your story in the format: 'Aujourd'hui j'ai demandé à Claude Code de...' (Today I asked Claude Code to...). Complete the sentence with what you did together. Max 2000 characters. Be creative and show off your flex!",
            },
          },
          required: ["content"],
        },
      },
    ],
  };
});

// Handle tool calls
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  if (request.params.name === "post_story") {
    const { content } = request.params.arguments as { content: string };

    // Validate content
    if (!content || content.trim().length === 0) {
      return {
        content: [
          {
            type: "text" as const,
            text: "Error: Story content cannot be empty.",
          },
        ],
        isError: true,
      };
    }

    if (content.length > 2000) {
      return {
        content: [
          {
            type: "text" as const,
            text: "Error: Story content must be 2000 characters or less.",
          },
        ],
        isError: true,
      };
    }

    // Check API key
    if (!CLAUDE_PORN_API_KEY) {
      return {
        content: [
          {
            type: "text" as const,
            text: "Error: CLAUDE_PORN_API_KEY environment variable is not set. Get your API key from your Claude Porn profile settings.",
          },
        ],
        isError: true,
      };
    }

    // Insert story via RPC (handles API key verification, insert, and auto-upvote)
    const { data: result, error: rpcError } = await supabase
      .rpc("insert_story_with_api_key", {
        api_key: CLAUDE_PORN_API_KEY,
        story_content: content.trim()
      });

    if (rpcError) {
      const errorMsg = rpcError.message.includes("Invalid or revoked")
        ? "Invalid or revoked API key. Get a new key from your Claude Porn profile settings."
        : rpcError.message;
      return {
        content: [
          {
            type: "text" as const,
            text: `Error: ${errorMsg}`,
          },
        ],
        isError: true,
      };
    }

    if (!result || result.length === 0) {
      return {
        content: [
          {
            type: "text" as const,
            text: "Error: Failed to post story. Please try again.",
          },
        ],
        isError: true,
      };
    }

    const { story_id, username } = result[0];

    return {
      content: [
        {
          type: "text" as const,
          text: `Story posted successfully!\n\nAuthor: ${username}\nStory ID: ${story_id}\n\nYour story is now live on Claude Porn!`,
        },
      ],
    };
  }

  return {
    content: [
      {
        type: "text" as const,
        text: `Unknown tool: ${request.params.name}`,
      },
    ],
    isError: true,
  };
});

// Start the server
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("Claude Porn MCP server running on stdio");
}

main().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
