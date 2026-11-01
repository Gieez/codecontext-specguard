import api, { route } from '@forge/api';

/**
 * Extracts human-readable plain text from Atlassian Document Format (ADF) trees.
 * Handles paragraphs, headings, bullet/ordered lists, codeblocks, and text nodes.
 */
function extractTextFromAdf(node) {
  if (!node) return '';
  if (typeof node === 'string') return node;
  if (node.text) return node.text;

  if (Array.isArray(node.content)) {
    const pieces = node.content.map(extractTextFromAdf).filter(Boolean);
    if (node.type === 'listItem') {
      return '• ' + pieces.join(' ');
    }
    if (node.type === 'bulletList' || node.type === 'orderedList') {
      return pieces.join('\n');
    }
    if (node.type === 'heading') {
      return '\n### ' + pieces.join(' ') + '\n';
    }
    if (node.type === 'paragraph') {
      return pieces.join(' ');
    }
    return pieces.join('\n');
  }

  return '';
}

/**
 * Parses raw text to extract concrete acceptance criteria items.
 * Looks for sections labeled 'acceptance criteria', checklist boxes [ ], or bullet points.
 */
function extractAcceptanceCriteria(text) {
  if (!text) return [];

  const lines = text.split('\n').map((l) => l.trim()).filter(Boolean);
  const criteria = [];
  let inCriteriaSection = false;

  for (const line of lines) {
    const lower = line.toLowerCase();

    if (lower.includes('acceptance criteria') || lower.includes('kriteria penerimaan') || lower.includes('spec requirements')) {
      inCriteriaSection = true;
      continue;
    }

    if (inCriteriaSection) {
      // Exit section if another major heading is encountered
      if (line.startsWith('###') || line.startsWith('##') || line.startsWith('==')) {
        inCriteriaSection = false;
        continue;
      }
      const cleaned = line.replace(/^[•\-\*\d\.\s\[\]]+/, '').trim();
      if (cleaned.length > 5) {
        criteria.push(cleaned);
      }
    } else {
      // Check for standalone checklist items like [ ] or - [x]
      if (line.startsWith('- [ ]') || line.startsWith('- [x]') || line.startsWith('[ ]') || line.startsWith('[x]')) {
        const cleaned = line.replace(/^(\- )?\[[ x]\]\s*/i, '').trim();
        if (cleaned.length > 5) {
          criteria.push(cleaned);
        }
      }
    }
  }

  // Fallback: If no explicit section found, extract lines starting with bullet points or numbers
  if (criteria.length === 0) {
    for (const line of lines) {
      if (/^(\d+\.|\-|\*|•)\s+/.test(line)) {
        const cleaned = line.replace(/^(\d+\.|\-|\*|•)\s+/, '').trim();
        if (cleaned.length > 10 && (cleaned.toLowerCase().includes('must') || cleaned.toLowerCase().includes('should') || cleaned.toLowerCase().includes('harus') || cleaned.toLowerCase().includes('return') || cleaned.toLowerCase().includes('support') || cleaned.toLowerCase().includes('validate'))) {
          criteria.push(cleaned);
        }
      }
    }
  }

  return criteria;
}

/**
 * Safe helper to execute Jira REST API requests with asUser() first and asApp() fallback.
 */
async function callJira(path) {
  try {
    const userRes = await api.asUser().requestJira(path);
    if (userRes.ok) return userRes;
  } catch (err) {
    console.warn(`asUser request failed for ${path}, falling back to asApp:`, err.message);
  }
  return await api.asApp().requestJira(path);
}

/**
 * Safe helper to execute Confluence REST API requests.
 */
async function callConfluence(path) {
  try {
    const userRes = await api.asUser().requestConfluence(path);
    if (userRes.ok) return userRes;
  } catch (err) {
    console.warn(`asUser request failed for Confluence ${path}, falling back to asApp:`, err.message);
  }
  return await api.asApp().requestConfluence(path);
}

/**
 * Tool 1: Get Jira Issue Context & Acceptance Criteria
 */
export async function getIssueContext(payload) {
  const issueKey = payload?.issueKey?.trim();
  if (!issueKey) {
    return { error: 'Missing required parameter: issueKey' };
  }

  try {
    const res = await callJira(
      route`/rest/api/3/issue/${issueKey}?fields=summary,description,status,priority,assignee,labels,issuelinks,subtasks`
    );

    if (!res.ok) {
      const errText = await res.text();
      return {
        error: `Jira API returned HTTP ${res.status}: ${res.statusText}`,
        details: errText
      };
    }

    const data = await res.json();
    const fields = data.fields || {};

    const rawDescription = extractTextFromAdf(fields.description);
    const criteria = extractAcceptanceCriteria(rawDescription);

    const linkedIssues = (fields.issuelinks || []).map((link) => {
      const linked = link.outwardIssue || link.inwardIssue;
      return linked
        ? {
            key: linked.key,
            summary: linked.fields?.summary || '',
            relationship: link.type?.name || 'related'
          }
        : null;
    }).filter(Boolean);

    return {
      success: true,
      issueKey: data.key,
      summary: fields.summary || '',
      status: fields.status?.name || 'Unknown',
      priority: fields.priority?.name || 'Normal',
      assignee: fields.assignee?.displayName || 'Unassigned',
      labels: fields.labels || [],
      descriptionText: rawDescription,
      acceptanceCriteria: criteria,
      criteriaCount: criteria.length,
      linkedIssues
    };
  } catch (err) {
    console.error('getIssueContext error:', err);
    return { error: `Internal error fetching issue context: ${err.message}` };
  }
}

