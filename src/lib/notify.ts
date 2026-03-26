// Notification: Feishu webhook + Email (optional)

const FEISHU_WEBHOOK = process.env.FEISHU_WEBHOOK;
const BASE_URL = "https://forge.wdao.chat";

const TYPE_LABELS: Record<string, string> = {
  bug: "\uD83D\uDC1B Bug",
  feature: "\uD83D\uDCA1 功能建议",
  improvement: "\uD83D\uDCDD 改进",
  question: "❓ 问题",
};

async function sendFeishuCard(card: Record<string, unknown>) {
  if (!FEISHU_WEBHOOK) return;
  try {
    await fetch(FEISHU_WEBHOOK, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ msg_type: "interactive", card }),
    });
  } catch (e) {
    console.error("Feishu notification failed:", e);
  }
}

export async function notifyNewFeedback(
  fb: { id: number; title: string; type: string; description: string; authorName: string | null; images?: string[] },
  projectName: string,
  projectSlug?: string,
) {
  const typeLabel = TYPE_LABELS[fb.type] ?? fb.type;
  const desc = (fb.description ?? "")
    .replace(/<[^>]*>/g, "")
    .substring(0, 200);
  const hasImages = fb.images && Array.isArray(fb.images) && fb.images.length > 0;
  const imageNote = hasImages ? `\n\uD83D\uDCCE 包含 ${fb.images!.length} 张图片` : "";
  const slug = projectSlug ?? projectName.toLowerCase().replace(/[^a-z0-9]+/g, "-");
  const detailUrl = `${BASE_URL}/projects/${slug}/feedback/${fb.id}`;

  // Feishu notification
  await sendFeishuCard({
    header: {
      title: { tag: "plain_text", content: "\uD83D\uDCEC 新反馈" },
      template: fb.type === "bug" ? "red" : "green",
    },
    elements: [
      {
        tag: "div",
        fields: [
          { is_short: true, text: { tag: "lark_md", content: `**项目**\n${projectName}` } },
          { is_short: true, text: { tag: "lark_md", content: `**类型**\n${typeLabel}` } },
        ],
      },
      {
        tag: "div",
        fields: [
          { is_short: true, text: { tag: "lark_md", content: `**提交者**\n${fb.authorName ?? "匿名"}` } },
          { is_short: true, text: { tag: "lark_md", content: `**时间**\n${new Date().toLocaleString("zh-CN", { timeZone: "Asia/Shanghai" })}` } },
        ],
      },
      { tag: "hr" },
      {
        tag: "div",
        text: { tag: "lark_md", content: `**${fb.title}**\n${desc}${imageNote}` },
      },
      { tag: "hr" },
      {
        tag: "action",
        actions: [{
          tag: "button",
          text: { tag: "plain_text", content: "查看详情 →" },
          url: detailUrl,
          type: "primary",
        }],
      },
    ],
  });

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

export async function notifyNewReply(
  feedbackTitle: string,
  authorName: string,
  content: string,
  projectSlug: string,
  feedbackId: number,
) {
  const desc = content.replace(/<[^>]*>/g, "").substring(0, 200);
  const detailUrl = `${BASE_URL}/projects/${projectSlug}/feedback/${feedbackId}`;

  await sendFeishuCard({
    header: {
      title: { tag: "plain_text", content: "\uD83D\uDCAC 新反馈回复" },
      template: "blue",
    },
    elements: [
      {
        tag: "div",
        fields: [
          { is_short: true, text: { tag: "lark_md", content: `**反馈**\n${feedbackTitle}` } },
          { is_short: true, text: { tag: "lark_md", content: `**回复者**\n${authorName}` } },
        ],
      },
      {
        tag: "div",
        fields: [
          { is_short: true, text: { tag: "lark_md", content: `**时间**\n${new Date().toLocaleString("zh-CN", { timeZone: "Asia/Shanghai" })}` } },
        ],
      },
      { tag: "hr" },
      {
        tag: "div",
        text: { tag: "lark_md", content: desc },
      },
      { tag: "hr" },
      {
        tag: "action",
        actions: [{
          tag: "button",
          text: { tag: "plain_text", content: "查看详情 →" },
          url: detailUrl,
          type: "primary",
        }],
      },
    ],
  });
}

export async function notifyNewIssueComment(
  issueTitle: string,
  authorName: string,
  content: string,
  projectSlug: string,
  issueId: number,
) {
  const desc = content.replace(/<[^>]*>/g, "").substring(0, 200);
  const detailUrl = `${BASE_URL}/projects/${projectSlug}/issues`;

  await sendFeishuCard({
    header: {
      title: { tag: "plain_text", content: "\uD83D\uDCAC 新Issue评论" },
      template: "purple",
    },
    elements: [
      {
        tag: "div",
        fields: [
          { is_short: true, text: { tag: "lark_md", content: `**Issue**\n${issueTitle}` } },
          { is_short: true, text: { tag: "lark_md", content: `**评论者**\n${authorName}` } },
        ],
      },
      {
        tag: "div",
        fields: [
          { is_short: true, text: { tag: "lark_md", content: `**时间**\n${new Date().toLocaleString("zh-CN", { timeZone: "Asia/Shanghai" })}` } },
        ],
      },
      { tag: "hr" },
      {
        tag: "div",
        text: { tag: "lark_md", content: desc },
      },
      { tag: "hr" },
      {
        tag: "action",
        actions: [{
          tag: "button",
          text: { tag: "plain_text", content: "查看详情 →" },
          url: detailUrl,
          type: "primary",
        }],
      },
    ],
  });
}

// Backward compatibility alias
export const notifyNewComment = notifyNewIssueComment;
