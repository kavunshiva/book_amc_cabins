from flask import Flask, request, render_template, jsonify
from book_cabins import available_cabins
from datetime import datetime, timedelta
from zoneinfo import ZoneInfo

app = Flask(__name__)

cache = {}

@app.route('/cabins', methods=['GET'])
def cabins():
    return render_template('cabins.html')

@app.route('/api/cabins', methods=['GET'])
def get_data():
    start_date = request.args.get('startDate')
    if invalid_start_date(start_date):
        return jsonify([])

    days = request.args.get('days', type=int)
    number_of_guests = request.args.get('numberOfGuests', type=int)
    cabin_names = tuple(request.args.getlist('cabinName'))
    data = cached_data(start_date, days, number_of_guests, cabin_names)
    return jsonify(data)

@app.route('/api/min_start_date', methods=['GET'])
def min_start_date():
    min_start_date = tomorrow().strftime('%Y-%m-%d')
    return jsonify({'minStartDate': min_start_date})

def cached_data(start_date, days, number_of_guests, cabin_names):
    key = (start_date, days, number_of_guests, cabin_names)
    now = datetime.now().timestamp()
    if not key in cache or now - cache[key]['timestamp'] > 900:
        cache[key] = {
            'data': available_cabins(start_date, days, number_of_guests,
                                     cabin_names, date_to_str=True),
            'timestamp': now
        }
    return cache[key]['data']

def tomorrow():
    return datetime.now(ZoneInfo('America/New_York')).date() + timedelta(days=1)

def invalid_start_date(start_date):
    return datetime.strptime(start_date, '%Y-%m-%d').date() < tomorrow()

if __name__ == "__main__":
    app.run(host='0.0.0.0')
