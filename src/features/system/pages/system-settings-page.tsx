export function SystemSettingsPage() {
  return (
    <section className="page-card">
      <h2 className="section-title">System Settings</h2>
      <p className="helper">Configure application-level controls such as notifications, security policies, and integrations.</p>
      <div className="form-grid" style={{ marginTop: '16px' }}>
        <p className="helper">System-level toggles and policies will be managed from this section.</p>
        <p className="helper">Connection diagnostics are available under the dedicated Connection Check tab.</p>
      </div>
    </section>
  );
}
