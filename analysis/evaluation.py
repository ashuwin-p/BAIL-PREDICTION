import json
import pandas as pd
from sklearn.metrics import accuracy_score, classification_report, confusion_matrix
import ranking  # Assuming this module contains the `process` and `predict_bail_score` functions

test_file_path = r"U:\LegalAnalytics\LA_BailPrediction_Product\test1.json"

# Load test data from test.json with UTF-8 encoding
with open(test_file_path, 'r', encoding='utf-8') as file:
    test_data = json.load(file)

# Convert test data to a DataFrame with 'facts-and-arguments' and 'judge-opinion' as separate columns
df = pd.DataFrame([{
    'id': entry['id'],
    'district': entry['district'],
    'facts_and_arguments': ' '.join(entry['text'].get('facts-and-arguments', [])),
    'judge_opinion': ' '.join(entry['text'].get('judge-opinion', [])),
    'label': entry['label']
} for entry in test_data])

print(df)

# Process 'facts-and-arguments' column to get ranked sentences
df['ranked_sentences'] = df['facts_and_arguments'].apply(lambda text: ranking.process([text])['ranked_sentences'][0])

# Predict bail scores
df['bail_score'] = ranking.predict_bail_score(df['ranked_sentences'])

# Convert bail scores to binary predictions (e.g., >50 means "Granted")
df['predictions'] = df['bail_score'].apply(lambda score: 1 if score > 50 else 0)

# Extract labels
df['labels'] = df['label']

# Print evaluation metrics
print("Accuracy Score:", accuracy_score(df['labels'], df['predictions']))
print("Classification Report:\n", classification_report(df['labels'], df['predictions']))
print("Confusion Matrix:\n", confusion_matrix(df['labels'], df['predictions']))
