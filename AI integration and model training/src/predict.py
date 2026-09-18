"""
Emotion Detection Module

Author: Team InnerEcho-AI

Description:
This module loads a pre-trained Transformer model
and predicts the user's emotion from text.
"""

from transformers import pipeline

# Load the final emotion classification model
emotion_classifier = pipeline(
    "text-classification",
    model="SamLowe/roberta-base-go_emotions",
    top_k=None
)

print("✅ Emotion Detection Model Loaded Successfully")


def predict_emotion(text):

    predictions = emotion_classifier(text)

    scores = predictions[0]

    # Find highest-confidence emotion
    top_prediction = max(
        scores,
        key=lambda x: x["score"]
    )

    return {
        "input_text": text,
        "emotion": top_prediction["label"],
        "confidence": round(
            top_prediction["score"] * 100, 2
        ),
        "all_predictions": scores
    }


# Test the function
if __name__ == "__main__":

    user_text = input("Enter your thoughts: ")

    result = predict_emotion(user_text)

    print("\n========== Prediction ==========")
    print("Input:", result["input_text"])
    print("Emotion:", result["emotion"])
    print("Confidence:", result["confidence"], "%")