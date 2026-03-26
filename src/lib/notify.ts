// Notification: Feishu webhook + Email (optional)

const FEISHU_WEBHOOK = process.env.FEISHU_WEBHOOK;

export async function notifyNewFeedback(
  fb: { id: number; title: string; type: string; description: string; authorName: string | null },
  projectName: string
) {
  // Feishu notification
  if (FEISHU_WEBHOOK) {
    try {
      const typeEmoji: Record<string, string> = {
        bug: "🐛", feature: "💡", improvement: "📝", question: "❓"
      };
      const desc = (fb.description ?? "")
        .replace(/<[^>]*>/g, "") // strip HTML tags
        .substring(0, 200);

      await fetch(FEISHU_WEBHOOK, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          msg_type: "interactive",
          card: {
            header: {
              title: { tag: "plain_text", content: `${typeEmoji[fb.type] ?? "📬"} 新反馈 — ${projectName}` },
              template: fb.type === "bug" ? "red" : "green",
            },
            elements: [
              {
                tag: "div",
                text: {
                  tag: "lark_md",
                  content: `**${fb.title}**\n\n${desc}\n\n来自: ${fb.authorName ?? "匿名"} | 类型: ${fb.type}`,
                },
              },
              {
                tag: "action",
                actions: [
                  {
                    tag: "button",
                    text: { tag: "plain_text", content: "查看详情" },
                    url: `https://forge.wdao.chat/projects/${projectName.toLowerCase().replace(/[^a-z0-9]+/g, "-")}/feedback`,
                    type: "primary",
                  },
                ],
              },
            ],
          },
        }),
      });
    } catch (e) {
      console.error("Feishu notification failed:", e);
    }
  }

  // Email notification (if configured)
  if (process.env.SMTP_HOST && process.env.NOTIFICATION_EMAIL) {
    try {
      const { sendFeedbackNotification } = require("./email");
      await sendFeedbackNotification(fb, projectName);
    } catch (e) {
      console.error("Email notification failed:", e);
    }
  }
}

export async function notifyNewComment(
  issueTitle: string,
  authorName: string,
  content: string,
  projectName: string
) {
  if (!FEISHU_WEBHOOK) return;
  try {
    const desc = content.replace(/<[^>]*>/g, "").substring(0, 200);
    await fetch(FEISHU_WEBHOOK, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        msg_type: "interactive",
        card: {
          header: {
            title: { tag: "plain_text", content: `💬 新评论 — ${projectName}` },
            template: "blue",
          },
          elements: [
            {
              tag: "div",
              text: {
                tag: "lark_md",
                content: `**${issueTitle}**\n\n${authorName}: ${desc}`,
              },
            },
          ],
        },
      }),
    });
  } catch (e) {
    console.error("Feishu comment notification failed:", e);
  }
}