/**
 * Tool 2: Search Confluence Knowledge Base for PRDs and Specifications
 */
export async function searchSpecsPrds(payload) {
  const query = payload?.query?.trim();
  if (!query) {
    return { error: 'Missing required parameter: query' };
  }

  try {
    const cql = encodeURIComponent(`text ~ "${query}"`);
    const res = await callConfluence(route`/wiki/rest/api/content/search?cql=${cql}&limit=5`);

    if (!res.ok) {
      const errText = await res.text();
      return {
        error: `Confluence API returned HTTP ${res.status}: ${res.statusText}`,
        details: errText
      };
    }

    const data = await res.json();
    const results = (data.results || []).map((item) => ({
      id: item.id,
      title: item.title,
      type: item.type,
      space: item.space?.name || item.space?.key || '',
      excerpt: item.excerpt?.replace(/<[^>]+>/g, '') || '',
      url: item._links?.webui ? `${item._links.base || ''}${item._links.webui}` : ''
    }));

    return {
      success: true,
      query,
      totalResults: results.length,
      pages: results
    };
  } catch (err) {
    console.error('searchSpecsPrds error:', err);
    return { error: `Internal error searching Confluence: ${err.message}` };
  }
}

/**
 * Tool 3: Audit Code Diff Against Jira Issue Acceptance Criteria
 */
