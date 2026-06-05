import os
import json
from pymongo import MongoClient
from dotenv import load_dotenv

load_dotenv()

def ingest_regions_into_compass():
    # 1. Connect straight to your local MongoDB Compass instance
    mongo_uri = os.getenv("MONGO_URI", "mongodb://localhost:27017/wanderindia")
    client = MongoClient(mongo_uri)
    db = client.get_database()
    
    print("Purging historical collection caches from MongoDB Compass space...")
    db.states.delete_many({})
    db.regions.delete_many({})
    
    # Resolve catalog file path safely regardless of execution directory
    base_dir = os.path.dirname(os.path.abspath(__file__))
    catalog_path = os.path.join(base_dir, 'destinations_catalog.json')
    
    if not os.path.exists(catalog_path):
        catalog_path = "destinations_catalog.json"
        
    if not os.path.exists(catalog_path):
        print(f"CRITICAL ERROR: Data catalog file could not be found at: {catalog_path}")
        return

    print(f"Reading structural entries from source catalog mapping: {catalog_path}")
    with open(catalog_path, 'r', encoding='utf-8') as file:
        catalog_data = json.load(file)

    states_bulk_buffer = []
    regions_bulk_buffer = []

    # 2. Iterate directly through your data structures
    for state_record in catalog_data:
        state_id_token = f"st_{state_record['state_id']}"
        state_name_str = state_record['state_name']
        state_slug_key = state_name_str.lower().replace(" ", "-").replace("&", "and")
        
        region_indexing_references = []
        
        for region_block in state_record.get('regions', []):
            region_id_token = f"reg_{region_block['region_id']}"
            region_name_str = region_block['name']
            region_slug_key = region_name_str.lower().replace(" ", "-").replace("&", "and").replace(",", "").replace("'", "")
            
            # Extract your baseline price parameters safely from the region level
            base_projected_cost = int(region_block.get('estimated_cost_per_person', 7500))
            
            # Map exact mathematical breakdown matrices to fulfill cost panels flawlessly
            cost_breakdown_matrix = {
                "accommodation": int(base_projected_cost * 0.40),
                "food": int(base_projected_cost * 0.25),
                "transport": int(base_projected_cost * 0.20),
                "activities": int(base_projected_cost * 0.15)
            }
            
            # Compile nested places collection data exactly as presented in your dataset
            processed_places = []
            for place in region_block.get('places', []):
                processed_places.append({
                    "id": place['id'],
                    "name": place['name'],
                    "description": place.get('description', ''),
                    "image1": place.get('image1', ''),
                    "image2": place.get('image2', ''),
                    "image3": place.get('image3', ''),
                    "image4": place.get('image4', ''),
                    "coordinates": place.get('coordinates', {"lat": 20.0, "lng": 77.0})
                })
            
            # Use safe .get() strings to prevent KeyError crashes if region banners are missing
            fallback_banner = "https://images.unsplash.com/photo-1524492412937-b28074a5d7da?q=80&w=1200"
            
            flattened_region_document = {
                "region_id": region_id_token,
                "name": region_name_str,
                "slug": region_slug_key,
                "state": state_name_str,
                "state_slug": state_slug_key,
                "description": region_block.get('description', ''),
                "image1": region_block.get('image1', fallback_banner),
                "image2": region_block.get('image2', fallback_banner),
                "image3": region_block.get('image3', fallback_banner),
                "image4": region_block.get('image4', fallback_banner),
                "trip_type": region_block.get('trip_type', 'family').lower(),
                "budget_category": region_block.get('budget_category', 'mid-budget').lower(),
                "duration_category": region_block.get('duration_category', '1 - 3 days'),
                "estimated_cost_per_person": base_projected_cost,
                "cost_breakdown": cost_breakdown_matrix,
                "places": processed_places
            }
            
            regions_bulk_buffer.append(flattened_region_document)
            
            region_indexing_references.append({
                "region_id": region_id_token,
                "name": region_name_str,
                "slug": region_slug_key,
                "description": region_block.get('description', '')
            })

        states_bulk_buffer.append({
            "_id": state_id_token,
            "state_name": state_name_str,
            "slug": state_slug_key,
            "regions": region_indexing_references
        })

    # 3. Write data blocks straight into local machine database instances
    if states_bulk_buffer:
        db.states.insert_many(states_bulk_buffer)
    if regions_bulk_buffer:
        db.regions.insert_many(regions_bulk_buffer)

    print("==========================================================================")
    print("                 COMPASS REGION-BASED SEEDING COMPLETE                    ")
    print("==========================================================================")
    print(f" -> States Ingested: {len(states_bulk_buffer)}")
    print(f" -> Region Cards Created: {len(regions_bulk_buffer)}")
    print(" WanderIndia database workspace is online and ready for regional discovery!")

if __name__ == '__main__':
    ingest_regions_into_compass()