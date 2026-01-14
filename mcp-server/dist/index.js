#!/usr/bin/env node
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { CallToolRequestSchema, ListToolsRequestSchema, } from "@modelcontextprotocol/sdk/types.js";
import { createClient } from "@supabase/supabase-js";
const SUPABASE_URL = process.env.SUPABASE_URL || "https://hgxgdknjcifchvuokamj.supabase.co";
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || "";
const CLAUDE_PORN_API_KEY = process.env.CLAUDE_PORN_API_KEY || "";
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
const server = new Server({
    name: "claude-porn",
    version: "0.1.0",
}, {
    capabilities: {
        tools: {},
    },
});
// List available tools
server.setRequestHandler(ListToolsRequestSchema, async () => {
    return {
        tools: [
            {
                name: "post_story",
                description: "Post a story about your Claude Code exploit to Claude Porn. Share your craziest Claude Code moments with the community!",
                inputSchema: {
                    type: "object",
                    properties: {
                        content: {
                            type: "string",
                            description: "The story content (max 2000 characters). Describe what crazy thing Claude Code did for you!",
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
        const { content } = request.params.arguments;
        // Validate content
        if (!content || content.trim().length === 0) {
            return {
                content: [
                    {
                        type: "text",
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
                        type: "text",
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
                        type: "text",
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
                        type: "text",
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
                        type: "text",
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
                    type: "text",
                    text: `Story posted successfully!\n\nAuthor: ${username}\nStory ID: ${story_id}\n\nYour story is now live on Claude Porn!`,
                },
            ],
        };
    }
    return {
        content: [
            {
                type: "text",
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
