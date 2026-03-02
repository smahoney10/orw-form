export default function TabNavigation({ activeTab, onTabChange, validationCounts }) {
  const tabs = [
    { id: 'attestations', label: 'CMS Attestations', icon: '📋' },
    { id: 'definitions', label: 'Metric Definitions', icon: '📐' },
    { id: 'data', label: 'Metric Data', icon: '📊' },
  ];

  return (
    <nav className="tab-navigation">
      {tabs.map((tab) => {
        const count = validationCounts[tab.id];
        return (
          <button
            key={tab.id}
            className={`tab-button ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => onTabChange(tab.id)}
          >
            <span className="tab-icon">{tab.icon}</span>
            <span className="tab-label">{tab.label}</span>
            {count !== undefined && count.total > 0 && (
              <span
                className={`tab-badge ${count.complete === count.total ? 'badge-complete' : 'badge-incomplete'}`}
              >
                {count.complete}/{count.total}
              </span>
            )}
          </button>
        );
      })}
    </nav>
  );
}
