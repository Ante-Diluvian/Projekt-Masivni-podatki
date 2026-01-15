#!/usr/bin/env python3

# python3 server.py          # Normal mode with graph
# python3 server.py --test   # Test mode with simulated data

import socket
import json
import signal
import sys
import math
import argparse
import threading
from datetime import datetime, timezone
from collections import deque
from pymongo import MongoClient
from bson import ObjectId

import matplotlib.pyplot as plt
import matplotlib.animation as animation
from matplotlib.lines import Line2D

# ============================================
# CONFIGURATION
# ============================================
HOST = '0.0.0.0'
PORT = 8080

# MongoDB nastavitve
MONGO_URI = ""
MONGO_DB = "test"

# Hardcoded vrednosti za workout
WORKOUT_NAME = "Running"
USER_ID = ObjectId("69667dd4825f9325c49de589")
GPS_ID = ObjectId("68469e313d8a9f70d6f9a749")

# Uporabnik podatki za izracun kalorij
USER_WEIGHT_KG = 70.0
MET_VALUE_RUNNING = 8.0

# Interval vzorcenja v sekundah
SAMPLE_INTERVAL_S = 0.2

# Graf nastavitve
GRAPH_HISTORY = 100  # Stevilo tock na grafu
# ============================================

# Globalne spremenljivke
running = True
accel_samples = []
start_time = None

# Podatki za graf (thread-safe)
graph_x = deque(maxlen=GRAPH_HISTORY)
graph_y = deque(maxlen=GRAPH_HISTORY)
graph_z = deque(maxlen=GRAPH_HISTORY)
graph_time = deque(maxlen=GRAPH_HISTORY)
graph_lock = threading.Lock()

def signal_handler(sig, frame):
    """Obdelaj Ctrl+C"""
    global running
    print("\n\nUstavljam streznik...")
    running = False
    plt.close('all')

def parse_accel_data(data_str):
    """Parsiraj accelerometer podatke iz JSON formata"""
    try:
        data = json.loads(data_str)
        return data.get('x'), data.get('y'), data.get('z')
    except json.JSONDecodeError:
        pass
    
    try:
        parts = data_str.strip().split(',')
        if len(parts) == 3:
            return float(parts[0]), float(parts[1]), float(parts[2])
    except (ValueError, IndexError):
        pass
    
    return None, None, None

def calculate_speed_from_accel(x, y, z):
    """Izracunaj hitrost iz accelerometer podatkov"""
    horizontal_accel = math.sqrt(x**2 + y**2)
    accel_ms2 = horizontal_accel * 9.81
    speed_ms = accel_ms2 * 2.0
    return speed_ms

def calculate_statistics(samples):
    """Izracunaj statistiko iz vzorcev"""
    if not samples:
        return 0.0, 0.0, 0.0
    
    speeds = []
    total_distance = 0.0
    
    for sample in samples:
        x, y, z = sample['x'], sample['y'], sample['z']
        speed = calculate_speed_from_accel(x, y, z)
        speeds.append(speed)
        total_distance += speed * SAMPLE_INTERVAL_S
    
    avg_speed = sum(speeds) / len(speeds) if speeds else 0.0
    max_speed = max(speeds) if speeds else 0.0
    
    return avg_speed, max_speed, total_distance

def calculate_calories(duration_s, avg_speed, weight_kg=USER_WEIGHT_KG, met_value=MET_VALUE_RUNNING):
    """Izracunaj porabljene kalorije"""
    duration_hours = duration_s / 3600.0
    adjusted_met = met_value * (1 + avg_speed / 10.0)
    calories = adjusted_met * weight_kg * duration_hours
    return round(calories, 2)

