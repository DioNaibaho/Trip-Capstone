from fastapi import FastAPI
from pydantic import BaseModel
from typing import List
import random

app = FastAPI(title="Trip Capstone AI Engine")

# --- 1. STRUKTUR DATA INPUT ---
class Location(BaseModel):
    id: str
    name: str
    duration: int  # Durasi kunjungan (menit)

class RouteRequest(BaseModel):
    start_point: str
    locations: List[Location]
    time_matrix: List[List[int]]

# --- 2. KOMPONEN ALGORITMA GENETIKA (GA) ---

def calculate_fitness(chromosome: List[int], time_matrix: List[List[int]], locations: List[Location]) -> int:
    """Menghitung total waktu perjalanan + durasi wisata"""
    full_route = [0] + chromosome
    total_time = 0
    for i in range(len(full_route) - 1):
        from_idx = full_route[i]
        to_idx = full_route[i+1]
        total_time += time_matrix[from_idx][to_idx]
        if to_idx != 0:
            total_time += locations[to_idx - 1].duration
    return total_time

def create_initial_population(pop_size: int, num_destinations: int) -> List[List[int]]:
    """Membuat populasi awal berisi rute-rute acak"""
    base_route = list(range(1, num_destinations + 1))
    population = []
    for _ in range(pop_size):
        route = base_route.copy()
        random.shuffle(route)
        population.append(route)
    return population

def tournament_selection(population: List[List[int]], time_matrix: List[List[int]], locations: List[Location], k: int = 3) -> List[int]:
    """Memilih rute terbaik dari sampel acak (Tournament Selection)"""
    selected = random.sample(population, k)
    selected.sort(key=lambda chromo: calculate_fitness(chromo, time_matrix, locations))
    return selected[0]

def crossover(parent1: List[int], parent2: List[int]) -> List[int]:
    """Menggabungkan rute parent1 dan parent2 (Ordered Crossover)"""
    size = len(parent1)
    if size <= 1:
        return parent1.copy()
    
    start, end = sorted(random.sample(range(size), 2))
    child = [None] * size
    child[start:end+1] = parent1[start:end+1]
    
    p2_items = [item for item in parent2 if item not in child]
    p2_idx = 0
    for i in range(size):
        if child[i] is None:
            child[i] = p2_items[p2_idx]
            p2_idx += 1
    return child

def mutate(chromosome: List[int], mutation_rate: float = 0.2) -> List[int]:
    """Menukar 2 lokasi wisata secara acak (Swap Mutation)"""
    if random.random() < mutation_rate and len(chromosome) > 1:
        idx1, idx2 = random.sample(range(len(chromosome)), 2)
        chromosome[idx1], chromosome[idx2] = chromosome[idx2], chromosome[idx1]
    return chromosome

def run_genetic_algorithm(data: RouteRequest, pop_size: int = 20, generations: int = 50):
    num_destinations = len(data.locations)
    if num_destinations == 0:
        return {"optimized_route_names": [data.start_point], "estimated_total_time_minutes": 0}
    
    # 1. Inisialisasi Populasi
    population = create_initial_population(pop_size, num_destinations)
    
    best_chromosome = None
    best_fitness = float('inf')
    
    # 2. Iterasi Generasi
    for _ in range(generations):
        new_population = []
        
        # Simpan rute terbaik sejauh ini (Elitism)
        current_best = min(population, key=lambda c: calculate_fitness(c, data.time_matrix, data.locations))
        current_best_fit = calculate_fitness(current_best, data.time_matrix, data.locations)
        if current_best_fit < best_fitness:
            best_fitness = current_best_fit
            best_chromosome = current_best
            
        new_population.append(current_best)
        
        # Buat individu baru hingga populasi penuh
        while len(new_population) < pop_size:
            p1 = tournament_selection(population, data.time_matrix, data.locations)
            p2 = tournament_selection(population, data.time_matrix, data.locations)
            child = crossover(p1, p2)
            child = mutate(child)
            new_population.append(child)
            
        population = new_population
        
    # Susun rute hasil optimasi
    route_names = [data.start_point] + [data.locations[i - 1].name for i in best_chromosome]
    
    return {
        "optimized_route_indices": [0] + best_chromosome,
        "optimized_route_names": route_names,
        "estimated_total_time_minutes": best_fitness
    }

# --- 3. ENDPOINT API ---
@app.get("/")
def read_root():
    return {"message": "AI Engine is running!", "status": "Ready"}

@app.post("/optimize")
def optimize_route(data: RouteRequest):
    result = run_genetic_algorithm(data)
    return {"message": "Optimization successful", "data": result}