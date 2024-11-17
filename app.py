from flask import Flask, request, render_template, redirect, url_for, jsonify
import ranking

app = Flask(__name__)

processed_results = {}

@app.route("/")
def home():
    return render_template("landing.html")

@app.route("/about")
def about():
    return render_template("about.html")

@app.route("/bail-prediction")
def bail_prediction():
    return render_template("bail-prediction.html")

@app.route("/process", methods=["POST"])
def process_data():
    try:
        data = request.get_json()
        if not data:
            return jsonify({"error": "No JSON data received."}), 400

        facts_and_arguments = data.get("text", {}).get("facts-and-arguments", [])
        print("facts_and_arguments:", facts_and_arguments)

        if not facts_and_arguments:
            return jsonify({"error": "No facts and arguments found in the input."}), 400

        ranked_sentences = ranking.process(facts_and_arguments)
        print("ranked_sentences data:", ranked_sentences)
        
        if 'ranked_sentences' not in ranked_sentences:
            return jsonify({"error": "Ranked sentences data is not in expected format."}), 500

        bail_score = ranking.predict_bail_score([ranked_sentences['ranked_sentences'][0]])
        prediction_result = "Granted" if bail_score[0] > 50 else "Dismissed"

        result_id = len(processed_results) + 1
        processed_results[result_id] = {
            'prediction_result': prediction_result,
            'bail_score': bail_score[0],
            'ranked_sentences': ranked_sentences['ranked_sentences']
        }

        return jsonify({"redirect": url_for('display_results', result_id=result_id)})

    except Exception as e:
        print("Error:", e)
        return jsonify({"error": str(e)}), 500

@app.route("/results")
def display_results():
    result_id = request.args.get('result_id', type=int)
    if result_id not in processed_results:
        return "No result data available. Please submit your request first.", 400

    result_data = processed_results[result_id]
    print("Result data:", result_data)
    return render_template(
        "results.html",
        result=result_data['prediction_result'],
        bail_score=result_data['bail_score'],
        ranked_sentences=result_data['ranked_sentences']
    )

if __name__ == "__main__":
    app.run(debug=True)
