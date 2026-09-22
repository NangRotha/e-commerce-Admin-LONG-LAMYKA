import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { getWsUrl } from "../api/client";

const RealtimeContext = createContext(null);

const RECONNECT_MS = 2500;
const HEARTBEAT_MS = 20000;

/**
 * Admin Panel — ការតភ្ជាប់ WebSocket តែមួយ (single connection) ចែករំលែកទូទាំងកម្មវិធី
 *
 * ទទួលព្រឹត្តិការណ៍ពី Backend (ពេលមានការផ្លាស់ប្តូរទិន្នន័យ)៖
 *   products_changed | orders_changed | slides_changed | alerts_changed | settings_changed |
 *   milestones_changed | discounts_changed | users_changed | categories_changed
 *
 * ✅ Auto-sync: ពេល Reconnect ឬពេល Admin ត្រឡប់មក tab វិញ -> ទាញយកទិន្នន័យថ្មីភ្លាមៗ
 * ✅ Multi-type support: អាចស្តាប់ព្រឹត្តិការណ៍ច្រើនក្នុងពេលតែមួយ `useRealtime(["orders_changed", "products_changed"], load)`
 * ✅ Local emit: `emitLocal(type)` សម្រាប់ refresh ភ្លាមៗក្នុង tab ពេលកែប្រែទិន្នន័យ
 */
