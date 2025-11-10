import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
from pymongo import MongoClient
import json
import sys

# 🔹 Connect to MongoDB
try:
    client = MongoClient("mongodb://localhost:27017/")
    db = client["learnnova"]
except Exception as e:
    print(json.dumps({"error": f"MongoDB connection failed: {e}"}))
    sys.exit(1)

# 🔹 Load Data
users = list(db.users.find({}, {"username": 1, "feedback": 1}))
courses = list(db.courses.find({}, {"_id": 1, "title": 1, "tags": 1}))

if not courses:
    print(json.dumps({"error": "No courses found"}))
    sys.exit(1)
if not users:
    print(json.dumps({"error": "No users found"}))
    sys.exit(1)

# 🔹 Convert to DataFrame
course_df = pd.DataFrame(courses)

# Safety checks
if "title" not in course_df.columns:
    course_df["title"] = ""
if "tags" not in course_df.columns:
    course_df["tags"] = [[] for _ in range(len(course_df))]

course_df["title"] = course_df["title"].fillna("")
course_df["tags"] = course_df["tags"].apply(lambda t: t if isinstance(t, list) else [])
course_df["text"] = course_df["title"] + " " + course_df["tags"].apply(lambda x: " ".join(x))
course_df = course_df[course_df["text"].str.strip() != ""]

if course_df.empty:
    print(json.dumps({"error": "No valid course text found"}))
    sys.exit(1)

# 🔹 Build TF-IDF Model
vectorizer = TfidfVectorizer(stop_words="english")
tfidf_matrix = vectorizer.fit_transform(course_df["text"])

# 🔹 Recommendation Function
def recommend_for_user(username):
    user = next((u for u in users if u["username"] == username), None)
    if not user:
        return {"error": f"User '{username}' not found"}
    if not user.get("feedback"):
        return {"error": f"No feedback found for '{username}'"}

    liked_ids = [f["courseId"] for f in user["feedback"] if f.get("liked")]
    if not liked_ids:
        return {"error": f"No liked courses for '{username}'"}

    liked_courses = course_df[course_df["_id"].astype(str).isin(liked_ids)]
    if liked_courses.empty:
        return {"error": f"Liked courses not found in DB"}

    liked_text = " ".join(liked_courses["text"].tolist())
    user_vec = vectorizer.transform([liked_text])

    sim_scores = cosine_similarity(user_vec, tfidf_matrix)[0]
    course_df["similarity"] = sim_scores
    top_courses = course_df.sort_values(by="similarity", ascending=False).head(5)

    return top_courses[["_id", "title", "similarity"]].to_dict(orient="records")

# 🔹 Run from terminal
if __name__ == "__main__":
    if len(sys.argv) < 2:
        print(json.dumps({"error": "Username missing"}))
        sys.exit(1)

    username = sys.argv[1]
    print(json.dumps(recommend_for_user(username), indent=2))
