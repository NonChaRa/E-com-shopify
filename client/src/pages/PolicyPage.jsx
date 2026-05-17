import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { fetchShopPolicies } from '../components/lib/shopify';
import './PolicyPage.css'; // Create this file for your typographic choices

const PolicyPage = () => {
  const { policyType } = useParams(); // Catches 'shipping', 'refund', or 'privacy'
  const [policyData, setPolicyData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadPolicy = async () => {
      setLoading(true);
      const shopData = await fetchShopPolicies();

      if (shopData) {
        // Match the URL param to the specific Shopify policy node
        if (policyType === 'privacy') setPolicyData(shopData.privacyPolicy);
        if (policyType === 'shipping') setPolicyData(shopData.shippingPolicy);
        if (policyType === 'refund') setPolicyData(shopData.refundPolicy);
      }
      setLoading(false);
    };

    loadPolicy();
    window.scrollTo(0, 0);
  }, [policyType]);

  if (loading) {
    return <div className="pdp-loading-state">RETRIEVING STUDIO LEGAL DOCUMENTATION...</div>;
  }

  // Fallback state if the specific policy is empty or unset in Shopify Admin
  if (!policyData || !policyData.body) {
    return (
      <div className="policy-wrapper">
        <header className="shop-header-minimal">
          <h1 className="shop-main-title">{policyType?.toUpperCase()} POLICY</h1>
        </header>
      </div>
    );
  }

  return (
    <div className="policy-wrapper">
      <header className="shop-header-minimal">
        <h1 className="shop-main-title">{policyData.title.toUpperCase()}</h1>
      </header>

      <main className="policy-content-area">
        {/* Shopify delivers legal bodies as formatting-safe HTML strings.
          Using dangerouslySetInnerHTML ensures structural paragraphs render flawlessly.
        */}
        <div
          className="policy-editorial-body"
          dangerouslySetInnerHTML={{ __html: policyData.body }}
        />
      </main>
    </div>
  );
};

export default PolicyPage;