from fastapi import FastAPI, HTTPException

app = FastAPI() 
items = []

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