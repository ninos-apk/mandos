import dns from "node:dns";
import { lookup, Resolver } from "node:dns/promises";

let pending: Promise<void> | undefined;

export function ensureSupabaseDns() {
  pending ??= configureDns().catch((error) => {
    pending = undefined;
    throw error;
  });
  return pending;
}

async function configureDns() {
  const hostname = new URL(process.env.NEXT_PUBLIC_SUPABASE_URL!).hostname;
  const resolver = new Resolver({ timeout: 2500, tries: 2 });
  resolver.setServers(["1.1.1.1", "8.8.8.8"]);

  let addresses: string[];
  try {
    addresses = await resolver.resolve4(hostname);
    if (addresses.length === 0) throw new Error("Keine IPv4-Adresse gefunden.");
  } catch (fallbackError) {
    try {
      await lookup(hostname);
      return;
    } catch {
      throw new Error(
        `DNS konnte ${hostname} nicht auflösen. Prüfe die Netzwerk- und DNS-Verbindung; unter WSL hilft oft "wsl --shutdown" in PowerShell.`,
        { cause: fallbackError },
      );
    }
  }

  // Node's fetch uses dns.lookup internally. Override only the Supabase host in this process.
  const originalLookup = dns.lookup;
  Object.defineProperty(dns, "lookup", {
    configurable: true,
    writable: true,
    value: (...args: unknown[]) => {
      if (args[0] === hostname) args[0] = addresses[0];
      return Reflect.apply(originalLookup, dns, args);
    },
  });
}
