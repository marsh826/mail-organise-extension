from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
# import google.auth
from googleapiclient.discovery import build
# from googleapiclient.errors import HttpError
from pydantic import BaseModel
import requests
import json

# response = requests.get("http://localhost:11434/api/tags")
# print(response.status_code)
# print(response.json())

class Email(BaseModel):
    id: str
    threadId: str
    category: str | None
    from_: str | None
    to: str | None
    subject: str | None
    date: str | None
    snippet: str | None
    body: str | None

app = FastAPI() 
items = []
emails = []

origins = [
    # Add later
    "moz-extension://email-auto-organiser@testapp.com",
    "http:"
]

app.add_middleware(
    CORSMiddleware,

# Because Extension is not published, it wasn't given a permanent extension ID from the browser:
    # allow_origins=origins,
    # allow_origin_regex=r"https?://.*",
    # allow_credentials=True,

# Temporary solution for development:
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


@app.post("/emails")
def get_emails(package: list[Email]):
    emails.extend(package)
    return emails

@app.get("/list")
def get_email_list():
    return emails


OLLAMA_URL = "http://localhost:11434/api/chat"

def ask_ollama(prompt: str):
    response = requests.post(
        OLLAMA_URL,
        json={
            "model": "gemma3:4B",
            "messages": [ 
                {
                    "role": "user",
                    "content": prompt
                }
            ],
            "stream": False
        }
    )
    response.raise_for_status()
    return response.json()

def classify_email(email):
    prompt = f"""
        Categorize this email into exactly one category:

        - Shopping
        - Finance
        - Work
        - Social
        - Travel
        - Other

        From: {email.from_}
        Subject: {email.subject}
        ID : {email.id}

        Body:
        {email.body[:4000]}

        Return only the category name.
    """
    return ask_ollama(prompt)

@app.get("/ollama-test")
def ollama_test():
    return ask_ollama("Reply with this: Ollama connection succesfful.")

@app.post("/ollama-run")
def assign_label():
    result_list = []
    for i in range(min(5, len(emails))):
        data = classify_email(emails[i])
        result = {
            "email": emails[i].id,
            # "category": classify_email(emails[i])
            "category": data["message"]["content"]
        }
        result_list.append(result)
    return result_list
        