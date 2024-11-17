import torch
from transformers import AutoTokenizer, AutoModelForSequenceClassification
from sklearn.feature_extraction.text import CountVectorizer, TfidfTransformer
import re

# Load the tokenizer and model
tokenizer = AutoTokenizer.from_pretrained("model")
model = AutoModelForSequenceClassification.from_pretrained("model")

# Initialize TF-IDF components
cv = CountVectorizer(tokenizer=lambda x: x.split())
tfidf_transformer = TfidfTransformer()

corpus = []
word2tfidf = {}


def clean_text(text):
    """
    Removes commas and quotation marks from the text.
    """
    # Remove commas and both single and double quotes
    cleaned = re.sub(r'[,"\'\']', "", text)
    return cleaned


def put_in_corpus(facts_and_arguments):
    global corpus
    src_sents = []
    for para in facts_and_arguments:
        # Clean the paragraph
        para = clean_text(para)
        sent = para.split("।")  # Split by sentence ending punctuation
        sent = [i for i in sent if len(i) != 0 and i.strip() != ""]
        src_sents.extend(sent)
    src_sents = list(filter(None, src_sents))
    corpus.extend(src_sents)
    if len(corpus) > 0:
        data2 = cv.fit_transform(corpus)
        tfidf_matrix = tfidf_transformer.fit_transform(data2)
        global word2tfidf
        word2tfidf = dict(zip(cv.get_feature_names_out(), tfidf_transformer.idf_))


def process(facts_and_arguments):
    ranked_sentences = []
    src_sents = []
    for para in facts_and_arguments:
        # Clean the paragraph
        para = clean_text(para)
        sent = para.split("।")
        sent = [i for i in sent if len(i) != 0 and i.strip() != ""]
        src_sents.extend(sent)

    sentences = list(filter(None, src_sents))

    if not sentences:
        return {"error": "No valid sentences found."}

    scores = []
    for sent in sentences:
        score = get_score(sent)
        scores.append(score)

    ranks = sorted(((scores[i], s) for i, s in enumerate(sentences)), reverse=True)
    ranked_sentences = [i[1] for i in ranks][:10]
    return {"ranked_sentences": ranked_sentences}


def get_score(sentence):
    words = sentence.split()
    score = 0
    for word in words:
        try:
            score += word2tfidf[word]
        except KeyError:
            pass
    return score


def predict_bail_score(sentences):
    # Tokenize sentences
    inputs = tokenizer(sentences, padding=True, truncation=True, return_tensors="pt")

    # Get model predictions
    with torch.no_grad():
        outputs = model(**inputs)
        logits = outputs.logits
        probabilities = torch.softmax(logits, dim=-1)
        bail_scores = probabilities[:, 1]

    # Normalize the scores to a range of 1-100
    normalized_scores = [int(score.item() * 100) for score in bail_scores]
    return normalized_scores