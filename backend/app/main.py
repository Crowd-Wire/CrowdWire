from fastapi import FastAPI
from pydantic import BaseModel


app = FastAPI()

db = []

class User(BaseModel):
	name: str
	age: int
	money: float



@app.get("/")
def index():
	return {'key': 'value'}


@app.get("/users")
def get_users():
	return db

@app.post("/users")
def create_user(user: User):  #only accepts objects that are similar to the User class defined above
	db.append(user.dict())    #converts to a dictionary so that each one is separated 
	return db[-1]			  #returns the newly created user

@app.delete("/users/{user_id}")
def delete_user(user_id: int):
	db.pop(user_id)			  #deletes the user at the given position
	return {}				  #returns an empty dict

@app.get("/users/{user_id}")
def get_user(user_id: int):
	return db[user_id-1]

