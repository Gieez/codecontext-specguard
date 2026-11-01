import ResolverPackage from '@forge/resolver';
import { getIssueContext, auditCodeSpec, recordSpecAudit } from '../index.js';

const Resolver = typeof ResolverPackage === 'function' ? ResolverPackage : (ResolverPackage.default || ResolverPackage);
const resolver = new Resolver();

// Fetches live issue context and criteria for the current Jira issue
resolver.define('getIssueSpec', async (req) => {
  console.log('getIssueSpec called with req:', JSON.stringify({ payload: req.payload, context: req.context }));

  const issueKey =
    req.payload?.issueKey ||
    req.context?.extension?.issue?.key ||
    req.context?.issue?.key ||
    req.context?.extension?.issueKey ||
    req.context?.extension?.issue?.id;

  if (!issueKey) {
    console.error('No issue key found in payload or context:', req);
    return { error: 'No issue key detected in context' };
  }

  console.log(`Resolving spec context for issueKey: ${issueKey}`);
  const result = await getIssueContext({ issueKey });
  console.log(`getIssueContext result: success=${result.success}, criteriaCount=${result.criteriaCount}`);
  return result;
});

// Runs a code spec audit against the issue criteria
resolver.define('runSpecAudit', async (req) => {
  const issueKey =
    req.payload?.issueKey ||
    req.context?.extension?.issue?.key ||
    req.context?.issue?.key;
  const codeDiff = req.payload?.codeDiff || '';

  if (!issueKey) {
    return { error: 'Missing issueKey for audit' };
  }
  return await auditCodeSpec({ issueKey, codeDiff });
});

// Publishes audit results as an official Jira issue comment
resolver.define('publishAudit', async (req) => {
  const issueKey =
    req.payload?.issueKey ||
    req.context?.extension?.issue?.key ||
    req.context?.issue?.key;
  const verdict = req.payload?.verdict;
  const summary = req.payload?.summary;
  const complianceScore = req.payload?.complianceScore;

  return await recordSpecAudit({ issueKey, verdict, summary, complianceScore });
});

export const handler = resolver.getDefinitions();