export async function auditCodeSpec(payload) {
  const issueKey = payload?.issueKey?.trim();
  const codeDiff = payload?.codeDiff || '';

  if (!issueKey || !codeDiff) {
    return { error: 'Missing required parameters: issueKey and codeDiff are required' };
  }

  try {
    const issueContext = await getIssueContext({ issueKey });
    if (issueContext.error) {
      return { error: `Failed to load issue spec for audit: ${issueContext.error}` };
    }

    const criteria = issueContext.acceptanceCriteria || [];
    const diffLower = codeDiff.toLowerCase();

    const fulfilled = [];
    const missing = [];
    const securityRisks = [];

    // Analyze each criterion
    for (const criterion of criteria) {
      // Split criterion into significant keywords (>3 chars, ignoring stop words)
      const stopWords = new Set(['must', 'should', 'with', 'from', 'that', 'this', 'have', 'when', 'then', 'yang', 'untuk', 'pada', 'harus']);
      const words = criterion
        .toLowerCase()
        .replace(/[^a-z0-9\s_-]/g, ' ')
        .split(/\s+/)
        .filter((w) => w.length > 3 && !stopWords.has(w));

      if (words.length === 0) {
        fulfilled.push({ criterion, status: 'FULFILLED', note: 'Generic criterion validated' });
        continue;
      }

      // Calculate keyword match ratio in diff
      const matches = words.filter((w) => diffLower.includes(w));
      const matchRatio = matches.length / words.length;

      if (matchRatio >= 0.4 || matches.length >= 2) {
        fulfilled.push({
          criterion,
          status: 'FULFILLED',
          matchedKeywords: matches
        });
      } else {
        missing.push({
          criterion,
          status: 'MISSING',
          missingKeywords: words.filter((w) => !diffLower.includes(w)),
          recommendation: `Implement handling or test coverage for: "${criterion}"`
        });
      }
    }

    // Heuristic Security & Hygiene Checks
    if (/console\.log\(|print\(/.test(codeDiff) && !/debug/i.test(issueContext.summary)) {
      securityRisks.push('Debug logging statement detected in diff (possible sensitive data leak)');
    }
    if (/api_key\s*=|secret\s*=|password\s*=/i.test(codeDiff)) {
      securityRisks.push('Potential hardcoded credentials detected in diff');
    }
    if (codeDiff.includes('TODO') || codeDiff.includes('FIXME')) {
      securityRisks.push('Unfinished TODO/FIXME markers present in submitted code');
    }

    const totalCriteria = criteria.length;
    let complianceScore = 100;
    if (totalCriteria > 0) {
      complianceScore = Math.round((fulfilled.length / totalCriteria) * 100);
      if (securityRisks.length > 0) {
        complianceScore = Math.max(0, complianceScore - securityRisks.length * 10);
      }
    }

    let verdict = 'PASSED';
    if (complianceScore < 70 || securityRisks.length > 1) {
      verdict = 'BLOCKED';
    } else if (complianceScore < 100 || securityRisks.length > 0) {
      verdict = 'NEEDS_WORK';
    }

    return {
      success: true,
      issueKey,
      issueSummary: issueContext.summary,
      totalCriteria,
      fulfilledCount: fulfilled.length,
      missingCount: missing.length,
      complianceScore,
      verdict,
      fulfilledItems: fulfilled,
      missingItems: missing,
      securityRisks,
      summary: `SpecGuard Audit for ${issueKey}: ${verdict} (${complianceScore}%). ${fulfilled.length}/${totalCriteria} criteria satisfied. ${missing.length} missing items.`
    };
  } catch (err) {
    console.error('auditCodeSpec error:', err);
    return { error: `Internal error auditing code: ${err.message}` };
  }
}

/**
 * Tool 4: Record Spec Audit Verdict and Report into Jira Issue Comments
 */
export async function recordSpecAudit(payload) {
  const issueKey = payload?.issueKey?.trim();
  const verdict = payload?.verdict || 'NEEDS_WORK';
  const summary = payload?.summary || 'Audit report submitted by SpecGuard';
  const score = typeof payload?.complianceScore === 'number' ? payload.complianceScore : 0;

  if (!issueKey) {
    return { error: 'Missing required parameter: issueKey' };
  }

  try {
    const verdictColor = verdict === 'PASSED' ? '#00875A' : verdict === 'BLOCKED' ? '#DE350B' : '#FF991F';

    // Construct clean ADF document
    const commentAdf = {
      type: 'doc',
      version: 1,
      content: [
        {
          type: 'heading',
          attrs: { level: 3 },
          content: [
            { type: 'text', text: `🛡️ SpecGuard Audit Report: ` },
            {
              type: 'text',
              text: `[${verdict}]`,
              marks: [{ type: 'strong' }, { type: 'textColor', attrs: { color: verdictColor } }]
            }
          ]
        },
        {
          type: 'paragraph',
          content: [
            { type: 'text', text: 'Spec Compliance Score: ' },
            { type: 'text', text: `${score}%`, marks: [{ type: 'strong' }] }
          ]
        },
        {
          type: 'paragraph',
          content: [
            { type: 'text', text: summary }
          ]
        },
        {
          type: 'paragraph',
          content: [
            {
              type: 'text',
              text: '— Verified autonomously by CodeContext SpecGuard (Atlassian Forge + Rovo AI Engine)',
              marks: [{ type: 'em' }]
            }
          ]
        }
      ]
    };

    const res = await callJira(
      route`/rest/api/3/issue/${issueKey}/comment`,
      {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ body: commentAdf })
      }
    );

    if (!res.ok) {
      const errText = await res.text();
      return {
        error: `Jira API returned HTTP ${res.status} posting comment: ${res.statusText}`,
        details: errText
      };
    }

    const data = await res.json();
    return {
      success: true,
      issueKey,
      commentId: data.id,
      postedAt: data.created,
      message: `Audit report successfully posted to ${issueKey}`
    };
  } catch (err) {
    console.error('recordSpecAudit error:', err);
    return { error: `Internal error recording audit: ${err.message}` };
  }
}

/**
 * Tool 5: Get Sprint Spec Digest for an entire project/sprint
 */
export async function getSprintSpecDigest(payload) {
  const projectKey = payload?.projectKey?.trim();
  if (!projectKey) {
    return { error: 'Missing required parameter: projectKey' };
  }

  try {
    const jql = encodeURIComponent(`project = "${projectKey}" AND statusCategory != Done ORDER BY priority DESC`);
    const res = await callJira(
      route`/rest/api/3/search?jql=${jql}&maxResults=10&fields=summary,status,priority,assignee,description`
    );

    if (!res.ok) {
      const errText = await res.text();
      return {
        error: `Jira API returned HTTP ${res.status}: ${res.statusText}`,
        details: errText
      };
    }

    const data = await res.json();
    const issues = (data.issues || []).map((issue) => {
      const desc = extractTextFromAdf(issue.fields?.description);
      const criteria = extractAcceptanceCriteria(desc);
      return {
        key: issue.key,
        summary: issue.fields?.summary || '',
        status: issue.fields?.status?.name || '',
        priority: issue.fields?.priority?.name || '',
        assignee: issue.fields?.assignee?.displayName || 'Unassigned',
        criteriaCount: criteria.length,
        pendingCriteria: criteria
      };
    });

    const totalCriteria = issues.reduce((acc, i) => acc + i.criteriaCount, 0);

    return {
      success: true,
      projectKey,
      openIssuesCount: issues.length,
      totalPendingCriteria: totalCriteria,
      issues
    };
  } catch (err) {
    console.error('getSprintSpecDigest error:', err);
    return { error: `Internal error fetching sprint digest: ${err.message}` };
  }
}
