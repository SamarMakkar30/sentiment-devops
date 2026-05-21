# model/train.py

from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.pipeline import Pipeline
import joblib
import os

# Training data — simple examples
texts = [
    "I love this product",
    "This is amazing",
    "Fantastic work",
    "I really enjoyed it",
    "Best thing ever",
    "Great experience",
    "Wonderful service",
    "Highly recommend",
    "So happy with this",
    "Excellent quality",
    "I hate this",
    "This is terrible",
    "Worst product ever",
    "Very disappointed",
    "Complete waste of money",
    "Awful experience",
    "Do not buy this",
    "Never again",
    "Very bad quality",
    "Totally broken",
]

labels = [1, 1, 1, 1, 1, 1, 1, 1, 1, 1,   # 1 = positive
          0, 0, 0, 0, 0, 0, 0, 0, 0, 0]    # 0 = negative

# Build a pipeline: TF-IDF vectorizer + Logistic Regression
model = Pipeline([
    ('vectorizer', TfidfVectorizer()),
    ('classifier', LogisticRegression())
])

# Train the model
model.fit(texts, labels)

# Save the model to a file
os.makedirs('model', exist_ok=True)
joblib.dump(model, 'model/model.pkl')

print("Model trained and saved to model/model.pkl")