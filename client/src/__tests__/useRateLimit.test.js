// @vitest-environment jsdom
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import useRateLimit from '../hooks/useRateLimit';

beforeEach(() => {
  localStorage.clear();
  vi.useFakeTimers();
});

afterEach(() => {
  vi.useRealTimers();
});

describe('useRateLimit — initial state', () => {
  it('allows submission when no record exists in localStorage', () => {
    const { result } = renderHook(() => useRateLimit('test-form', 30));
    expect(result.current.canSubmit).toBe(true);
    expect(result.current.secondsLeft).toBe(0);
  });

  it('blocks submission if a cooldown record exists from a previous session', () => {
    // Simulate a submission that happened 5 seconds ago within a 30s cooldown
    localStorage.setItem('rl_test-form', String(Date.now() - 5000));

    const { result } = renderHook(() => useRateLimit('test-form', 30));
    expect(result.current.canSubmit).toBe(false);
    expect(result.current.secondsLeft).toBe(25);
  });

  it('allows submission if the stored timestamp is older than the cooldown', () => {
    // 31 seconds ago — cooldown (30s) has fully elapsed
    localStorage.setItem('rl_test-form', String(Date.now() - 31_000));

    const { result } = renderHook(() => useRateLimit('test-form', 30));
    expect(result.current.canSubmit).toBe(true);
    expect(result.current.secondsLeft).toBe(0);
  });
});

describe('useRateLimit — recordSubmission', () => {
  it('sets canSubmit to false immediately after recording', () => {
    const { result } = renderHook(() => useRateLimit('test-form', 30));

    act(() => {
      result.current.recordSubmission();
    });

    expect(result.current.canSubmit).toBe(false);
    expect(result.current.secondsLeft).toBe(30);
  });

  it('writes a timestamp to localStorage on recordSubmission', () => {
    const before = Date.now();
    const { result } = renderHook(() => useRateLimit('test-form', 30));

    act(() => {
      result.current.recordSubmission();
    });

    const stored = parseInt(localStorage.getItem('rl_test-form'), 10);
    expect(stored).toBeGreaterThanOrEqual(before);
    expect(stored).toBeLessThanOrEqual(Date.now());
  });

  it('counts down secondsLeft each second', () => {
    const { result } = renderHook(() => useRateLimit('test-form', 5));

    act(() => {
      result.current.recordSubmission();
    });
    expect(result.current.secondsLeft).toBe(5);

    act(() => {
      vi.advanceTimersByTime(1000);
    });
    expect(result.current.secondsLeft).toBe(4);

    act(() => {
      vi.advanceTimersByTime(1000);
    });
    expect(result.current.secondsLeft).toBe(3);
  });

  it('restores canSubmit to true after the cooldown expires', () => {
    const { result } = renderHook(() => useRateLimit('test-form', 3));

    act(() => {
      result.current.recordSubmission();
    });
    expect(result.current.canSubmit).toBe(false);

    act(() => {
      vi.advanceTimersByTime(3000);
    });
    expect(result.current.canSubmit).toBe(true);
    expect(result.current.secondsLeft).toBe(0);
  });
});

describe('useRateLimit — key isolation', () => {
  it('tracks separate cooldowns for different form keys', () => {
    const { result: form1 } = renderHook(() => useRateLimit('login', 30));
    const { result: form2 } = renderHook(() => useRateLimit('contact', 60));

    act(() => {
      form1.current.recordSubmission();
    });

    expect(form1.current.canSubmit).toBe(false);
    expect(form2.current.canSubmit).toBe(true);
  });
});
