import React, { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';
import './Account.css';

const Account = ({ user }) => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      if (!user?.id) return;

      try {
        // Fetching from your local Supabase sync instead of Shopify API
        const { data, error } = await supabase
          .from('orders')
          .select(`
            *,
            order_items (*)
          `)
          .eq('user_id', user.id)
          .order('order_date', { ascending: false });

        if (error) throw error;
        setOrders(data || []);
      } catch (err) {
        console.error("Studio Sync Error:", err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [user]);

  if (!user) {
    return (
      <div className="account-empty-state">
        <h1 className="anton-title">ACCESS DENIED</h1>
        <p>PLEASE LOGIN TO VIEW YOUR STUDIO HISTORY.</p>
      </div>
    );
  }

  return (
    <div className="account-wrapper">
      <div className="account-container">
        <header className="account-header">
          <span className="pdp-collection-tag">CLIENT PORTAL // 2026</span>
          <h1 className="pdp-title-main">MY STUDIO ACCOUNT</h1>
          <p className="user-email-sub">{user.email}</p>
        </header>

        <section className="order-history-section">
          <h2 className="pdp-section-heading">ARCHIVED ORDERS</h2>

          {loading ? (
            <p className="loading-text">RETRIEVING YOUR SETS...</p>
          ) : orders.length === 0 ? (
            <div className="no-orders-box">
              <p>YOUR COLLECTION IS CURRENTLY EMPTY.</p>
              <button className="pdp-btn-primary" onClick={() => window.location.href='/shop'}>
                START A COLLECTION
              </button>
            </div>
          ) : (
            <div className="orders-gallery">
              {orders.map((order) => (
                <div key={order.id} className="order-editorial-card">
                  <div className="order-card-header">
                    <span className="order-ref">ID: {(order.shopify_order_id || '0000').split('.').pop()}</span>
                    <span className="order-timestamp">
                      {new Date(order.order_date).toLocaleDateString('en-GB', {
                        day: '2-digit', month: 'short', year: 'numeric'
                      })}
                    </span>
                  </div>

                  <div className="order-items-row">
                    {order.order_items?.map((item) => (
                      <div key={item.id} className="order-item-look">
                        <div className="item-thumb-frame">
                          <img src={item.image_url} alt={item.name} />
                          <span className="item-count">{item.quantity}</span>
                        </div>
                        <div className="item-mini-meta">
                          <span className="item-name">{item.name}</span>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="order-status-footer">
                    <div className="status-group">
                      <span className={`status-dot ${(order.fulfillment_status || 'unfulfilled').toLowerCase()}`}>•</span>
                      <span className="status-text">{order.fulfillment_status.toUpperCase()}</span>
                    </div>
                    <span className="order-value">
                      THB {Number(order.total_price).toLocaleString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default Account;