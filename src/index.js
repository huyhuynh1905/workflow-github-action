export default {
  async scheduled(event, env, ctx) {
    // ❗ Cron KHÔNG BAO GIỜ throw
    ctx.waitUntil(runPing(env, true));
  },

  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    if (url.pathname !== "/") {
      return new Response("Ignored", { status: 204 });
    }

    // HTTP chỉ dùng để test thủ công, KHÔNG gửi Discord
    try {
      const result = await runPing(env, false);
      return new Response(result, { status: 200 });
    } catch {
      return new Response("Error", { status: 200 });
    }
  }
};

async function runPing(env, sendToDiscord) {
  const urls = [
    "https://helvior.io.vn/",
    "https://helvior-server.onrender.com/"
  ];

  const nowVN = new Date().toLocaleString("vi-VN", {
    timeZone: "Asia/Ho_Chi_Minh"
  });

  const lines = [];
  let hasError = false;

  for (const url of urls) {
    try {
      const res = await fetch(url, { timeout: 20000 });
      const status = res.status;

      if (status === 200) {
        lines.push(`🟢 \`${url}\` — Thành công`);
      } else {
        hasError = true;
        lines.push(`🔴 \`${url}\` — Lỗi ${status}`);
      }
    } catch {
      hasError = true;
      lines.push(`🔴 \`${url}\` — Không kết nối`);
    }
  }

  const embed = {
    title: "📡 Helvior Ping Report",
    description: lines.join("\n"),
    color: hasError ? 0xff0000 : 0x00cc99,
    footer: { text: `Thời gian: ${nowVN}` }
  };

  if (sendToDiscord) {
    await safeSendDiscord(env, embed);
  }

  return lines.join("\n");
}

// ❗ TUYỆT ĐỐI KHÔNG throw
async function safeSendDiscord(env, embed) {
  try {
    const res = await fetch(env.DISCORD_WEBHOOK_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ embeds: [embed] })
    });

    console.log("✅ Discord response:", res.status);
  } catch (e) {
    console.log("❌ Discord send failed:", e?.message);
  }
}
