import React, { useEffect, useState } from 'react';
import { shopifyFetch, GET_CUSTOMER_ORDERS } from './lib/shopify';
import './Account.css';

const Account = ({ user }) => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      if (!user?.shopify_token) return;

      try {
        const response = await shopifyFetch(GET_CUSTOMER_ORDERS, {
          customerAccessToken: user.shopify_token
        });

        const orderData = response?.data?.customer?.orders?.edges || [];
        setOrders(orderData.map(edge => edge.node));
      } catch (err) {
        console.error("Error fetching orders:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [user]);

  if (!user) return <div className="account-empty">Please login to view your orders.</div>;

  return (
    <div className="account-container">
      <header className="account-header">
        <h1>MY STUDIO ACCOUNT</h1>
        <p className="user-email">{user.email}</p>
      </header>

      <section className="order-history">
        <h3>ORDER HISTORY</h3>
        {loading ? (
          <p>Fetching your records...</p>
        ) : orders.length === 0 ? (
          <p className="no-orders">You haven't placed any orders yet.</p>
        ) : (
          <div className="orders-list">
            {orders.map((order) => (
              <div key={order.id} className="order-card">
                <div className="order-main-info">
                  <span className="order-number">ORDER #{order.orderNumber}</span>
                  <span className="order-date">{new Date(order.processedAt).toLocaleDateString()}</span>
                </div>

                <div className="order-items">
                  {order.lineItems.edges.map((item, idx) => (
                    <div key={idx} className="order-item-thumb">
                      <img src={item.node.variant?.image?.url} alt={item.node.title} />
                      <span className="item-qty">x{item.node.quantity}</span>
                    </div>
                  ))}
                </div>

                <div className="order-status-row">
                  <span className={`status-pill ${order.fulfillmentStatus.toLowerCase()}`}>
                    {order.fulfillmentStatus}
                  </span>
                  <span className="order-total">
                    {Number(order.totalPriceV2.amount).toLocaleString()} {order.totalPriceV2.currencyCode}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default Account;