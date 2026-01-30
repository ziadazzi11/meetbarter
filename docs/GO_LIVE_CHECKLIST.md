# Meetbarter: Go-Live Checklist

A non-negotiable list of requirements for transitioning from Development to Production.

---

## 🏗️ 1. Infrastructure & Environment

- [x] **Database Migration**: Switch from SQLite to PostgreSQL (Scale & Concurrency).
- [ ] **Handshake State Persistence**: Migrate `ProtocolShapingService` from in-memory to Redis.
- [ ] **Secret Management**:
  - [ ] Rotate `JWT_SECRET` (Prod-only).
  - [ ] Rotate `VAULT_ENCRYPTION_KEY` (Prod-only).
  - [ ] Securely store Alpha/Beta/Roger codes in hardware vault or managed secrets.
- [ ] **Reverse Proxy**: Setup Nginx/Caddy with TLS 1.3 and HSTS enabled.
- [ ] **Backups**: Automated nightly snapshots of `data/` and `data/vault/`.

## 🛡️ 2. Security & Defense (ADS)

- [ ] **Path Rotation**: Automate deceptive API route changes (e.g., handshake route).
- [ ] **Frontend Hardening**: Implement build-time symbol stripping and JS obfuscation.
- [ ] **Forensic Integrity**: Verify that `AuditLog` hash chaining is active and non-repudiable.
- [ ] **Load Testing**: Stress test the Risk Engine and Signal Ingestion under load.

## 🏛️ 3. Institutional & Legal

- [ ] **Finalize Bylaws**: Complete the [NGO Bylaws](file:///c:/Users/ziada/OneDrive/Desktop/meetbarter/institutions/NGO_BYLAWS.md) (Draft -> Final).
- [ ] **Founder's Resolution**: Sign and store the formal technical delegation.
- [ ] **Data Custody Protocol**: Formalize the PII protection agreement.
- [ ] **Board Onboarding**: Verify the Foundation Board members are briefed on Disaster Recovery.

## 📖 4. Strategic Documentation

- [ ] **Public Whitepaper**: Release the user-safe (GREEN layer) vision document.
- [ ] **Economic Guide**: Finalize the "How to Barter" and "VP System" manual.
- [ ] **Governance Portal**: Launch the UI for community transparency (Term limits, voting).

## 🚀 5. Operational Health

- [ ] **Monitoring**: Deploy Sentry/Prometheus for real-time error tracking.
- [ ] **Succession Test**: Mock a "Founder Absence" event to verify heir activation logic.
- [ ] **CI/CD**: Setup zero-downtime deployment pipelines.

---
**Status**: 🔴 UNAUTHORIZED FOR ONLINE STATUS
**Next Action**: Prioritize Category 1 & 2 for technical stability.
