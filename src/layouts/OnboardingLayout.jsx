import { Outlet } from 'react-router-dom';

/**
 * OnboardingLayout provides a minimal context for the OnboardingWizard
 * when it's accessed outside of the main AdminLayout (e.g., right after signup).
 */
export default function OnboardingLayout() {
    return (
        <div className="onboarding-layout" style={{ minHeight: '100vh', background: '#0d0c1a' }}>
            <main>
                {/* 
                  We provide an empty businesses array and a no-op refresh function 
                  to satisfy the useOutletContext() call in OnboardingWizard.
                */}
                <Outlet context={{ businesses: [], refreshBusinesses: async () => {} }} />
            </main>
        </div>
    );
}
