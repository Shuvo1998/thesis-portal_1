import sys
import json
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

import pymongo

# 1️⃣ Command Line থেকে File Path
file_path = sys.argv[1]

# 2️⃣ নতুন ফাইলের Content পড়া
with open(file_path, 'r', encoding='utf-8') as f:
    new_content = f.read()

# 3️⃣ MongoDB Connect
client = pymongo.MongoClient("mongodb://localhost:27017/")
db = client["thesisDB"]
collection = db["theses"]

# 4️⃣ সব পুরোনো ফাইল এর Content আনো
texts = [new_content]

for doc in collection.find():
    try:
        with open(doc['filePath'], 'r', encoding='utf-8') as f:
            texts.append(f.read())
    except:
        pass  # যদি কোনো ফাইল না মিলে, Error Handle

# 5️⃣ TF-IDF + Cosine Similarity
vectorizer = TfidfVectorizer().fit_transform(texts)
similarity_matrix = cosine_similarity(vectorizer[0:1], vectorizer[1:])

max_similarity = max(similarity_matrix[0])

# 6️⃣ JSON Output
result = {'max_similarity': float(max_similarity)}
print(json.dumps(result))
