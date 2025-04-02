from flask import Flask, request, jsonify, render_template, send_from_directory
from flask_cors import CORS
import sqlite3
from datetime import datetime
import subprocess
import os

app = Flask(__name__, static_folder='static', template_folder='templates')
CORS(app)

# Initialize database
def init_db():
    os.makedirs('./static/js/dist/js', exist_ok=True)
    conn = sqlite3.connect('crm.db')
    c = conn.cursor()

    # Create leads table
    c.execute('''
    CREATE TABLE IF NOT EXISTS leads (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT,
        phone TEXT,
        company TEXT,
        status TEXT DEFAULT 'new',
        created_at TEXT NOT NULL
    )
    ''')

    # Create notes table
    c.execute('''
    CREATE TABLE IF NOT EXISTS notes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        lead_id INTEGER NOT NULL,
        content TEXT NOT NULL,
        created_at TEXT NOT NULL,
        FOREIGN KEY (lead_id) REFERENCES leads (id)
    )
    ''')

    conn.commit()
    conn.close()

init_db()

# Compile TypeScript files
def compile_typescript():
    try:
        # Compile all TS files using tsconfig
        subprocess.run(['tsc', '--project', 'tsconfig.json'], check=True)
        print("TypeScript compilation complete")
    except (subprocess.SubprocessError, FileNotFoundError) as e:
        print(f"Warning: TypeScript compilation failed: {e}")

# Compile TypeScript files on startup
compile_typescript()

# Routes
@app.route('/')
def index():
    return render_template('index.html')

@app.route('/leads')
def leads_page():
    return render_template('leads.html')

@app.route('/lead/<int:lead_id>')
def lead_detail_page(lead_id):
    return render_template('lead-detail.html')

# Serve JS files (compiled from TS)
@app.route('/static/dist/js/<path:filename>')
def serve_js(filename):
    return send_from_directory('static/dist/js', filename)

@app.route('/static/css/<path:filename>')
def serve_css(filename):
    return send_from_directory('static/css', filename)

# API Routes
@app.route('/api/leads', methods=['GET'])
def get_leads():
    conn = sqlite3.connect('crm.db')
    conn.row_factory = sqlite3.Row
    c = conn.cursor()

    c.execute('SELECT * FROM leads ORDER BY created_at DESC')
    leads = [dict(row) for row in c.fetchall()]

    conn.close()
    return jsonify(leads)

@app.route('/api/leads', methods=['POST'])
def create_lead():
    data = request.json
    conn = sqlite3.connect('crm.db')
    c = conn.cursor()

    c.execute(
        'INSERT INTO leads (name, email, phone, company, status, created_at) VALUES (?, ?, ?, ?, ?, ?)',
        (data.get('name'), data.get('email'), data.get('phone'), data.get('company'),
         data.get('status', 'new'), datetime.now().isoformat())
    )

    conn.commit()
    lead_id = c.lastrowid
    conn.close()

    return jsonify({'id': lead_id, 'message': 'Lead created successfully'})

@app.route('/api/leads/<int:lead_id>', methods=['GET'])
def get_lead(lead_id):
    conn = sqlite3.connect('crm.db')
    conn.row_factory = sqlite3.Row
    c = conn.cursor()

    c.execute('SELECT * FROM leads WHERE id = ?', (lead_id,))
    lead = dict(c.fetchone() or {})

    if lead:
        c.execute('SELECT * FROM notes WHERE lead_id = ? ORDER BY created_at DESC', (lead_id,))
        notes = [dict(row) for row in c.fetchall()]
        lead['notes'] = notes

    conn.close()
    return jsonify(lead)

@app.route('/api/leads/<int:lead_id>', methods=['PUT'])
def update_lead(lead_id):
    data = request.json
    conn = sqlite3.connect('crm.db')
    c = conn.cursor()

    c.execute(
        'UPDATE leads SET name = ?, email = ?, phone = ?, company = ?, status = ? WHERE id = ?',
        (data.get('name'), data.get('email'), data.get('phone'),
         data.get('company'), data.get('status'), lead_id)
    )

    conn.commit()
    conn.close()

    return jsonify({'message': 'Lead updated successfully'})

@app.route('/api/leads/<int:lead_id>/notes', methods=['POST'])
def add_note(lead_id):
    data = request.json
    conn = sqlite3.connect('crm.db')
    c = conn.cursor()

    c.execute(
        'INSERT INTO notes (lead_id, content, created_at) VALUES (?, ?, ?)',
        (lead_id, data.get('content'), datetime.now().isoformat())
    )

    conn.commit()
    note_id = c.lastrowid
    conn.close()

    return jsonify({'id': note_id, 'message': 'Note added successfully'})

@app.route('/api/notes/<int:note_id>', methods=['PUT'])
def update_note(note_id):
    data = request.json
    conn = sqlite3.connect('crm.db')
    c = conn.cursor()

    c.execute(
        'UPDATE notes SET content = ? WHERE id = ?',
        (data.get('content'), note_id)
    )

    conn.commit()
    conn.close()

    return jsonify({'message': 'Note updated successfully'})

@app.route('/api/notes/<int:note_id>', methods=['DELETE'])
def delete_note(note_id):
    conn = sqlite3.connect('crm.db')
    c = conn.cursor()

    c.execute('DELETE FROM notes WHERE id = ?', (note_id,))

    conn.commit()
    conn.close()

    return jsonify({'message': 'Note deleted successfully'})

@app.route('/api/leads/<int:lead_id>', methods=['DELETE'])
def delete_lead(lead_id):
    conn = sqlite3.connect('crm.db')
    c = conn.cursor()

    # First delete all notes for this lead
    c.execute('DELETE FROM notes WHERE lead_id = ?', (lead_id,))

    # Then delete the lead
    c.execute('DELETE FROM leads WHERE id = ?', (lead_id,))

    conn.commit()
    conn.close()

    return jsonify({'message': 'Lead deleted successfully'})

if __name__ == '__main__':
    app.run(debug=True)
