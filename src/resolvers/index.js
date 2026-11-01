import Resolver from '@forge/resolver';
import { getIssueContext, auditCodeSpec, recordSpecAudit } from '../index.js';

const resolver = new Resolver();

// Fetches live issue context and criteria for the current Jira issue
resolver.define('getIssueSpec', async (req) => {
  const issueKey = req.payload?.issueKey || req.context?.extension?.issue?.key;
  if (!issueKey) {
    return { error: 'No issue key detected in context' };
  }
  return await getIssueContext({ issueKey });
});

// Runs a code spec audit against the issue criteria
resolver.define('runSpecAudit', async (req) => {
  const issueKey = req.payload?.issueKey || req.context?.extension?.issue?.key;
  const codeDiff = req.payload?.codeDiff || '';
  if (!issueKey) {
    return { error: 'Missing issueKey' };
  }
  return await auditCodeSpec({ issueKey, codeDiff });
});

// Publishes audit results as an official Jira issue comment
resolver.define('publishAudit', async (req) => {
  const issueKey = req.payload?.issueKey || req.context?.extension?.issue?.key;
  const verdict = req.payload?.verdict;
  const summary = req.payload?.summary;
  const complianceScore = req.payload?.complianceScore;
  return await recordSpecAudit({ issueKey, verdict, summary, complianceScore });
});

export const handler = resolver.getDefinitions();
