export default {
    async scheduled(event, env, ctx) {
      await pingAndSend(env, true);
    },
  
    async fetch(request, env, ctx) {
      const url = new URL(request.url);
      if (url.pathname !== "/") {
        return new Response("Ignored", { status: 204 });
      }
      const result = await pingAndSend(env, true);
      return new Response(result, { status: 200 });
    }
  };
  
  async function pingAndSend(env, sendToDiscord = true) {
    const urls = [
      "https://helvior.io.vn/",
      "https://helvior-server.onrender.com/"
    ];
  
    const now = new Date().toLocaleString("vi-VN", { timeZone: "Asia/Ho_Chi_Minh" });
    const lines = [];
  
    for (const url of urls) {
      try {
        const res = await fetch(url);
        const status = res.status;
        if (status === 200) {
          lines.push(`🟢 \`${url}\` — Thành công`);
        } else {
          lines.push(`🔴 \`${url}\` — Lỗi ${status}`);
        }
      } catch {
        lines.push(`🔴 \`${url}\` — Không kết nối`);
      }
    }
  
    const embed = {
      title: "📡 Helvior Ping Report",
      description: lines.join("\n"),
      color: lines.some(l => l.includes("🔴")) ? 0xff0000 : 0x00cc99,
      footer: { text: `Thời gian: ${now}` }
    };
  
    if (sendToDiscord) {
      const res = await fetch(env.DISCORD_WEBHOOK_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ embeds: [embed] })
      });
  
      console.log("Discord response:", res.status);
    }
  
    return lines.join("\n");
  }
  