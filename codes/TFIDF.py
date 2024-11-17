# Import necessary libraries
from tqdm.auto import tqdm
import re
import string
from sklearn.feature_extraction.text import TfidfVectorizer
import json
import pandas as pd
import os
from sklearn.feature_extraction.text import CountVectorizer, TfidfTransformer

# Global corpus to store sentences
corpus = []
ranked_sentences_summary = []  # To store final ranked sentences summary


# Prepare the TF-IDF transformer
def tok(s):
    return s.split()


cv = CountVectorizer(tokenizer=tok)
tfidf_transformer = TfidfTransformer()

word2tfidf = {}


def put_in_corpus(file):
    global corpus
    print(f"Current file: {file}")
    path = r"data\whole\\"
    path += file
    with open(path, encoding="utf-8") as f:
        data = json.load(f)
    df = pd.DataFrame(data)
    for i, row in tqdm(df.iterrows(), total=len(df), desc="Adding sentences to corpus"):
        src_sents = []
        paras = df.loc[i]["text"]["facts-and-arguments"]
        for para in paras:
            sent = para.split("।")
            sent = [i for i in sent if len(i) != 0 and i != " "]
            src_sents.extend(sent)
        src_sents = list(filter(None, src_sents))
        src_sents1 = []
        for sent in src_sents:
            try:
                sent = "".join([i for i in sent if not i.isdigit()])  # Remove digits
            except:
                print(sent)
            src_sents1.append(sent)
        src_sents = src_sents1
        corpus.extend(src_sents)

    # Perform TF-IDF vectorization after the corpus is populated
    if len(corpus) > 0:
        print(f"Corpus size: {len(corpus)}")
        # print(f"Corpus sample: {corpus[:5]}")

        # Vectorize and calculate TF-IDF
        data2 = cv.fit_transform(corpus)
        tfidf_matrix = tfidf_transformer.fit_transform(data2)
        global word2tfidf
        word2tfidf = dict(zip(cv.get_feature_names_out(), tfidf_transformer.idf_))

        print("TF-IDF vectorization complete.")
    else:
        print("The corpus is empty. Please check the data extraction process.")


def process(file):
    print(f"Processing file: {file}")
    path = r"data\whole\\"
    path += file
    with open(path, encoding="utf-8") as f:
        data = json.load(f)
    df = pd.DataFrame(data)
    ranked_sentences = []

    for i, row in tqdm(df.iterrows(), total=len(df), desc="Ranking sentences"):
        src_sents = df.loc[i]["text"]["facts-and-arguments"]
        src_sents = [i.split("।") for i in src_sents]
        src_sents = [i for sublist in src_sents for i in sublist]
        src_sents = [i for i in src_sents if len(i) != 0 and i != " "]
        src_sents = list(filter(None, src_sents))
        src_sents1 = []
        sentences = src_sents
        scores = []
        for sent in sentences:
            scores.append(get_score(sent))
        ranks = sorted(((scores[i], s) for i, s in enumerate(sentences)), reverse=True)
        ranks = [i[1] for i in ranks]
        ranked_sentences.append(ranks)

    df = df.head(len(ranked_sentences))
    df["ranked-sentences"] = [i[:10] for i in ranked_sentences]

    # Save JSON
    file_base = file.replace(".json", "")
    path = r"summarization\\ranked_data\\"
    path += file_base
    path += ".json"
    df.to_json(
        path,
        orient="records",
        force_ascii=False,
        indent=4,
    )

    # Display a final summary
    # display_summary()


# Get the score for a sentence based on the TF-IDF values
def get_score(sentence):
    words = sentence.split()
    score = 0
    for word in words:
        try:
            score += word2tfidf[word]
        except KeyError:
            pass
    return score


if __name__ == "__main__":
    files = []
    directory = r"data\whole"
    for file in os.listdir(directory):
        if file.endswith(".json"):
            files.append(file)
    for file in files:
        put_in_corpus(file)
        process(file)
