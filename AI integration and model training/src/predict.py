"""
Emotion Detection Module

Author: Team InnerEcho-AI

Description:
This module loads a pre-trained Transformer model
and predicts the user's emotion from text.
"""

from transformers import pipeline


# Load model only once
emotion_classifier = pipeline(
    task="text-classification",
    model="j-hartmann/emotion-english-distilroberta-base",
    top_k=None
)


def predict_emotion(text: str):

    """
    Predict emotion from user text.

    Parameters
    ----------
    text : str

    Returns
    -------
    dict
    """

    prediction = emotion_classifier(text)

    scores = prediction[0]

    top_prediction = max(scores, key=lambda x: x["score"])

    return {

        "input_text": text,

        "emotion": top_prediction["label"],

        "confidence": round(top_prediction["score"] * 100, 2),

        "all_predictions": scores

    }


def print_result(result):

    print("\n========== Emotion Prediction ==========")

    print("Input :", result["input_text"])

    print("Emotion :", result["emotion"])

    print("Confidence :", result["confidence"], "%")

    print("\nAll Scores")

    print("-"*30)

    for item in result["all_predictions"]:

        print(f"{item['label']:12} {round(item['score']*100,2)} %")


if __name__ == "__main__":

    print("=" * 50)
    print("Welcome to InnerEcho-AI Emotion Detection")
    print("=" * 50)

    text = input("\nEnter your thoughts: ")

    result = predict_emotion(text)

    print("\n========== Prediction ==========")
    print("Input :", result["input_text"])
    print("Emotion :", result["emotion"])
    print("Confidence :", result["confidence"], "%")

    print("\nAll Scores")
    print("-" * 30)

    for item in result["all_predictions"]:
        print(f"{item['label']:10} {round(item['score']*100,2)} %")