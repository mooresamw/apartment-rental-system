from flask import Flask, jsonify, request, make_response
from flask_cors import CORS, cross_origin
import firebase_admin
from firebase_admin import credentials, firestore

# database
cred = credentials.Certificate('key.json')
firebase_admin.initialize_app(cred)
db = firestore.client()

app = Flask(__name__)
#CORS(app)
CORS(app, resources={
    r"/api/*": {
        "origins": "*",
        "methods": ["GET", "POST", "PATCH", "OPTIONS", "PUT"],
        "allow_headers": ["Content-Type"],
        "expose_headers": ["Access-Control-Allow-Origin"],
    }
}, supports_credentials=True)
app.config['CORS_HEADERS'] = 'application/json'

# api route to get all the requests
@app.route('/api/requests', methods=['GET'])
def get_requests():
    requests_ref = db.collection('requests')
    docs = requests_ref.stream()
    print(docs)
    reqs = []
    for doc in docs:
        req_data = doc.to_dict()
        reqs.append(req_data)
    return jsonify(reqs)

# api route to get all the tenants
@app.route('/api/tenants/', methods=['GET'])
def get_tenants():
    tenants_ref = db.collection('tenants')
    docs = tenants_ref.stream()
    tenants = []
    for doc in docs:
        tenant_data = doc.to_dict()
        tenants.append(tenant_data)
    return jsonify(tenants)

# api route to get requests by apartment number
@app.route('/api/requests_by_apt/<apt>', methods=['GET'])
def get_requests_by_apt(apt):
    requests_ref = db.collection('requests')
    docs = requests_ref.where('apartmentNumber', '==', apt).stream()

    reqs = []
    for doc in docs:
        req_data = doc.to_dict()
        reqs.append(req_data)

    return jsonify(reqs)

# api route to update task status
@app.route('/api/update_request/<request_id>', methods=['POST', 'OPTIONS'])
def update_request_status(request_id):
    if request.method == 'OPTIONS':
        response = make_response()
        response.headers.add('Access-Control-Allow-Origin', '*')
        response.headers.add('Access-Control-Allow-Headers', 'Content-Type')
        response.headers.add('Access-Control-Allow-Methods', 'POST')
        return response

    requests_ref = db.collection('requests')
    doc = requests_ref.where('id', '==', request_id).limit(1).get()
    
    if not doc:
        return jsonify({'error': 'Request not found'}), 404
        
    updates = request.get_json(force=True)
    doc[0].reference.update(updates)
    return jsonify({'message': 'Request updated successfully'}), 200

# api route to add a comment to a request and send to the db
@app.route('/api/add_comment/<request_id>', methods=['POST', 'OPTIONS'])
def add_comment(request_id):
    if request.method == 'OPTIONS':
        response = make_response()
        response.headers.add('Access-Control-Allow-Origin', '*')
        response.headers.add('Access-Control-Allow-Headers', 'Content-Type')
        response.headers.add('Access-Control-Allow-Methods', 'POST')
        return response

    requests_ref = db.collection('requests')
    doc = requests_ref.where('id', '==', request_id).limit(1).get()
    
    if not doc:
        return jsonify({'error': 'Request not found'}), 404
        
    updates = request.get_json(force=True)
    doc[0].reference.update(updates)
    return jsonify({'message': 'Request updated successfully'}), 200


# api route to add a request to the db
@app.route('/api/data', methods=['POST', 'OPTIONS'])
def receive_data():
    if request.method == 'OPTIONS':
        response = make_response()
        response.headers.add('Access-Control-Allow-Origin', 'http://localhost:3000')
        response.headers.add('Access-Control-Allow-Headers', 'Content-Type')
        response.headers.add('Access-Control-Allow-Methods', 'POST')
        return response
        
    data = request.get_json(force=True)
    print("Data received:", data)

    # Add the request to the Firestore DB
    requests_ref = db.collection('requests')
    requests_ref.add(data)
    return jsonify({"message": "Data received successfully!"}), 200

# api route to add a tenant to the db
@app.route('/api/add_tenant', methods=['POST', 'OPTIONS'])
def add_tenant():
    if request.method == 'OPTIONS':
        response = make_response()
        response.headers.add('Access-Control-Allow-Origin', 'http://localhost:3000')
        response.headers.add('Access-Control-Allow-Headers', 'Content-Type')
        response.headers.add('Access-Control-Allow-Methods', 'POST')
        return response
        
    data = request.get_json(force=True)
    print("Data received:", data)

    # Add the request to the Firestore DB
    tenants_ref = db.collection('tenants')
    tenants_ref.add(data)
    return jsonify({"message": "Data received successfully!"}), 200

# api route to remove tenant from db
@app.route('/api/remove_tenant/<tenant_id>', methods=['DELETE', 'OPTIONS'])
def remove_tenant(tenant_id):
    if request.method == 'OPTIONS':
        response = make_response()
        response.headers.add('Access-Control-Allow-Origin', 'http://localhost:3000')
        response.headers.add('Access-Control-Allow-Headers', 'Content-Type')
        response.headers.add('Access-Control-Allow-Methods', 'DELETE, OPTIONS')
        return response
    
    tenants_ref = db.collection('tenants')
    doc = tenants_ref.where('tenant_id', '==', tenant_id).limit(1).get()

    if not doc:
        return jsonify({'Error: ': 'Tenant ID not found in database.'})
    
    # try to delete the tenant from the DB
    try:
        doc[0].reference.delete()
        return jsonify({'message': 'Tenant successfully removed'}), 200
    except Exception as e:
        return jsonify({'Error': str(e)}), 500

# api route to send apartment number edit to db
@app.route('/api/update_tenant_apt/<tenant_id>', methods=['POST', 'OPTIONS'])
def update_tenant_apt(tenant_id):
    if request.method == 'OPTIONS':
        response = make_response()
        response.headers.add('Access-Control-Allow-Origin', 'http://localhost:3000')
        response.headers.add('Access-Control-Allow-Headers', 'Content-Type')
        response.headers.add('Access-Control-Allow-Methods', 'DELETE, OPTIONS')
        return response
    
    tenants_ref = db.collection('tenants')
    doc = tenants_ref.where('tenant_id', '==', tenant_id).limit(1).get()
    updates = request.get_json(force=True)
    if not doc:
        return jsonify({'Error: ': 'Tenant ID not found in database.'})
    
    # try to update the apartment number in the DB
    try:
        doc[0].reference.update(updates)
        return jsonify({'message': 'Tenant successfully moved apartments.'}), 200
    except Exception as e:
        return jsonify({'Error': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True, port=8080)