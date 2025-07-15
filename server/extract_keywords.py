import sys
import json
from collections import Counter
import re

# 1️⃣ Command Line থেকে File Path
file_path = sys.argv[1]

# 2️⃣ ফাইল পড়া
with open(file_path, 'r', encoding='utf-8') as f:
    text = f.read().lower()

# 3️⃣ শব্দগুলা বের করা (Word >= 4 Letters)
words = re.findall(r'\b[a-zA-Z]{4,}\b', text)

# 4️⃣ সবচেয়ে common 10 keyword বের করা
common = Counter(words).most_common(10)

# 5️⃣ শুধু Word List
keywords = [word for word, freq in common]

# 6️⃣ JSON Output
print(json.dumps(keywords))
