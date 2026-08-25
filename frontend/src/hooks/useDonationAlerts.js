import { useEffect, useRef, useState } from 'react';
import { supabase } from '../lib/supabase.js';

const ALERT_DURATION_MS = 7000;

// Écoute les INSERT sur donation_public_feed et les rejoue un par un — une
// rafale de dons ne doit jamais en écraser (§10.4 / §11 du guide).
export function useDonationAlerts() {
  const [queue, setQueue] = useState([]);
  const [current, setCurrent] = useState(null);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    const channel = supabase
      .channel('donation-alerts')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'donation_public_feed',
      }, ({ new: donation }) => {
        setQueue((q) => [...q, donation]);
      })
      .subscribe((status) => setConnected(status === 'SUBSCRIBED'));

    return () => supabase.removeChannel(channel);
  }, []);

  useEffect(() => {
    if (current || queue.length === 0) return;
    const next = queue[0];
    setCurrent(next);
    setQueue((q) => q.slice(1));
    const timer = setTimeout(() => setCurrent(null), ALERT_DURATION_MS);
    return () => clearTimeout(timer);
  }, [queue, current]);

  return { current, pending: queue.length, connected };
}
