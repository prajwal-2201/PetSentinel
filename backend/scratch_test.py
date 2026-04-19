import warnings
import numpy as np
from sklearn.model_selection import StratifiedKFold, cross_val_score
from sklearn.pipeline import Pipeline, FeatureUnion
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.svm import SVC
from sklearn.neural_network import MLPClassifier
from sklearn.ensemble import VotingClassifier, RandomForestClassifier
from sklearn.preprocessing import LabelEncoder
from ml.dataset import get_dataset

warnings.filterwarnings("ignore")

texts, labels = get_dataset()
le = LabelEncoder()
y = le.fit_transform(labels)
cv = StratifiedKFold(n_splits=5, shuffle=True, random_state=42)

def eval_pipeline(name, clf):
    word_tfidf = TfidfVectorizer(analyzer="word", ngram_range=(1, 2), max_features=2000, sublinear_tf=True, min_df=1)
    char_tfidf = TfidfVectorizer(analyzer="char_wb", ngram_range=(3, 5), max_features=2000, sublinear_tf=True, min_df=1)
    feat = FeatureUnion([("word", word_tfidf), ("char", char_tfidf)])
    pipe = Pipeline([("features", feat), ("clf", clf)])
    scores = cross_val_score(pipe, texts, y, cv=cv, scoring="f1_weighted", n_jobs=-1)
    print(f"{name:20s}: {scores.mean():.4f} +/- {scores.std():.4f}")

lr = LogisticRegression(C=1.0, class_weight="balanced")
svm = SVC(kernel="linear", class_weight="balanced", probability=True)
mlp = MLPClassifier(hidden_layer_sizes=(100,), max_iter=1000, alpha=0.01)
rf = RandomForestClassifier(n_estimators=300, max_depth=10, class_weight="balanced")
ensemble = VotingClassifier(estimators=[('lr', lr), ('svm', svm), ('mlp', mlp)], voting='soft')

eval_pipeline("LogisticRegression", lr)
eval_pipeline("SVM (Linear)", svm)
eval_pipeline("MLP", mlp)
eval_pipeline("RandomForest", rf)
eval_pipeline("Voting(LR+SVM+MLP)", ensemble)