def save_to_mongodb(samples, start_time, end_time):
    """Shrani workout podatke v MongoDB"""
    try:
        client = MongoClient(MONGO_URI)
        db = client[MONGO_DB]
        
        avg_speed, max_speed, distance = calculate_statistics(samples)
        duration_s = (end_time - start_time).total_seconds()
        calories = calculate_calories(duration_s, avg_speed)
        
        print("\n" + "=" * 50)
        print("  WORKOUT STATISTIKA")
        print("=" * 50)
        print(f"  Stevilo vzorcev: {len(samples)}")
        print(f"  Trajanje: {duration_s:.1f} sekund")
        print(f"  Povprecna hitrost: {avg_speed:.2f} m/s")
        print(f"  Maksimalna hitrost: {max_speed:.2f} m/s")
        print(f"  Razdalja: {distance:.2f} m")
        print(f"  Porabljene kalorije: {calories:.2f} kcal")
        print("=" * 50)
        
        accelerometer_doc = {
            "avgSpeed": round(avg_speed, 2),
            "maxSpeed": round(max_speed, 2)
        }
        accel_result = db.accelerometers.insert_one(accelerometer_doc)
        accel_id = accel_result.inserted_id
        print(f"\n✓ Accelerometer shranjen: {accel_id}")
        
        workout_doc = {
            "name": WORKOUT_NAME,
            "user_id": USER_ID,
            "accelerometer": accel_id,
            "gps": GPS_ID,
            "startTimestamp": start_time,
            "endTimestamp": end_time,
            "duration": round(duration_s, 2),
            "caloriesBurned": calories,
            "distance": round(distance, 2)
        }
        workout_result = db.workouts.insert_one(workout_doc)
        print(f"✓ Workout shranjen: {workout_result.inserted_id}")
        
        client.close()
        return True
        
    except Exception as e:
        print(f"\n✗ Napaka pri shranjevanju v MongoDB: {e}")
        return False

def init_graph():
    """Inicializiraj graf"""
    plt.style.use('dark_background')
    fig, (ax1, ax2, ax3) = plt.subplots(3, 1, figsize=(10, 8))
    fig.suptitle('STM32 Accelerometer - Real-time Data', fontsize=14, fontweight='bold')
    
    # X os graf
    ax1.set_ylabel('X (g)', color='#ff6b6b', fontweight='bold')
    ax1.set_ylim(-2, 2)
    ax1.axhline(y=0, color='gray', linestyle='--', alpha=0.5)
    ax1.grid(True, alpha=0.3)
    line_x, = ax1.plot([], [], color='#ff6b6b', linewidth=2, label='X')
    ax1.legend(loc='upper right')
    
    # Y os graf
    ax2.set_ylabel('Y (g)', color='#4ecdc4', fontweight='bold')
    ax2.set_ylim(-2, 2)
    ax2.axhline(y=0, color='gray', linestyle='--', alpha=0.5)
    ax2.grid(True, alpha=0.3)
    line_y, = ax2.plot([], [], color='#4ecdc4', linewidth=2, label='Y')
    ax2.legend(loc='upper right')
    
    # Z os graf
    ax3.set_ylabel('Z (g)', color='#ffe66d', fontweight='bold')
    ax3.set_xlabel('Cas (vzorci)', fontweight='bold')
    ax3.set_ylim(-0.5, 2)
    ax3.axhline(y=1, color='gray', linestyle='--', alpha=0.5, label='1g (gravitacija)')
    ax3.grid(True, alpha=0.3)
    line_z, = ax3.plot([], [], color='#ffe66d', linewidth=2, label='Z')
    ax3.legend(loc='upper right')
    
    plt.tight_layout()
    
    return fig, (ax1, ax2, ax3), (line_x, line_y, line_z)

def update_graph(frame, lines, axes):
    """Posodobi graf z novimi podatki"""
    line_x, line_y, line_z = lines
    ax1, ax2, ax3 = axes
    
    with graph_lock:
        if len(graph_time) > 0:
            time_data = list(graph_time)
            x_data = list(graph_x)
            y_data = list(graph_y)
            z_data = list(graph_z)
            
            line_x.set_data(range(len(x_data)), x_data)
            line_y.set_data(range(len(y_data)), y_data)
            line_z.set_data(range(len(z_data)), z_data)
            
            # Prilagodi x os
            for ax in axes:
                ax.set_xlim(0, max(GRAPH_HISTORY, len(x_data)))
    
    return line_x, line_y, line_z

