from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI() 
items = []

# origins = [
#     # Add later
# ]

app.add_middleware(
    CORSMiddleware,

# Because Extension is not published, it wasn't given a permanent extension ID from the browser:
    # allow_origins=origins,
    # allow_credentials=True,

# Temporary solution:
    allow_origins=["*"],
    allow_credentials=False,

    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def root(): 
    return {"Hello": "World"}


@app.post("/items")
def create_item(item: str):
    items.append(item)
    return items

@app.get("/items/{item_id}")
def get_item(item_id: int) -> str:
    if item_id in range(len(items)):
        return items[item_id]
    else:
        raise HTTPException(
            status_code=404, 
            detail=f"Item {item_id} is not found in the list"
        )

@app.get("/items")
def list_items(limit: int = 10):
    return items[0:limit]