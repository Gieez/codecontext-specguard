import React, { useEffect, useState } from 'react';
import ForgeReconciler, {
  Box,
  Stack,
  Inline,
  Heading,
  Text,
  Strong,
  Em,
  Badge,
  Lozenge,
  Button,
  ButtonGroup,
  LoadingButton,
  TextArea,
  ProgressBar,
  SectionMessage,
  Tag,
  TagGroup,
  Spinner
} from '@forge/react';
import { invoke, view } from '@forge/bridge';

const App = () => {
  const [loading, setLoading] = useState(true);
  const [issueData, setIssueData] = useState(null);
  const [diffInput, setDiffInput] = useState('');
  const [auditing, setAuditing] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [auditResult, setAuditResult] = useState(null);
  const [statusMessage, setStatusMessage] = useState(null);
  const [currentIssueKey, setCurrentIssueKey] = useState('');

  // Load issue criteria on mount
  useEffect(() => {
    loadIssueSpec();
  }, []);

  const loadIssueSpec = async () => {
    setLoading(true);
    setStatusMessage(null);
    try {
      let key = '';
      try {
        const ctx = await view.getContext();
        key = ctx?.extension?.issue?.key || ctx?.issue?.key || '';
        if (key) setCurrentIssueKey(key);
      } catch (e) {
        console.warn('Could not read view.getContext():', e);
      }

      const res = await invoke('getIssueSpec', { issueKey: key });
      if (res && res.success) {
        setIssueData(res);
        if (res.issueKey) setCurrentIssueKey(res.issueKey);
      } else {
        setStatusMessage({ type: 'error', text: res?.error || 'Failed to load issue spec' });
      }
    } catch (err) {
      setStatusMessage({ type: 'error', text: err.message });
    } finally {
      setLoading(false);
    }
  };

  const handleRunAudit = async () => {
    if (!diffInput.trim()) {
      setStatusMessage({ type: 'warning', text: 'Paste a git diff or commit summary to run audit' });
      return;
    }
    setAuditing(true);
    setStatusMessage(null);
    try {
      const res = await invoke('runSpecAudit', {
        issueKey: currentIssueKey,
        codeDiff: diffInput
      });
      if (res && res.success) {
        setAuditResult(res);
        setStatusMessage({ type: 'success', text: `Audit completed: ${res.verdict} (${res.complianceScore}%)` });
      } else {
        setStatusMessage({ type: 'error', text: res?.error || 'Audit failed' });
      }
    } catch (err) {
      setStatusMessage({ type: 'error', text: err.message });
    } finally {
      setAuditing(false);
    }
  };

  const handlePublishComment = async () => {
    if (!auditResult) return;
    setPublishing(true);
    try {
      const res = await invoke('publishAudit', {
        issueKey: currentIssueKey,
        verdict: auditResult.verdict,
        summary: auditResult.summary,
        complianceScore: auditResult.complianceScore
      });
      if (res && res.success) {
        setStatusMessage({ type: 'success', text: 'Audit verdict published to Jira issue comments!' });
      } else {
        setStatusMessage({ type: 'error', text: res?.error || 'Failed to post comment' });
      }
    } catch (err) {
      setStatusMessage({ type: 'error', text: err.message });
    } finally {
      setPublishing(false);
    }
  };

  if (loading) {
    return (
      <Box padding="space.200">
        <Inline alignBlock="center" space="space.100">
          <Spinner size="medium" />
          <Text>Loading SpecGuard context...</Text>
        </Inline>
      </Box>
    );
  }

  const criteriaList = issueData?.acceptanceCriteria || [];
  const verdictAppearance = auditResult?.verdict === 'PASSED' ? 'success' : auditResult?.verdict === 'BLOCKED' ? 'removed' : 'moved';

  return (
    <Box padding="space.200">
      <Stack space="space.200">
        {/* Header Banner */}
        <Inline spread="space-between" alignBlock="center">
          <Inline space="space.100" alignBlock="center">
            <Heading size="medium">🛡️ SpecGuard Sentinel</Heading>
            <Lozenge appearance="inprogress">Rovo + MCP Live</Lozenge>
          </Inline>
          {auditResult && (
            <Lozenge appearance={verdictAppearance}>
              {auditResult.verdict} ({auditResult.complianceScore}%)
            </Lozenge>
          )}
        </Inline>

        {statusMessage && (
          <SectionMessage appearance={statusMessage.type === 'error' ? 'error' : statusMessage.type === 'success' ? 'confirmation' : 'warning'}>
            <Text>{statusMessage.text}</Text>
          </SectionMessage>
        )}

        {/* Acceptance Criteria Section */}
        <Box backgroundColor="color.background.neutral.subtle" padding="space.150">
          <Stack space="space.100">
            <Inline spread="space-between" alignBlock="center">
              <Text><Strong>Active Acceptance Criteria ({criteriaList.length})</Strong></Text>
              <Badge appearance="primary">{issueData?.priority || 'Normal'}</Badge>
            </Inline>

            {criteriaList.length === 0 ? (
              <Text><Em>No explicit criteria found in description. SpecGuard will infer from task summary.</Em></Text>
            ) : (
              criteriaList.map((crit, idx) => (
                <Inline key={idx} space="space.100" alignBlock="start">
                  <Text>📌</Text>
                  <Text>{crit}</Text>
                </Inline>
              ))
            )}
          </Stack>
        </Box>

        {/* Audit Diff Input Area */}
        <Stack space="space.100">
          <Text><Strong>Audit Code Diff / Pull Request:</Strong></Text>
          <TextArea
            placeholder="Paste git diff, commit changes, or PR implementation summary here..."
            value={diffInput}
            onChange={(e) => setDiffInput(e.target.value)}
          />
          <ButtonGroup>
            <LoadingButton
              appearance="primary"
              isLoading={auditing}
              onClick={handleRunAudit}
            >
              Verify Spec Compliance
            </LoadingButton>
            {auditResult && (
              <LoadingButton
                appearance="subtle"
                isLoading={publishing}
                onClick={handlePublishComment}
              >
                Publish to Jira Comments
              </LoadingButton>
            )}
          </ButtonGroup>
        </Stack>

        {/* Audit Results Visualization */}
        {auditResult && (
          <Box backgroundColor="color.background.neutral.subtle" padding="space.150">
            <Stack space="space.150">
              <Inline spread="space-between" alignBlock="center">
                <Text><Strong>Compliance Analysis</Strong></Text>
                <Text>{auditResult.fulfilledCount} / {auditResult.totalCriteria} Criteria Met</Text>
              </Inline>

              <ProgressBar value={auditResult.complianceScore / 100} />

              {auditResult.missingItems?.length > 0 && (
                <Stack space="space.050">
                  <Text><Strong>Missing Requirements:</Strong></Text>
                  {auditResult.missingItems.map((item, i) => (
                    <Text key={i}>⚠️ {item.criterion}</Text>
                  ))}
                </Stack>
              )}

              {auditResult.securityRisks?.length > 0 && (
                <SectionMessage appearance="warning">
                  <Text><Strong>Code Hygiene / Security Alerts:</Strong></Text>
                  {auditResult.securityRisks.map((risk, i) => (
                    <Text key={i}>• {risk}</Text>
                  ))}
                </SectionMessage>
              )}
            </Stack>
          </Box>
        )}

        {/* Footer info */}
        <Inline spread="space-between" alignBlock="center">
          <Text><Em>Exposed via Atlassian MCP to IDEs & Rovo Agent</Em></Text>
          <TagGroup>
            <Tag text="MCP 2026" />
            <Tag text="Forge Node24" />
          </TagGroup>
        </Inline>
      </Stack>
    </Box>
  );
};

ForgeReconciler.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
