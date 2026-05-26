/* @refresh reset */
import React, { createContext, useContext, useState, useEffect } from 'react';
import { CURRENCIES } from './currencies';

const FALLBACK_RATES = {
  THB: 1,
  USD: 0.0278,
  AUD: 0.0432,
  CNY: 0.2015,
  KRW: 37.80,
  JPY: 4.15,
};

const CACHE_KEY = 'asteri_fx_rates';
const CACHE_TS  = 'asteri_fx_rates_ts';
const CACHE_TTL = 6 * 60 * 60 * 1000; // 6 hours

const CurrencyContext = createContext(null);

export const CurrencyProvider = ({ children }) => {
  const [currency, setCurrencyState] = useState(
    () => localStorage.getItem('asteri_currency') || 'THB'
  );
  const [rates, setRates] = useState(FALLBACK_RATES);
  const [ratesLoaded, setRatesLoaded] = useState(false);

  useEffect(() => {
    const load = async () => {
      const cached   = localStorage.getItem(CACHE_KEY);
      const cachedTs = parseInt(localStorage.getItem(CACHE_TS) || '0', 10);

      if (cached && Date.now() - cachedTs < CACHE_TTL) {
        setRates(JSON.parse(cached));
        setRatesLoaded(true);
        return;
      }

      try {
        const res  = await fetch(
          'https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@latest/v1/currencies/thb.json'
        );
        const data = await res.json();
        const r    = data.thb;

        const fresh = {
          THB: 1,
          USD: r.usd,
          AUD: r.aud,
          CNY: r.cny,
          KRW: r.krw,
          JPY: r.jpy,
        };

        setRates(fresh);
        localStorage.setItem(CACHE_KEY, JSON.stringify(fresh));
        localStorage.setItem(CACHE_TS, Date.now().toString());
      } catch {
        setRates(FALLBACK_RATES);
      } finally {
        setRatesLoaded(true);
      }
    };

    load();
  }, []);

  const changeCurrency = (code) => {
    setCurrencyState(code);
    localStorage.setItem('asteri_currency', code);
  };

  const formatPrice = (thbPrice) => {
    const price     = parseFloat(thbPrice) || 0;
    const info      = CURRENCIES[currency];
    const rate      = rates[currency] ?? 1;
    const converted = price * rate;

    if (currency === 'THB') {
      return '฿' + Math.round(converted).toLocaleString();
    }
    if (currency === 'KRW' || currency === 'JPY') {
      return info.symbol + Math.round(converted).toLocaleString();
    }
    return info.symbol + converted.toFixed(2);
  };

  return (
    <CurrencyContext.Provider
      value={{ currency, changeCurrency, formatPrice, ratesLoaded }}
    >
      {children}
    </CurrencyContext.Provider>
  );
};

export const useCurrency = () => {
  const ctx = useContext(CurrencyContext);
  if (!ctx) throw new Error('useCurrency must be used inside <CurrencyProvider>');
  return ctx;
};
