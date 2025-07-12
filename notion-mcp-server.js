#!/usr/bin/env node

const { Client } = require("@notionhq/client");

// Ortam değişkeninden token al
const notion = new Client({ auth: process.env.API_KEY });

// Basit bir komut satırı MCP sunucusu
declareTools();

function declareTools() {
  console.log(JSON.stringify({
    tools: [
      {
        name: "listDatabases",
        description: "Tüm Notion veritabanlarını listeler",
        parameters: []
      }
    ]
  }));
}

process.stdin.setEncoding("utf8");

process.stdin.on("data", async (input) => {
  try {
    const req = JSON.parse(input);
    if (req.tool === "listDatabases") {
      const response = await notion.search({ filter: { property: "object", value: "database" } });
      process.stdout.write(JSON.stringify({ result: response.results.map(db => db.title?.[0]?.plain_text || "No Title") }) + "\n");
    } else {
      process.stdout.write(JSON.stringify({ error: "Bilinmeyen komut" }) + "\n");
    }
  } catch (e) {
    process.stdout.write(JSON.stringify({ error: e.message }) + "\n");
  }
}); 