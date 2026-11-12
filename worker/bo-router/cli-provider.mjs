// Chỉ chạy trên máy chủ Node có Codex CLI đăng nhập; không triển khai trong Worker.
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';
export function classifyCli(messages, { timeoutMs = 60000 } = {}) {
  return new Promise((resolve, reject) => {
    const started = performance.now();
    const child = spawn(process.env.CODEX_APP_RUNTIME_CLI_PATH || 'codex', [
      'exec', '--ephemeral', '--ignore-user-config', '--model', 'gpt-6-luna',
      '--sandbox', 'read-only', '--output-schema', fileURLToPath(new URL('./cli-schema.json', import.meta.url)), '--json', '-'
    ], { shell: false, windowsHide: true, stdio: ['pipe', 'pipe', 'pipe'] });
    let stdout = '', stderr = '';
    const timer = setTimeout(() => { child.kill(); reject(new Error('CLI timeout')); }, timeoutMs);
    child.stdout.on('data', chunk => { stdout += chunk; });
    child.stderr.on('data', chunk => { stderr += chunk; });
    child.on('error', error => { clearTimeout(timer); reject(error); });
    child.on('close', code => {
      clearTimeout(timer);
      if (code !== 0) return reject(new Error('CLI failed: ' + code));
      try {
        const events = stdout.split(/\r?\n/).filter(Boolean).map(line => JSON.parse(line));
        const text = events.filter(e => e.type === 'item.completed' && e.item?.type === 'agent_message').at(-1)?.item.text;
        if (!text || events.some(e => e.item && !['agent_message', 'reasoning'].includes(e.item.type))) throw new Error('Unexpected CLI output/tool use');
        resolve({ response: text, usage: events.find(e => e.type === 'turn.completed')?.usage || {}, elapsed_ms: performance.now() - started });
      } catch { reject(new Error('Invalid CLI result')); }
    });
    child.stdin.end(messages.map(m => m.role + ': ' + m.content).join('\n\n') + '\nDo not use tools. Return classification JSON only.');
  });
}
