from flask import Flask, request, jsonify
app = Flask(__name__)

@app.route('/appointment', methods=['POST'])
def appointment():
    data = request.form.to_dict() or request.get_json() or {}
    print('Appointment received:', data)
    return jsonify({"status":"ok","received":data})

@app.route('/newsletter', methods=['POST'])
def newsletter():
    data = request.form.to_dict() or request.get_json() or {}
    print('Newsletter signup:', data)
    return jsonify({"status":"ok","received":data})

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)

# Example test commands (do not execute inside this Python file):
# PowerShell:
# Invoke-RestMethod -Method Post -Uri http://localhost:5000/appointment -Body @{name='Test'; email='a@b.com'}
# curl:
# curl -X POST http://localhost:5000/appointment -H "Content-Type: application/json" -d '{"name":"Test","email":"a@b.com"}'
# Python requests:
# import requests
# requests.post('http://localhost:5000/appointment', json={'name':'Test','email':'a@b.com'})