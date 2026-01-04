import React from 'react';
import { db, auth } from './firebase';
import { doc, updateDoc, increment } from 'firebase/firestore';

const PlansPage = ({ userProfile, setUserProfile }) => {
    const plans = [
        {
            id: 'trial',
            name: 'Trial Plan',
            price: 'Free',
            credits: 10,
            features: ['Basic Lead Gen', '1 Campaign', 'Email Support']
        },
        {
            id: 'monthly',
            name: 'Professional',
            price: '₹2,000 /mo',
            credits: 500,
            features: ['Unlimited Leads', '5 Campaigns', 'Priority Support']
        },
        {
            id: 'annual',
            name: 'Enterprise',
            price: '₹10,000 /yr',
            credits: 3000,
            features: ['All Features', 'Unlimited Campaigns', '24/7 Dedicated Support']
        }
    ];

    const handleSelectPlan = async (plan) => {
        if (plan.id === 'trial' && userProfile.plan === 'trial') {
            alert("You are already on the Trial plan.");
            return;
        }

        try {
            const userRef = doc(db, 'users', auth.currentUser.uid);
            await updateDoc(userRef, {
                plan: plan.id,
                credits: increment(plan.credits)
            });
            setUserProfile(prev => ({
                ...prev,
                plan: plan.id,
                credits: (prev.credits || 0) + plan.credits
            }));
            alert(`Successfully upgraded to ${plan.name}!`);
        } catch (error) {
            alert("Error upgrading plan: " + error.message);
        }
    };

    return (
        <div style={{ padding: '4rem 2rem', maxWidth: '1000px', margin: '0 auto', textAlign: 'center' }}>
            <h1 style={{ fontSize: '2.5rem', marginBottom: '1rem', color: '#1e3a8a' }}>Choose Your Plan</h1>
            <p style={{ color: '#64748b', marginBottom: '3rem' }}>Unlock more credits and scale your automation.</p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '2rem' }}>
                {plans.map(plan => (
                    <div key={plan.id} style={{
                        padding: '2rem',
                        border: plan.id === userProfile.plan ? '2px solid #2563eb' : '1px solid #e2e8f0',
                        borderRadius: '20px',
                        background: 'white',
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                        display: 'flex',
                        flexDirection: 'column'
                    }}>
                        <h3 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>{plan.name}</h3>
                        <p style={{ fontSize: '2rem', fontWeight: 800, color: '#2563eb', marginBottom: '1.5rem' }}>{plan.price}</p>
                        <p style={{ fontWeight: 600, color: '#10b981', marginBottom: '1.5rem' }}>{plan.credits} Credits</p>

                        <ul style={{ listStyle: 'none', padding: 0, textAlign: 'left', marginBottom: '2rem', flex: 1 }}>
                            {plan.features.map(f => (
                                <li key={f} style={{ marginBottom: '0.75rem', color: '#475569' }}>✓ {f}</li>
                            ))}
                        </ul>

                        <button
                            onClick={() => handleSelectPlan(plan)}
                            disabled={plan.id === userProfile.plan}
                            style={{
                                padding: '1rem',
                                background: plan.id === userProfile.plan ? '#f1f5f9' : '#2563eb',
                                color: plan.id === userProfile.plan ? '#94a3b8' : 'white',
                                border: 'none',
                                borderRadius: '12px',
                                fontWeight: 700,
                                cursor: plan.id === userProfile.plan ? 'default' : 'pointer'
                            }}
                        >
                            {plan.id === userProfile.plan ? 'Current Plan' : 'Select Plan'}
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default PlansPage;
