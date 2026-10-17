// Kiểm tra content.json: parse được và khớp fallbackContent trong index.html.
// Chạy: node scripts/check-content.js
const fs = require("fs");
const vm = require("vm");
const assert = require("assert");

const content = JSON.parse(fs.readFileSync("content.json", "utf8"));
const html = fs.readFileSync("index.html", "utf8");
const m = html.match(/const fallbackContent = (\{[\s\S]*?\n    \});/);
assert(m, "Không tìm thấy fallbackContent trong index.html");
const fallback = JSON.parse(JSON.stringify(vm.runInNewContext("(" + m[1] + ")"))); // bỏ prototype của vm

// Các khóa cố ý khác nhau giữa hai nguồn (hero thật dùng video riêng, tiêu đề phương pháp...).
const ALLOWED_DIFF = new Set(["hero", "nav", "method", "site"]);
const problems = [];
for (const key of Object.keys(fallback)) {
  if (ALLOWED_DIFF.has(key)) continue;
  try { assert.deepStrictEqual(content[key], fallback[key]); }
  catch (e) { problems.push(`"${key}" trong content.json khác fallbackContent`); }
}
// Lộ trình phải là 6 môn và có videoUrl
try { assert.deepStrictEqual(content.steps, fallback.steps); } catch (e) { problems.push("steps khác nhau"); }
try { assert.deepStrictEqual(content.method, fallback.method); } catch (e) { problems.push("method khác nhau"); }
assert(Array.isArray(content.steps) && content.steps.every(s => s.title && s.text), "steps thiếu title/text");

if (problems.length) { console.error(problems.join("\n")); process.exit(1); }
console.log("content.json hợp lệ và đồng bộ với fallbackContent.");