def tcp_receiver_thread():
    """Nit za sprejemanje TCP podatkov"""
    global running, accel_samples, start_time
    
    server_socket = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    server_socket.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
    
    try:
        server_socket.bind((HOST, PORT))
        server_socket.listen(1)
        server_socket.settimeout(1.0)
        
        print("=" * 50)
        print("  STM32 Accelerometer Data Server")
        print("=" * 50)
        print(f"  Poslusam na: {HOST}:{PORT}")
        print(f"  Ctrl+C za ustavitev in shranjevanje")
        print("=" * 50)
        print("\nCakam na ESP32 povezavo...")
        
        client_socket = None
        
        while running:
            if client_socket is None:
                try:
                    client_socket, client_address = server_socket.accept()
                    client_socket.settimeout(0.5)
                    print(f"\n✓ Povezan: {client_address[0]}:{client_address[1]}")
                    print("-" * 50)
                    
                    # Zacni nov workout
                    accel_samples = []
                    start_time = datetime.now(timezone.utc)
                    
                    # Pocisti graf
                    with graph_lock:
                        graph_x.clear()
                        graph_y.clear()
                        graph_z.clear()
                        graph_time.clear()
                    
                except socket.timeout:
                    continue
            
            try:
                data = client_socket.recv(1024)
                if not data:
                    print("\n✗ Odjemalec prekinil povezavo")
                    client_socket.close()
                    client_socket = None
                    continue
                
                data_str = data.decode('utf-8').strip()
                
                for line in data_str.split('\n'):
                    line = line.strip()
                    if not line:
                        continue
                    
                    x, y, z = parse_accel_data(line)
                    
                    if x is not None:
                        # Shrani vzorec
                        sample = {
                            'x': x,
                            'y': y,
                            'z': z,
                            'timestamp': datetime.now(timezone.utc)
                        }
                        accel_samples.append(sample)
                        
                        # Dodaj v graf buffer
                        with graph_lock:
                            graph_x.append(x)
                            graph_y.append(y)
                            graph_z.append(z)
                            graph_time.append(len(accel_samples))
                        
                        # Prikazi v terminalu
                        print(f"\rVzorcev: {len(accel_samples):5d} | X:{x:+.3f}g | Y:{y:+.3f}g | Z:{z:+.3f}g", end='')
                        
            except socket.timeout:
                continue
            except ConnectionResetError:
                print("\n✗ Povezava prekinjena")
                client_socket.close()
                client_socket = None
                
    except OSError as e:
        print(f"\nNapaka: {e}")
    finally:
        server_socket.close()
        
        if accel_samples and start_time:
            end_time = datetime.now(timezone.utc)
            print("\n\nShranjujem workout v MongoDB...")
            save_to_mongodb(accel_samples, start_time, end_time)
        
        print("\nStreznik ustavljen.")

def run_test_mode():
    """Testni nacin s simuliranimi podatki in grafom"""
    global accel_samples, start_time, running
    
    print("=" * 50)
    print("  TESTNI NACIN Z GRAFOM")
    print("=" * 50)
    
    # Inicializiraj graf
    fig, axes, lines = init_graph()
    
    start_time = datetime.now(timezone.utc)
    
    import random
    
    def generate_test_data(frame):
        """Generiraj testne podatke"""
        global accel_samples
        
        if not running or frame >= 100:
            return lines
        
        # Simuliraj tek
        x = random.uniform(-0.3, 0.3)
        y = random.uniform(-0.3, 0.3)
        z = random.uniform(0.9, 1.1)
        
        sample = {
            'x': x,
            'y': y,
            'z': z,
            'timestamp': datetime.now(timezone.utc)
        }
        accel_samples.append(sample)
        
        with graph_lock:
            graph_x.append(x)
            graph_y.append(y)
            graph_z.append(z)
            graph_time.append(len(accel_samples))
        
        print(f"\rVzorec {len(accel_samples):3d} | X:{x:+.3f}g | Y:{y:+.3f}g | Z:{z:+.3f}g", end='')
        
        return update_graph(frame, lines, axes)
    
    # Animacija
    ani = animation.FuncAnimation(
        fig, 
        generate_test_data, 
        frames=100,
        interval=100,
        blit=False,
        repeat=False
    )
    
    plt.show()
    
    # Shrani po koncu
    if accel_samples:
        end_time = datetime.now(timezone.utc)
        print("\n\nShranjujem v MongoDB...")
        if save_to_mongodb(accel_samples, start_time, end_time):
            print("\n✓ Test uspesno zakljucen!")

def run_normal_mode():
    """Normalni nacin z grafom"""
    global running
    
    signal.signal(signal.SIGINT, signal_handler)
    
    # Zazeni TCP receiver v loceni niti
    tcp_thread = threading.Thread(target=tcp_receiver_thread, daemon=True)
    tcp_thread.start()
    
    # Inicializiraj graf
    fig, axes, lines = init_graph()
    
    # Animacija grafa
    ani = animation.FuncAnimation(
        fig,
        update_graph,
        fargs=(lines, axes),
        interval=50,
        blit=False,
        cache_frame_data=False
    )
    
    try:
        plt.show()
    except KeyboardInterrupt:
        pass
    finally:
        running = False
        tcp_thread.join(timeout=2.0)

def main():
    parser = argparse.ArgumentParser(description='STM32 Accelerometer Server z MongoDB in grafom')
    parser.add_argument('--test', action='store_true', help='Zazeni v testnem nacinu')
    args = parser.parse_args()
    
    if args.test:
        run_test_mode()
    else:
        run_normal_mode()

if __name__ == "__main__":
    main()