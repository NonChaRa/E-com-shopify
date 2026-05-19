import React, { useState } from 'react';
import './CartSidebar.css';
import { shopifyFetch } from './lib/shopify'; // Ensure path is correct based on your folder structure
import { CREATE_CART_MUTATION, CART_BUYER_IDENTITY_UPDATE } from './lib/queries';

const CartSidebar = ({ isOpen, onClose, cart, onRemove, updateQuantity, user }) => {
  const [isSyncing, setIsSyncing] = useState(false);
  const subtotal = cart.reduce((acc, item) => acc + (item.price * (item.quantity || 1)), 0);
  const hasPreorder = cart.some(item => item.stock <= 0 && item.available);

  const handleCheckout = async () => {
      if (cart.length === 0) return;
      setIsSyncing(true);

      try {
        const lines = cart.map(item => {
          const isPreorder = item.stock <= 0 && item.available;
          return {
            merchandiseId: item.variantId,
            quantity: item.quantity,
            attributes: isPreorder ? [
              { key: "Status", value: "Pre-order" },
              { key: "Estimate", value: "Ships in 3-4 days" }
            ] : []
          };
        });

        const response = await shopifyFetch(CREATE_CART_MUTATION, {
          input: { lines }
        });

        const { id: newCartId, checkoutUrl } = response.data.cartCreate.cart;

        if (user?.shopify_token) {
          await shopifyFetch(CART_BUYER_IDENTITY_UPDATE, {
            cartId: newCartId,
            buyerIdentity: { customerAccessToken: user.shopify_token }
          });
        }
        localStorage.setItem('shopify_cart_id', newCartId);
        localStorage.setItem('shopify_checkout_url', checkoutUrl);

        if (checkoutUrl) {
          window.location.href = checkoutUrl;
        }
      } catch (err) {
        console.error("Checkout Error:", err);
        alert("Checkout failed. Please try again.");
      } finally {
        setIsSyncing(false);
      }
    };

  return (
    <div className={`cart-overlay ${isOpen ? 'active' : ''}`} onClick={onClose}>
      <div className="cart-sidebar-content" onClick={(e) => e.stopPropagation()}>
        <div className="cart-header">
          <h2 className="cart-title">Your cart <span className="cart-count-sup">{cart.length}</span></h2>
          <button className="close-btn" onClick={onClose}>✕</button>
        </div>

        <div className="cart-items-list">
          {cart.length === 0 ? (
            <p className="empty-msg">Your cart is currently empty.</p>
          ) : (
            cart.map((item) => {
              // --- NEW LOGIC: Identify if this specific variant is a pre-order ---
              const isPreorder = item.stock <= 0 && item.available;

              return (
                <div className="cart-item-row" key={item.cartId}>
                  <div className="item-image-col">
                    <img src={item.image_url} alt={item.name} />
                  </div>
                  <div className="item-details-col">
                    <div className="item-header-row">
                      <div>
                        <h3 className="item-name">{item.name}</h3>
                        {isPreorder && <span className="cart-preorder-tag">PRE-ORDER</span>}
                      </div>
                      <span className="item-price">THB {Number(item.price * item.quantity).toLocaleString()}</span>
                    </div>

                    <p className="item-variant">Size: {item.selectedSize}</p>

                    <div className="item-actions-row">
                      <div className="quantity-selector">
                        <button onClick={() => updateQuantity(item.cartId, -1)}>−</button>
                        <input type="text" value={item.quantity} readOnly />
                        <button
                          onClick={() => updateQuantity(item.cartId, 1)}
                          disabled={item.stock <= 0 && item.quantity >= 5}
                        >
                          +
                        </button>
                      </div>
                      <button className="trash-btn" onClick={() => onRemove(item.cartId)}>REMOVE</button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        <div className="cart-footer">
          {hasPreorder && (
              <p className="mixed-cart-notice">
                ◈ Your order contains pre-order items. The entire shipment will be dispatched once all sets are ready (est. 3-4 days).
              </p>
          )}
          <div className="subtotal-row">
            <span className="label">Subtotal</span>
            <span className="amount">THB {subtotal.toLocaleString()}</span>
          </div>
          <p className="tax-disclaimer">Taxes included. Shipping calculated at checkout.</p>
          <div className="cart-actions">
            <button className="secondary-btn" onClick={onClose}>CONTINUE SHOPPING</button>
            <button
                  className="primary-btn"
                  onClick={handleCheckout}
                  disabled={isSyncing || cart.length === 0}
                >
                  {isSyncing ? 'PREPARING STUDIO CHECKOUT...' : 'CHECKOUT'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartSidebar;