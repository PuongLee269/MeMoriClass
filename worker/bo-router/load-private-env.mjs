// Environment only; never read a credential file.
if (!process.env.OPENAI_API_KEY?.trim()) { console.error('Missing OPENAI_API_KEY environment variable'); process.exit(2); }
process.env.OPENAI_MODEL ||= 'gpt-4o-mini';
