/**
 * Unit test suite for CodeContext SpecGuard core logic
 */
import assert from 'node:assert';

function extractTextFromAdf(node) {
  if (!node) return '';
  if (typeof node === 'string') return node;
  if (node.text) return node.text;

  if (Array.isArray(node.content)) {
    const pieces = node.content.map(extractTextFromAdf).filter(Boolean);
    if (node.type === 'listItem') return '• ' + pieces.join(' ');
    if (node.type === 'bulletList' || node.type === 'orderedList') return pieces.join('\n');
    if (node.type === 'heading') return '\n### ' + pieces.join(' ') + '\n';
    if (node.type === 'paragraph') return pieces.join(' ');
    return pieces.join('\n');
  }
  return '';
}

function extractAcceptanceCriteria(text) {
  if (!text) return [];
  const lines = text.split('\n').map((l) => l.trim()).filter(Boolean);
  const criteria = [];
  let inCriteriaSection = false;

  for (const line of lines) {
    const lower = line.toLowerCase();
    if (lower.includes('acceptance criteria') || lower.includes('kriteria penerimaan')) {
      inCriteriaSection = true;
      continue;
    }
    if (inCriteriaSection) {
      if (line.startsWith('###') || line.startsWith('##')) {
        inCriteriaSection = false;
        continue;
      }
      const cleaned = line.replace(/^[•\-\*\d\.\s\[\]]+/, '').trim();
      if (cleaned.length > 5) criteria.push(cleaned);
    } else {
      if (line.startsWith('- [ ]') || line.startsWith('[ ]')) {
        const cleaned = line.replace(/^(\- )?\[[ x]\]\s*/i, '').trim();
        if (cleaned.length > 5) criteria.push(cleaned);
      }
    }
  }
  return criteria;
}

// 1. Test ADF extraction
const mockAdf = {
  type: 'doc',
  version: 1,
  content: [
    {
      type: 'paragraph',
      content: [{ type: 'text', text: 'Implement OAuth 2.0 flow.' }]
    },
    {
      type: 'heading',
      attrs: { level: 3 },
      content: [{ type: 'text', text: 'Acceptance Criteria' }]
    },
    {
      type: 'bulletList',
      content: [
        { type: 'listItem', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Validate JWT expiration.' }] }] },
        { type: 'listItem', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Return 401 when token is missing.' }] }] }
      ]
    }
  ]
};

const text = extractTextFromAdf(mockAdf);
assert(text.includes('Implement OAuth 2.0 flow.'));
assert(text.includes('Validate JWT expiration.'));
console.log('✔ ADF text extraction test passed');

// 2. Test Criteria Extraction
const criteria = extractAcceptanceCriteria(text);
assert.strictEqual(criteria.length, 2);
assert.strictEqual(criteria[0], 'Validate JWT expiration.');
assert.strictEqual(criteria[1], 'Return 401 when token is missing.');
console.log('✔ Acceptance criteria extraction test passed');

// 3. Test Diff Verification
const diffSample = `
+ if (!req.headers.authorization) {
+   return res.status(401).json({ error: "Unauthorized" });
+ }
+ const decoded = jwt.verify(token, secret);
+ if (Date.now() >= decoded.exp * 1000) {
+   throw new Error("Validate JWT expiration");
+ }
`;

let matched = 0;
for (const crit of criteria) {
  const words = crit.toLowerCase().replace(/[^a-z0-9]/g, ' ').split(/\s+/).filter(w => w.length > 3);
  const match = words.filter(w => diffSample.toLowerCase().includes(w));
  if (match.length >= 2) matched++;
}
assert.strictEqual(matched, 2);
console.log('✔ Diff compliance verification test passed');

console.log('\nAll 3 unit test suites PASSED successfully.');
