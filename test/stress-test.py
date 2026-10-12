import asyncio
import time
import aiohttp
import matplotlib.pyplot as plt

TARGET_URL = "http://localhost:8080/stream/1080p/topgun_maverick_trailer.mp4"
REQUESTS_PER_USER = 3        # Numero di richieste per utente
START_CLIENTS = 50
MAX_CLIENTS = 500
STEP = 50                    # Cresce di 50 in 50 fino a 500 client simultanei

client_counts = []
success_results = []
error_results = []
latency_results = []

async def run_large_chunk_burst_test(n, session):
    start_event = asyncio.Event()
    
    # 📦 CHUNK PIÙ LUNGO: Richiediamo blocchi da 5 MB anziché 512 KB (bytes=0-5242880)
    headers = {"Range": "bytes=0-5242880"}
    
    success_count = 0
    error_count = 0
    total_latency = 0.0

    async def simulate_client():
        nonlocal success_count, error_count, total_latency
        
        await start_event.wait()
        
        for _ in range(REQUESTS_PER_USER):
            start_time = time.perf_counter()
            try:
                # Timeout aumentato a 20s per gestire il download di chunk di dati più corposi
                async with session.get(TARGET_URL, headers=headers, timeout=20) as response:
                    await response.read()
                    latency = (time.perf_counter() - start_time) * 1000

                    if response.status in (200, 206):
                        success_count += 1
                        total_latency += latency
                    else:
                        error_count += 1
            except Exception:
                error_count += 1

    tasks = [asyncio.create_task(simulate_client()) for _ in range(n)]
    
    # 💥 PARTENZA SIMULTANEAMENTE
    start_event.set()
    await asyncio.gather(*tasks)

    avg_latency = (total_latency / success_count) if success_count > 0 else 0.0
    return success_count, error_count, avg_latency

async def main():
    print(f"🚀 AVVIO STRESS TEST (Chunk da 5MB, da {START_CLIENTS} a {MAX_CLIENTS} client simultanei)...\n")
    
    start_global = time.perf_counter()
    
    # Connettore ottimizzato con Keep-Alive per reggere il flusso massiccio di dati
    conn = aiohttp.TCPConnector(
        limit=1000,
        limit_per_host=800,
        force_close=False,
        enable_cleanup_closed=True
    )

    async with aiohttp.ClientSession(connector=conn) as session:
        for n in range(START_CLIENTS, MAX_CLIENTS + 1, STEP):
            print(f"⚡ Raffica simultanea da {n} client (download chunk 5MB)...")
            success, error, lat = await run_large_chunk_burst_test(n, session)
            
            client_counts.append(n)
            success_results.append(success)
            error_results.append(error)
            latency_results.append(lat)
            
            print(f"   -> Successi: {success} | Errori: {error} | Latenza media: {lat:.2f} ms\n")
            
            # Breve pausa per stabilizzare le socket di rete
            await asyncio.sleep(0.5)

    duration = time.perf_counter() - start_global
    print(f"\n⏱️ Test con chunk grandi completato in {duration:.3f} secondi!")

    # Generazione dei grafici finali
    print("📊 Generazione dei grafici di carico...")
    
    fig, axes = plt.subplots(1, 3, figsize=(18, 6))
    fig.suptitle(f"Stress Test (Chunk 5MB) - Da {START_CLIENTS} a {MAX_CLIENTS} Client Simultanei", fontsize=16, fontweight='bold', color='#e50914')

    # Grafico 1: Successi
    axes[0].plot(success_results, client_counts, color='#2ecc71', linewidth=2, marker='o', markersize=6)
    axes[0].set_title("Successi Totali (Chunk 5MB)")
    axes[0].set_xlabel("Numero di Successi")
    axes[0].set_ylabel("Client Simultanei (Y)")
    axes[0].grid(True, linestyle='--', alpha=0.6)

    # Grafico 2: Errori
    axes[1].plot(error_results, client_counts, color='#e74c3c', linewidth=2, marker='x', markersize=7)
    axes[1].set_title("Errori Totali (Chunk 5MB)")
    axes[1].set_xlabel("Numero di Errori")
    axes[1].set_ylabel("Client Simultanei (Y)")
    axes[1].grid(True, linestyle='--', alpha=0.6)

    # Grafico 3: Latenza
    axes[2].plot(latency_results, client_counts, color='#3498db', linewidth=2, marker='.', markersize=7)
    axes[2].set_title("Latenza Media (ms) (Chunk 5MB)")
    axes[2].set_xlabel("Latenza (ms)")
    axes[2].set_ylabel("Client Simultanei (Y)")
    axes[2].grid(True, linestyle='--', alpha=0.6)

    plt.tight_layout()
    plt.show()

if __name__ == "__main__":
    asyncio.run(main())