export function RealtimeProvider({ children }) {
  const [connected, setConnected] = useState(false);
  const listenersRef = useRef(new Map()); // type -> Set(handler)
  const wsRef = useRef(null);
  const retryRef = useRef(null);
  const heartbeatRef = useRef(null);
  const closedRef = useRef(false);
  const hasConnectedOnceRef = useRef(false);

  // Notify registered listeners (including wildcard "*")
  const notify = useCallback((type, message) => {
    const listeners = listenersRef.current;

    // Notify specific type listeners
    const specificSet = listeners.get(type);
    if (specificSet) {
      specificSet.forEach((fn) => {
        try {
          fn(message);
        } catch (err) {
          console.error(`[WS error handling ${type}]`, err);
        }
      });
    }

    // Also notify wildcard "*" listeners (if any)
    const wildcardSet = listeners.get("*");
    if (wildcardSet) {
      wildcardSet.forEach((fn) => {
        try {
          fn(message);
        } catch (err) {
          console.error(`[WS error handling *]`, err);
        }
      });
    }
  }, []);

  // Dispatch an update to all active listeners (useful on reconnect/focus)
  const syncAllListeners = useCallback(() => {
    const listeners = listenersRef.current;
    listeners.forEach((set, type) => {
      if (type === "*") return;
      set.forEach((fn) => {
        try {
          fn({ type, message: "Sync update on reconnect", sync: true });
        } catch {
          /* ignore notification errors */
        }
      });
    });
  }, []);

  useEffect(() => {
    closedRef.current = false;
    const currentListeners = listenersRef.current;

    const clearTimers = () => {
      if (retryRef.current) clearTimeout(retryRef.current);
      if (heartbeatRef.current) clearInterval(heartbeatRef.current);
    };

    const connect = () => {
      if (closedRef.current) return;
      clearTimers();

      // Clean up previous socket if existing
      if (wsRef.current) {
        try {
          wsRef.current.onopen = null;
          wsRef.current.onmessage = null;
          wsRef.current.onclose = null;
          wsRef.current.onerror = null;
          wsRef.current.close();
        } catch {
          /* ignore close errors */
        }
        wsRef.current = null;
      }

      let ws;
      try {
        const url = getWsUrl("/ws/products");
        ws = new WebSocket(url);
      } catch {
        retryRef.current = setTimeout(connect, RECONNECT_MS);
        return;
      }
      wsRef.current = ws;

      ws.onopen = () => {
        setConnected(true);
        // If this is a reconnect, immediately trigger all screens to re-fetch!
        if (hasConnectedOnceRef.current) {
          syncAllListeners();
        }
        hasConnectedOnceRef.current = true;

        // Keep-alive heartbeat
        heartbeatRef.current = setInterval(() => {
          try {
            if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
              wsRef.current.send("ping");
            } else if (!closedRef.current) {
              connect();
            }
          } catch {
            if (!closedRef.current) connect();
          }
        }, HEARTBEAT_MS);
      };

      ws.onmessage = (e) => {
        let data = e.data;
        if (typeof data === "string") {
          try {
            data = JSON.parse(data);
          } catch {
            return; // ping / non-JSON -> ignore
          }
        }
        if (data && typeof data.type === "string") {
          notify(data.type, data);
        }
      };

      ws.onclose = () => {
        setConnected(false);
        if (heartbeatRef.current) clearInterval(heartbeatRef.current);
        wsRef.current = null;
        if (!closedRef.current) {
          retryRef.current = setTimeout(connect, RECONNECT_MS);
        }
      };

      ws.onerror = () => {
        try {
          if (wsRef.current) wsRef.current.close();
        } catch {
          /* ignore error handler close error */
        }
      };
    };

    connect();

    // Reconnect & sync immediately when tab becomes visible or network reconnects
    const handleReactivate = () => {
      if (document.visibilityState === "visible" || navigator.onLine) {
        if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
          connect();
        } else {
          // Socket is open, but tab was inactive -> re-sync data to ensure fresh state
          syncAllListeners();
        }
      }
    };

    document.addEventListener("visibilitychange", handleReactivate);
    window.addEventListener("online", handleReactivate);
    window.addEventListener("focus", handleReactivate);

    return () => {
      closedRef.current = true;
      clearTimers();
      document.removeEventListener("visibilitychange", handleReactivate);
      window.removeEventListener("online", handleReactivate);
      window.removeEventListener("focus", handleReactivate);
      try {
        if (wsRef.current) wsRef.current.close();
      } catch {
        /* ignore on unmount */
      }
      wsRef.current = null;
      currentListeners.clear();
    };
  }, [notify, syncAllListeners]);

  const subscribe = useCallback((type, handler) => {
    let set = listenersRef.current.get(type);
    if (!set) {
      set = new Set();
      listenersRef.current.set(type, set);
    }
    set.add(handler);
    return () => {
      const s = listenersRef.current.get(type);
      if (s) {
        s.delete(handler);
        if (s.size === 0) listenersRef.current.delete(type);
      }
    };
  }, []);

  const emitLocal = useCallback(
    (type, data = {}) => {
      notify(type, { type, ...data, local: true });
    },
    [notify]
  );

  const value = useMemo(
    () => ({ connected, subscribe, emitLocal, syncAllListeners }),
    [connected, subscribe, emitLocal, syncAllListeners]
  );

  return (
    <RealtimeContext.Provider value={value}>{children}</RealtimeContext.Provider>
  );
}

/**
 * ចុះឈ្មោះស្តាប់ព្រឹត្តិការណ៍ real-time តាម type (អាចជា string ឬ array នៃ strings)។
 * Returns: connected (bool)
 */
export function useRealtime(type, handler) {
  const ctx = useContext(RealtimeContext);
  const handlerRef = useRef(handler);

  useEffect(() => {
    handlerRef.current = handler;
  }, [handler]);

  const subscribe = ctx?.subscribe;

  useEffect(() => {
    if (!type || !subscribe) return;
    const types = Array.isArray(type) ? type : [type];
    const unsubs = types.map((t) =>
      subscribe(t, (message) => {
        if (handlerRef.current) handlerRef.current(message);
      })
    );
    return () => unsubs.forEach((u) => u());
  }, [type, subscribe]);

  return ctx?.connected ?? false;
}

export function useEmitRealtime() {
  const ctx = useContext(RealtimeContext);
  return ctx?.emitLocal || (() => {});
}
