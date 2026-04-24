# Security documentation

Operational and SOC-2-relevant security policies and procedures.

## Index

- [Access Control Policy](access-control.md) — roles, provisioning/deprovisioning, 2FA, quarterly review
- [BCDR](bcdr.md) — business continuity and disaster recovery scenarios + RTO/RPO
- [Change Management](change-management.md) — git flow, CI gates, migration workflow, rollback
- [Data Classification](data-classification.md) — L1-L4 tiers and per-tier controls
- [Data Retention](data-retention.md) — retention windows and GDPR Article 15/17 handling
- [Incident Response](incident-response.md) — severity tiers + playbooks
- [OWASP Top 10 Matrix](owasp-top-10.md) — per-category control mapping to code + residual gaps
- [Risk Assessment](risk-assessment.md) — 20-item risk register with likelihood × impact scoring
- [Rotation Schedule](rotation-schedule.md) — secret-rotation cadence and procedure
- [Threat Model](threat-model.md) — STRIDE-lite pass over every major flow
- [Vendor Risk Assessment](vendor-risk.md) — SaaS vendor criticality + exit plans

See also in the parent `docs/`:

- [Adversarial Probes](../adversarial-probes.md) — browser-console runtime verification of RLS + paywall trigger
- [AI Spend Cap Activation](../ai-spend-cap-activation.md) — kill-switch setup
- [Stripe Restricted-Key Setup](../stripe-restricted-key-setup.md) — API-key rotation procedure

## Review cadence summary

| Document | Cadence |
|---|---|
| Access Control | Quarterly |
| BCDR | Annual + on vendor change |
| Change Management | Annual |
| Data Classification | Annual |
| Data Retention | Annual |
| Incident Response | Annual + after every Sev-1/2 |
| Risk Assessment | Quarterly |
| Rotation Schedule | Whenever a rotation happens |
| Threat Model | Quarterly + on new flow |
| Vendor Risk | Annual (biannual for critical vendors) |
