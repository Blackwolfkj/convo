import os
import json
import io
import pypdf
from flask import Flask, jsonify, request, send_file, render_template

app = Flask(__name__)

PDF_PATH = r"C:\Users\user\Downloads\convocations_etudiants.pdf"
INDEX_PATH = r"c:\Users\user\Downloads\CONVOCATION\student_index.json"

# Charger l'index des étudiants
student_map = {}
try:
    if os.path.exists(INDEX_PATH):
        with open(INDEX_PATH, 'r', encoding='utf-8') as f:
            data = json.load(f)
            student_map = data.get("students", {})
        print(f"Index chargé : {len(student_map)} étudiants.")
    else:
        print(f"ATTENTION : Le fichier d'index {INDEX_PATH} n'existe pas encore.")
except Exception as e:
    print(f"Erreur lors du chargement de l'index : {e}")

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/api/student/<student_id>')
def get_student(student_id):
    student = student_map.get(student_id)
    if not student:
        return jsonify({"success": False, "error": "Étudiant non trouvé"}), 404
    return jsonify({
        "success": True,
        "student_id": student_id,
        "nom": student.get("nom", ""),
        "prenom": student.get("prenom", ""),
        "pages_count": len(student.get("pages", []))
    })

@app.route('/api/download/<student_id>')
def download_pdf(student_id):
    student = student_map.get(student_id)
    if not student:
        return "Étudiant non trouvé", 404
    
    if not os.path.exists(PDF_PATH):
        return "Fichier PDF source introuvable sur le serveur", 500
        
    try:
        reader = pypdf.PdfReader(PDF_PATH)
        writer = pypdf.PdfWriter()
        
        pages = student.get("pages", [])
        for page_idx in pages:
            if page_idx < len(reader.pages):
                writer.add_page(reader.pages[page_idx])
            else:
                return "Index de page hors limites", 500
                
        pdf_buffer = io.BytesIO()
        writer.write(pdf_buffer)
        pdf_buffer.seek(0)
        
        filename = f"convocation_{student_id}.pdf"
        return send_file(
            pdf_buffer,
            mimetype='application/pdf',
            as_attachment=False,
            download_name=filename
        )
    except Exception as e:
        return f"Erreur lors de la génération du PDF : {str(e)}", 500

if __name__ == '__main__':
    app.run(debug=True, port=5000)
