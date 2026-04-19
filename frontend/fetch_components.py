import urllib.request
import os

components_dir = "src/components"
os.makedirs(components_dir, exist_ok=True)

urls = {
    "PetTransition.html": "https://contribution.usercontent.google.com/download?c=CgthaWRhX2NvZGVmeBJ7Eh1hcHBfY29tcGFuaW9uX2dlbmVyYXRlZF9maWxlcxpaCiVodG1sXzg4ZWI0YzJmYjBkYTRmNGJiNTFiOGFiZmUzNjk5MzEwEgsSBxDPgLnLwgIYAZIBIwoKcHJvamVjdF9pZBIVQhMyMjgwNjA1Mjk4MTQwODUxOTIw&filename=&opi=89354086",
    "EmergencyTriage.html": "https://contribution.usercontent.google.com/download?c=CgthaWRhX2NvZGVmeBJ7Eh1hcHBfY29tcGFuaW9uX2dlbmVyYXRlZF9maWxlcxpaCiVodG1sXzg0MThhMDExNzJiYzRlMDFiYzRiNGMyOTRhN2VjZmQyEgsSBxDPgLnLwgIYAZIBIwoKcHJvamVjdF9pZBIVQhMyMjgwNjA1Mjk4MTQwODUxOTIw&filename=&opi=89354086"
}

for filename, url in urls.items():
    filepath = os.path.join(components_dir, filename)
    print(f"Downloading {filename}...")
    urllib.request.urlretrieve(url, filepath)
    print(f"Saved to {filepath}")
